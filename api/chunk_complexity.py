# Imports
import os
import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch
from tqdm import tqdm
import torch.nn as nn
from tqdm import tqdm
import sys
import warnings
from torch.utils.data import Dataset
import json
from torch.utils.data import Dataset, DataLoader
import pandas as pd

# Set tokenizers parallelism according to your needs
os.environ["TOKENIZERS_PARALLELISM"] = "false"

if not sys.warnoptions:
    warnings.simplefilter("ignore")

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)
torch.cuda.manual_seed_all(RANDOM_SEED)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

# Define the model class
class transformer_reg(torch.nn.Module):
    def __init__(self, model_name):
        super(transformer_reg, self).__init__()
        self.embeddings = AutoModel.from_pretrained(model_name, output_hidden_states = True)
        self.final = nn.Linear(self.embeddings.config.hidden_size, 1, bias = True)
        self.dropout = nn.Dropout(0.3)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x, x_mask, token_type_ids):
        embed = self.embeddings(x,x_mask, token_type_ids = token_type_ids)[1]
        embed = self.dropout(embed)
        embed = self.final(embed)
        y_pred = self.sigmoid(embed)
        return y_pred.view(y_pred.shape[0])

# Define df to dataset function 
def get_dataset(df, tokenizer):
    sentences_1 = df.sentence.values
    sentences_2 = df.token.values
    labels = df.complexity.values
    input_ids = []
    attention_masks = []
    token_type_ids = []

    # For every sentence...
    for sent_idx in tqdm(range(len(sentences_1))):
        # inp = sentences_1[sent_idx] + '[SEP]'+ sentences_2[sent_idx]
        # `encode_plus` will:
        #   (1) Tokenize the sentence.
        #   (2) Prepend the `[CLS]` token to the start.
        #   (3) Append the `[SEP]` token to the end.
        #   (4) Map tokens to their IDs.
        #   (5) Pad or truncate the sentence to `max_length`
        #   (6) Create attention masks for [PAD] tokens.
        encoded_dict = tokenizer(
                            sentences_1[sent_idx],                      # Input to encode.
                            sentences_2[sent_idx],
                            add_special_tokens = True, # To Add '[CLS]' and '[SEP]'
                            max_length = 256,           # tokenizer.model_max_length
                            truncation = True,
                            pad_to_max_length = True,
                            return_attention_mask = True,   # Construct attn. masks.
                            return_token_type_ids = True,
                            return_tensors = 'pt',     # Return pytorch tensors.
                    )
        
        # Add the encoded sentence to the list.    
        input_ids.append(encoded_dict['input_ids'])

        token_type_ids.append(encoded_dict['token_type_ids'])
        
        # And its attention mask (simply differentiates padding from non-padding).
        attention_masks.append(encoded_dict['attention_mask'])

    # Convert the lists into tensors.
    input_ids = torch.cat(input_ids, dim=0)
    token_type_ids = torch.cat(token_type_ids, dim=0)
    attention_masks = torch.cat(attention_masks, dim=0)
    labels = torch.tensor(labels)

    # Combine the training inputs into a CustomTextDataset.
    return CustomTextDataset(input_ids, attention_masks, token_type_ids, labels, sentences_1, sentences_2)

# Define the custom dataset class
class CustomTextDataset(Dataset):
    def __init__(self, input_ids, attention_masks, token_type_ids, labels, sentences_1, sentences_2):
        self.input_ids = input_ids
        self.attention_masks = attention_masks
        self.token_type_ids = token_type_ids
        self.labels = labels
        self.sentences_1 = sentences_1
        self.sentences_2 = sentences_2

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return {
            'input_ids': self.input_ids[idx],
            'attention_mask': self.attention_masks[idx],
            'token_type_ids': self.token_type_ids[idx],
            'labels': self.labels[idx],
            'sentence_1': self.sentences_1[idx],
            'sentence_2': self.sentences_2[idx]
        }
        
# Function to clean and chunk passage
def clean_and_chunk_passage(passage, max_length=50):
    # Cleaning the passage
    passage = passage.replace('\n\n', ' ').replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    words = passage.split()
    chunk_list = []
    current_chunk = ""
    
    for word in words:
        if len(word) > max_length:
            # Split the long word and handle both parts
            part_length = max_length - 1  # Reserve one space for the hyphen
            first_part = word[:part_length] + '-'
            remaining_part = word[part_length:]

            # Add first part to the current chunk if it fits, otherwise push current chunk and reset
            if len(current_chunk) + len(first_part) <= max_length:
                current_chunk += first_part + " "
            else:
                chunk_list.append(current_chunk.strip())
                current_chunk = first_part + " "
            
            # Reinsert the remaining part back into the list of words to handle in the next iteration
            words.insert(words.index(word) + 1, remaining_part)
        else:
            # Normal word handling
            if len(current_chunk) + len(word) <= max_length:
                current_chunk += word + " "
            else:
                chunk_list.append(current_chunk.strip())
                current_chunk = word + " "
    
    # Handle the last chunk if any remains
    if current_chunk:
        chunk_list.append(current_chunk.strip())
    
    return chunk_list

class TextChunkDataset(Dataset):
    def __init__(self, chunks, tokenizer, max_length=256):
        self.tokenizer = tokenizer
        self.chunks = chunks
        self.max_length = max_length

    def __len__(self):
        return len(self.chunks)

    def __getitem__(self, idx):
        chunk = self.chunks[idx]
        encoded_input = self.tokenizer.encode_plus(
            chunk,
            chunk,  # Using chunk twice for simplicity, adjust as needed
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_token_type_ids=True,
            return_tensors='pt'
        )
        return {
            'input_ids': encoded_input['input_ids'].squeeze(0),
            'attention_mask': encoded_input['attention_mask'].squeeze(0),
            'token_type_ids': encoded_input['token_type_ids'].squeeze(0)
        }
        
def get_llm_scores(model, dataloader, device):
    model.to(device)
    model.eval()
    predictions = []

    with torch.no_grad():
        for batch in dataloader:
            inputs = {
                'x': batch['input_ids'].to(device),
                'x_mask': batch['attention_mask'].to(device),
                'token_type_ids': batch['token_type_ids'].to(device)
            }
            outputs = model(**inputs)
            predictions.extend(outputs.cpu().numpy())

    return predictions

# Number of characters in longest word
def char_of_longest_word(chunk):
    words = chunk.split()
    return  max(len(word) for word in words) if words else 0

# Complexity score derived from the longest word
def longest_word_complexity(chunk):
    x = char_of_longest_word(chunk)
    return 1/50 * x

# Get the longest word complexity scores
def get_longest_word_complexity_scores(chunk_list):
    char_of_longest_word_list = [char_of_longest_word(chunk) for chunk in chunk_list]
    longest_word_complexity_scores = [longest_word_complexity(chunk) for chunk in chunk_list]
    return longest_word_complexity_scores

def compute_chunk_complexity(passage, model, tokenizer, device='cuda'):
    # Clean and chunk passage
    chunk_list = clean_and_chunk_passage(passage)

    # Assume `tokenizer` and `max_length` are defined
    chunk_dataset = TextChunkDataset(chunk_list, tokenizer, max_length=256)
    chunk_loader = DataLoader(chunk_dataset, batch_size=10, shuffle=False)

    # Calculate complexity scores and combine for total complexity
    llm_scores = get_llm_scores(model, chunk_loader, device)
    lw_scores = get_longest_word_complexity_scores(chunk_list)
    total_complexity_scores = [x + y for x, y in zip(llm_scores, lw_scores)]
    
    return chunk_list, total_complexity_scores

if __name__ == "__main__":
    ### CAN CHANGE TO ANY TEXT ###
    # Load a preloaded text
    preloaded_texts = json.load(open('/vol/bitbucket/kh123/llm/classification/preloaded_text.json'))
    passage = preloaded_texts['text_1']['content']
    
    # Load a passage with increasing difficulty
    varied_passage = """
        Tom eats really plain rice each day for lunch.
        Jane writes persuasive essays each and every day.
        Across continents, great birds migrate seasonally.
        The moon's gravity significantly shapes our tides.
        A plethora of philosophers fervently debate this.
    """
    
    ### KEEP CODE BELOW ### (can change locations of the code below)
    # Set device to cuda
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    
    # Load the tokenizer
    model_name = "bert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Load the model
    loaded_model = transformer_reg(model_name).to(device)
    loaded_model.load_state_dict(torch.load(f"/vol/bitbucket/kh123/llm/classification/abhi1nandy2-modified/our_approach_results/best_model_multi_1.pt"))
    loaded_model.to(device)
    loaded_model.eval()

    # Compute the complexity of the chunks
    results_df = compute_chunk_complexity(passage, loaded_model, tokenizer, device)

    # Optional print statement
    print(results_df)
    
    

    