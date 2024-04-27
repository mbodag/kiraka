import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import random


DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# model for question-answer generation
model_qa = "potsawee/t5-large-generation-race-QuestionAnswer"
tokenizer_qa = AutoTokenizer.from_pretrained(model_qa, legacy=False)
model_qa = AutoModelForSeq2SeqLM.from_pretrained(
    model_qa,
    torch_dtype=torch.float32,  # Use float32 for compatibility
    cache_dir="LLM_models"
).to(DEVICE)

# model for mcq options generation
model_opt = "potsawee/t5-large-generation-race-Distractor"
tokenizer_opt = AutoTokenizer.from_pretrained(model_opt, legacy=False)
model_opt = AutoModelForSeq2SeqLM.from_pretrained(
    model_opt,
    torch_dtype=torch.float32,  # Use float32 for compatibility
    cache_dir="LLM_models"
).to(DEVICE)

def take_text_generate_quiz_convert_to_dict(text):
    text = text.replace("\n\n", "\n")
    list_to_return = [{} for _ in range(5)]
    
    inputs = tokenizer_qa(text, return_tensors='pt').to(DEVICE)
    idx = 0
    
    while idx < 5:
        outputs = model_qa.generate(**inputs, max_length=100, do_sample=True, top_p=0.9, temperature=0.9, repetition_penalty=1.2)#, do_sample=True)
        question_ans = tokenizer_qa.decode(outputs[0], skip_special_tokens=False)
        question_ans = question_ans.replace(tokenizer_qa.pad_token, "").replace(tokenizer_qa.eos_token, "")
            
        try:
            question, answer = question_ans.split(tokenizer_qa.sep_token)
            question = question.lstrip()
            answer = answer.lstrip()
            
            if len(answer.split()) <= 100:
                list_to_return[idx]['question'] = question
                correct_answer = answer
                text_opt = " ".join([question, tokenizer_opt.sep_token, answer, tokenizer_opt.sep_token, text])
                inputs_opt = tokenizer_opt(text_opt, return_tensors="pt").to(DEVICE)
                outputs_opt = model_opt.generate(**inputs_opt, max_new_tokens=128, do_sample=True, top_p=0.9, temperature=0.9, repetition_penalty=1.2)#, do_sample=True)
                distractors = tokenizer_opt.decode(outputs_opt[0], skip_special_tokens=False)
                distractors = distractors.replace(tokenizer_opt.pad_token, "").replace(tokenizer_opt.eos_token, "")
                options = [y.strip() for y in distractors.split(tokenizer_opt.sep_token)]
                options.append(correct_answer)
                random.shuffle(options)
                list_to_return[idx]['options'] = options
                list_to_return[idx]['correct_answer'] = correct_answer
                idx += 1
        except ValueError:
            continue
        
    #print(list_to_return)    
    return list_to_return
