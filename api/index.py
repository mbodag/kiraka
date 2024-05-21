from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.sql.expression import func
from datetime import datetime, timezone
from transformers import AutoModel, AutoTokenizer
import requests
import random
import json
import torch
from api.config import DATABASE_URI, ADMIN_ID
from api.chunk_complexity import compute_chunk_complexity, transformer_reg

# try:
import api.quiz_function as quiz_function
# except Exception as e:
#     print(f'Failed to import quiz function: {str(e)}')


app = Flask(__name__)
CORS(app) # See what this does
# Huggingface API token
API_TOKEN = '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'  
# MariaDB credentials
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # What does this do?
db = SQLAlchemy(app)

# LLM models and tokenizers
complexity_model = None
complexity_tokenizer = None
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")


# Loads LLM models and tokenizers when the server starts
def load_model(device = "cpu"):
    global complexity_model
    global complexity_tokenizer

    complexity_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    complexity_model = transformer_reg("bert-base-uncased").to(device)
    complexity_model.load_state_dict(torch.load(f"llms/complexity_llm.pt", map_location=device))
    complexity_model.to(device)
    complexity_model.eval()

# Creates the database model. This means we create a class for each table in the database
class Texts(db.Model):  
    __tablename__ = 'Texts'
    text_id = db.Column(db.Integer, primary_key=True)
    keywords = db.Column(db.Text)
    text_content = db.Column(db.Text)
    user_id = db.Column(db.String(50), db.ForeignKey('Users.user_id'))
    quiz_questions = db.relationship('Questions', backref='text', lazy=True, cascade='all, delete')
    title = db.Column(db.Text)
    deleted = db.Column(db.Boolean, default=False)
    chunk_complexity = db.relationship('ChunkComplexity', backref='text', lazy=True, cascade='all, delete')
    practices = db.relationship('PracticeResults', backref='text', lazy=True, cascade='all, delete')
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Questions(db.Model): 
    __tablename__ = 'Questions'
    question_id = db.Column(db.Integer, primary_key=True)
    text_id = db.Column(db.Integer, db.ForeignKey('Texts.text_id'), nullable=False)
    question_content = db.Column(db.Text, nullable=False)
    multiple_choices = db.Column(db.Text, nullable=False) # Comma-separated list of choices
    correct_answer = db.Column(db.Text, nullable=False) 
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
class Users(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.String(50), primary_key=True, nullable=False) #If clerk_id this might need to be a string
    username = db.Column(db.Text)
    texts = db.relationship('Texts', backref='user', lazy=True)
    admin = db.Column(db.Boolean, default=False)
    
class QuizResults(db.Model):
    __tablename__ = 'QuizResults'
    result_id = db.Column(db.Integer, primary_key=True)
    practice_id = db.Column(db.Integer, db.ForeignKey('PracticeResults.practice_id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('Questions.question_id'), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer)

class PracticeResults(db.Model):
    __tablename__ = 'PracticeResults'
    practice_id = db.Column(db.Integer, primary_key=True)
    text_id = db.Column(db.Integer, db.ForeignKey('Texts.text_id'), nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('Users.user_id'), nullable=False)
    wpm = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.today())
    quiz_results = db.relationship('QuizResults', backref='practice', lazy=True, cascade='all, delete')
    mode = db.Column(db.Text)
    chunks = db.relationship('Chunks', backref='practice', lazy=True, cascade='all, delete')
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
class Chunks(db.Model):
    __tablename__ = 'Chunks'
    chunk_id = db.Column(db.Integer, primary_key=True)
    practice_id = db.Column(db.Integer, db.ForeignKey('PracticeResults.practice_id'), nullable=False)
    chunk_position = db.Column(db.Integer) #Index position w.r.t this run's other chunks, so that they can be ordered
    gazer_points = db.relationship('GazerPoints', backref='chunk', lazy=True, cascade='all, delete')

class GazerPoints(db.Model):
    __tablename__ = 'GazerPoints'
    point_id = db.Column(db.Integer, primary_key=True)
    chunk_id = db.Column(db.Integer, db.ForeignKey('Chunks.chunk_id'), nullable=False)
    gazer_point_position = db.Column(db.Integer) #Index position w.r.t this chunk's other GazerPoints, so that they can be ordered
    x_value = db.Column(db.Float) #x coordinate of the gaze point
    y_value = db.Column(db.Float) #y coordinate of the gaze point
    elapsed_time = db.Column(db.Float) #Time elapsed since the start of the chunk
    
class ChunkComplexity(db.Model):
    __tablename__ = 'ChunkComplexity'
    chunk_complexity_id = db.Column(db.Integer, primary_key = True)
    complexity = db.Column(db.Float) #Complexity score of the chunk
    text_id = db.Column(db.Integer, db.ForeignKey('Texts.text_id'), nullable=False)
    chunk_position = db.Column(db.Integer) #Index position w.r.t this text's other chunks, so that they can be ordered
    chunk_content = db.Column(db.Text) #The actual text content of the chunk

def populate_texts(text_file = 'api/preloaded_texts.json'):
    '''
    Add initial texts to the database
    '''
    try:
        with open(text_file, 'r') as texts_file:
            texts = json.loads(texts_file.read())
            for text in texts.values():
                print(text['title'])
                new_text = Texts(
                    title = text['title'],
                    text_content=text['content'],  # Remove any trailing newline characters 
                    user_id=1
                    
                ) 
                db.session.add(new_text)
                db.session.commit()
                for question in text['questions']:
                    random.shuffle(question['options'])
                    new_quiz_question = Questions(text_id=new_text.text_id,
                                                  question_content=question['question'],
                                                  multiple_choices=';'.join(question['options']),
                                                  correct_answer=question['correct_answer']
                                                  )
                    db.session.add(new_quiz_question)
                    db.session.commit()
                store_chunk_complexity(new_text)
        print('Texts and quizzes added successfully!')
    except Exception as e:
        db.session.rollback()
        print(f'Error: {str(e)}')


def add_admin():
    user_zero = Users(user_id = "1", username = 'admin', admin=True)
    db.session.add(user_zero)
    db.session.commit()

def generate_quiz():
    '''
    Generates a quiz from a given text
    
    Returns:
    - Questions [List]: A list of quiz questions
    - Answers [List]: A list of correct answers
    
    '''
    pass

# Input validation functions
def text_content_is_valid(text_content):
    return text_content and isinstance(text_content, str) and len(text_content) >= 1500 and len(text_content) < 6000

def user_id_is_valid(user_id):
    return isinstance(user_id, int) and user_id > 0 # Outdated

def username_is_valid(username):
    return username and isinstance(username, str) and len(username) <= 100

@app.route('/api/texts', methods=['POST'])
def add_text():
    if not request.is_json:
        return jsonify({'error':'Request must be JSON'}), 400
    else:
        text_content = request.json.get('text_content')
        user_id = request.json.get('user_id')
        title = request.json.get('title', None)
        if Users.query.filter_by(user_id=user_id).first() is None or user_id==1:
            return jsonify({'error': 'User not found'}), 404
        if text_content is None or user_id is None:
            return jsonify({'error': 'Invalid request. Missing text_content or user_id'}), 400
        else:
            new_text = Texts(
                text_content=text_content,
                user_id = user_id,
                title = title
            )
            db.session.add(new_text)
            db.session.commit()
            store_chunk_complexity(new_text)
            try:
                quizzes = quiz_function.take_text_generate_quiz_convert_to_dict(text_content)
                for quiz in quizzes:
                    new_quiz_question = Questions(text_id=new_text.text_id,
                                                  question_content=quiz['question'],
                                                  multiple_choices=';'.join(quiz['options']),
                                                  correct_answer=quiz['correct_answer']
                                                  )
                    db.session.add(new_quiz_question)
                    db.session.commit()
        
            except Exception as e: 
                db.session.rollback()
                return jsonify({'error': f'Failed to generate quiz: {str(e)}'}), 500
        
            finally:      
                return jsonify({'message': 'Text added successfully!', 'text_id':new_text.text_id}), 201

@app.route('/api/texts/admin', methods=['GET'])        
def get_random_text():
    '''
    Fetches a random admin text from the database and returns it as JSON
    '''
    admin_texts = Texts.query.filter_by(user_id=ADMIN_ID).all()
    if admin_texts:
        text_data = [{'text_id': admin_text.text_id, 'title': admin_text.title} for admin_text in admin_texts if int(admin_text.text_id) > 5]
        return jsonify(text_data)
    else:
        return jsonify({'message': 'No texts found'}), 404
    
# Fetch specific text by text_id
@app.route('/api/texts/<int:text_id>', methods=['GET'])
def get_text_by_id(text_id):
    '''
    Fetches a specific text from the database by text_id and returns it as JSON
    '''
    user_id = request.args.get('user_id')
    # Fetch the text from the database using the provided text_id
    text = Texts.query.get(text_id)


    # If the text is found, return its details
    if text:
        if not text.user_id in ['1', user_id]:
            return jsonify({'error': 'Unauthorized to access this text'}), 401
        if text.deleted:
            return jsonify({'message': 'Text has been deleted'}), 404
        else: 
            text_data = {
                'text_id': text.text_id,
                'text_content': text.text_content,
                'quiz_questions': [question.to_dict() for question in text.quiz_questions],
                'title': text.title,
            }
            return jsonify(text_data)
    
    # If the text is not found, return a 404 not found error
    else:
        return jsonify({'message': 'Text not found'}), 404
    
@app.route('/api/chunks/<int:text_id>', methods=['GET'])
def get_chunks_by_text_id(text_id):
    '''
    Fetches a specific text from the database by text_id and returns it as JSON
    '''
    # Get the user_id for authorisation
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    # Fetch the text from the database using the provided text_id

    chunks = ChunkComplexity.query.filter_by(text_id=text_id).order_by(ChunkComplexity.chunk_position).all()

    # If the text is found, return its details
    if chunks:
        if not Texts.query.filter_by(text_id=text_id).first().user_id in ['1', user_id]:
            return jsonify({'error': 'Unauthorized to access this text'}), 401
        else: 
            text_data = {
                'chunks': [chunk.chunk_content for chunk in chunks],
                'complexity': [chunk.complexity for chunk in chunks],
            }
            return jsonify(text_data)
    
    # If the text is not found, return a 404 not found error
    else:
        return jsonify({'message': 'Text not found'}), 404


@app.route('/api/texts/user', methods=['GET'])
def text_by_user_id():
    '''
    Fetches all texts from a user and returns it as JSON
    '''
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    texts = Texts.query.filter_by(user_id=user_id, deleted=False).all()
    all_texts_data = []
    for text in texts:
        text_data = {
            'text_id': text.text_id,
            'text_content': text.text_content,
            'quiz_questions': [question.to_dict() for question in text.quiz_questions],
            'keywords': text.keywords,
            'title': text.title,
        }
        all_texts_data.append(text_data)
    return jsonify(all_texts_data)
      
@app.route('/api/texts/<string:text_id>', methods=['DELETE'])
def delete_text(text_id):
    try:
        user_id = request.args.get('user_id')
    except TypeError:
        return jsonify({'error': 'User ID is required'}), 400
        
    text_to_delete = Texts.query.filter_by(text_id=text_id).first()
    if text_to_delete is None:
        return jsonify({'error': 'Text not found'}), 404
    if text_to_delete.user_id != user_id or user_id == 1:
        return jsonify({'error': 'Unauthorized to delete this text'}), 401
    else:
        full_delete = request.args.get('full_delete')
        print(full_delete)
        if full_delete == 'true':
            try:
                my_text = Texts.query.filter_by(text_id=text_id).first()
                db.session.delete(my_text)
                db.session.commit()
                print('Text deleted successfully!')
                return jsonify({'message': 'Text deleted successfully!'}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': e.message}), 500
        else:
            try:
                Questions.query.filter_by(text_id=text_id).update({"question_content": "Question deleted by user", "multiple_choices": "deleted", "correct_answer": "deleted"})
                ChunkComplexity.query.filter_by(text_id=text_id).delete()
                Texts.query.filter_by(text_id=text_id).update({'text_content': 'Text deleted by user', 'keywords': 'deleted', 'title': 'Deleted', 'deleted': True})
                db.session.commit()
                return jsonify({'message': 'Text deleted successfully!'}), 200
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': e.message}), 500

@app.route('/api/avgWPM', methods=['GET'])
def get_avg_wpm():
    user_id = request.args.get('user_id')
    mode = request.args.get('mode')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    practice_results = PracticeResults.query.filter_by(user_id=user_id, mode=mode).all()
    avg_wpms = [practice.wpm for practice in practice_results]
    return jsonify({'avgWPMs': avg_wpms})

@app.route('/api/texts/summarize', methods=['POST'])
def summarize_text():
    input_text = request.json.get('text', '')
    if not text_content_is_valid(input_text):
        return jsonify({'error': 'Invalid text provided'}), 400
    headers = {"Authorization": f"Bearer {API_TOKEN}"}
    data = {"inputs": input_text}
    response = requests.post("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", headers=headers, json=data)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to get response from model'}), 500
    summary = response.json()[0]['summary_text']
    return jsonify({'summary': summary})

@app.route('/api/user', methods=['POST'])
def add_new_account():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    username = request.json.get('username')
    if not user_id_is_valid(username):
        return jsonify({'error': 'Invalid username'}), 400
    new_user = Users(username=username)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New account created successfully!'}), 201


@app.route('/api/user/login', methods=['POST'])
def get_login_info():
    pass

@app.route('/api/user/logout', methods=['POST'])
def get_logout_info():
    pass

@app.route('/api/users', methods=['DELETE'])
def delete_user_data():
    pass

@app.route('/api/analytics', methods=['POST'])
def get_user_analytics():
    user_id = request.json.get('user_id')
    users_data = {}
    logged_user = Users.query.filter_by(user_id=user_id).first()
    if not logged_user:
        return jsonify({'error': f'User with id {user_id} not found'}), 404
    elif not logged_user.admin:  
        users = [logged_user] 
    elif logged_user.admin:
        users = Users.query.all()
    for user in users:
        user_id = user.user_id 
        username = user.user_id if logged_user.admin else "Your data"
        user_results = []
        practice_results = PracticeResults.query.filter_by(user_id=user_id).all()
        if practice_results:
            for practice_result in practice_results:
                quiz_results = QuizResults.query.filter_by(practice_id=practice_result.practice_id).all()
                num_questions = 0
                num_corrects = 0
                if len(quiz_results) == 0:
                    score = 0
                else: 
                    for quiz_result in quiz_results:
                        num_questions += 1
                        num_corrects += quiz_result.score
                    score = 100 * num_corrects / num_questions
                practice_result_dict = {'textId': practice_result.text_id, 'avgWPM': practice_result.wpm, 'timestamp': practice_result.timestamp, 'quizScore': score}
                user_results.append(practice_result_dict)
            user_results = sorted(user_results, key=lambda x: x['timestamp'], reverse=False)
        users_data[username] = user_results          
    return jsonify({'usersData': users_data, 'isAdmin': logged_user.admin})

@app.route('/api/analytics/fake', methods=['POST'])
def populate_with_fake_analytics():
    usernames = ['Fadi', 'Jack', 'Kyoya', 'Konstantinos', 'Evangelos', 'Matis']
    texts = ['This is a test text', 'This is another test text', 'This is a third test text']
    questions = ['What is the capital of France?', 'What is the capital of Germany?', 'What is the capital of Italy?']
    user_ids = []
    for i in range(2, 2+len(usernames)):
        user = Users(username=usernames[i-2])
        db.session.add(user)
        db.session.commit()
        print(f'User {usernames[i-2]} added successfully!')
        user_ids.append(user.user_id)
        for j in range(3):
            text = Texts(text_content=texts[j], user_id=i)
            db.session.add(text)
            db.session.commit()
            print(f'Text {j} added successfully!')
            text_id = text.text_id
            for m in range(3):
                question = Questions(text_id=text_id, question_content=questions[m], multiple_choices='a;b;c;d', correct_answer='a')
                db.session.add(question)
                db.session.commit()
                print(f'Question {m} added successfully!')
            for k in range(3):
                practice = PracticeResults(text_id=text_id, user_id=i, wpm=random.randint(100, 300), timestamp=datetime.today())
                db.session.add(practice)
                db.session.commit()
                print(f'Practice {k} added successfully!')
                for l in range(5):
                    quiz = QuizResults(practice_id=practice.practice_id, question_id = question.question_id, answer='a', score=random.randint(0, 1))
                    db.session.add(quiz)
                    db.session.commit()  
                    print(f'Quiz {l} added successfully!')
    return jsonify(user_ids)

@app.route('/api/save-reading-speed', methods=['POST'])
def submit_reading_speed():
    # Check if the request is in JSON format
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    # Parse data from the request
    data = request.get_json()

    # Extract text_id, user_id, and wpm
    text_id = data.get('text_id')  # Assuming text_id is provided
    user_id = data.get('user_id')  # Assuming user_id is provided
    wpm = data.get('wpm')
    mode = data.get('mode', 'undefined')
    chunks = data.get('chunks_data', [[]]) # Should be a list of lists of dictionaries

    # Validate the text_id as integer and user_id as string
    if not isinstance(text_id, int) or not isinstance(user_id, str):
        return jsonify({'error': 'Invalid text_id or user_id'}), 400

    # Validate the wpm as a non-negative number
    if not isinstance(wpm, (int, float)) or wpm < 0:
        return jsonify({'error': 'Invalid wpm'}), 400

    # Create a new PracticeResults object
    new_practice_result = PracticeResults(
        text_id=text_id,
        user_id=user_id,
        wpm=wpm,
        mode = mode,
        timestamp=datetime.now(timezone.utc)  # Assuming current time as timestamp
    )

    # Add to the database session
    db.session.add(new_practice_result)
    db.session.commit()
    chunk_errors = 0
    gazer_point_errors = 0
    for i in range(len(chunks)):
        try: 
            new_chunk = Chunks(
            practice_id=new_practice_result.practice_id,
            chunk_position=i
        )
            db.session.add(new_chunk)
            db.session.commit()
            for j in range(len(chunks[i])):
                try:
                    new_gazer_point = GazerPoints(
                    chunk_id=new_chunk.chunk_id,
                    gazer_point_position=j,
                    x_value=chunks[i][j]['normScaledX'],
                    y_value=chunks[i][j]['y'],
                    elapsed_time=chunks[i][j]['elapsedTime']
                )
                    db.session.add(new_gazer_point)
                except:
                    db.session.rollback()
                    gazer_point_errors += 1
        except:
            db.session.rollback()
            chunk_errors += 1
    # Commit the new practice result to the database
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()  # Roll back in case of error
        return jsonify({'error': f'Failed to add new reading speed record: {str(e)}'}), 500

    if chunk_errors == 0 and gazer_point_errors == 0:
    # Return success message
        return jsonify({'message': 'New reading speed record added successfully!', 'practice_id': new_practice_result.practice_id}), 201
    else:
        return jsonify({'message': f'New reading speed record added with {chunk_errors} chunk errors and {gazer_point_errors} gazer point errors', 'practice_id': new_practice_result.practice_id}), 207
    
@app.route('/api/save-quiz-results', methods=['POST'])
def submit_quiz_results():
    # Check if the request is in JSON format
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    # Parse data from the request
    json_data = request.get_json()
    
    quiz_data = json_data.get('quiz_results')
    user_id = json_data.get('user_id')
    practice_id = json_data.get('practice_id')
    text_id = json_data.get('text_id')
    
    # Validate that quiz_data is a non-empty list
    if not isinstance(quiz_data, list) or not quiz_data:
        return jsonify({'error': 'Invalid input, expected a non-empty list'}), 400

    for data in quiz_data:
        # Validate the score as a non-negative number
        score = data.get('score')
        if not isinstance(score, (int, float)) or not (0 <= score <= 1):
            return jsonify({'error': 'Invalid score, must be between 0 and 1 inclusive'}), 400

        # Create a new PracticeSession if it doesn't exist
        if practice_id == None:
            new_practice_session = PracticeResults(
                user_id = user_id,
                text_id = text_id
            )
            db.session.add(new_practice_session)
            try:
                db.session.commit()
                print(f"New practice session ({new_practice_session.practice_id}) created")
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Failed to submit practice result: {e}')
                return jsonify({'error': f'Failed to submit practice result: {str(e)}'}), 500
            practice_id = new_practice_session.practice_id
                
        PracticeResults.query.filter_by(practice_id=practice_id).first()
        # Create a new QuizResults object
        new_quiz_result = QuizResults(
            practice_id=practice_id,
            question_id=data['question_id'],
            answer=data['selected_answer'],
            score=score
        )

        # Add to the database session
        db.session.add(new_quiz_result)

    # Commit the session to save all new quiz results to the database
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Failed to submit quiz results: {e}')
        return jsonify({'error': f'Failed to submit quiz results: {str(e)}'}), 500

    # Return success message
    return jsonify({'message': 'Quiz results submitted successfully!'}), 201


@app.route('/api/get_info', methods=['GET'])
def get_info():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400

    user_data = Users.query.filter_by(user_id=user_id).first()
    if user_data:
        # User exists, serialize and return user data
        return jsonify(success=True, user_exists=True)
    else:
        # User does not exist
        return jsonify(success=False, user_exists=False, message="User not found.")


@app.route('/api/store-user-data', methods=['POST'])
def store_user_data():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400
    
    # user_id = user_data['user_id']
    # Check if user already exists to avoid duplicates
    existing_user = Users.query.filter_by(user_id=user_id).first()
    if existing_user:
        return jsonify(success=False, message="User already exists."), 200
    
    new_user = Users(user_id=user_id)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(success=True, message="User added successfully.")

@app.route('/api/practiced_texts', methods=['GET'])
def get_practiced_texts():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify(success=False, message="User ID is required."), 400
    
    practiced_texts = PracticeResults.query.filter_by(user_id=user_id).all()
    # Serialize and return practiced texts
    read_texts = list(set([text.text_id for text in practiced_texts]))
    return jsonify(read_texts=read_texts), 200

def store_chunk_complexity(text):
    global device
    chunk_list, total_complexity = compute_chunk_complexity(text.text_content, complexity_model, complexity_tokenizer, device=device)
    for i, chunk in enumerate(chunk_list):
        new_chunk_complexity = ChunkComplexity(
            complexity=total_complexity[i],
            text_id=text.text_id,
            chunk_position=i,
            chunk_content = chunk
            )
        db.session.add(new_chunk_complexity)
    db.session.commit()

with app.app_context():
    db.create_all()
    load_model()
    if Users.query.first() is None:
        add_admin()
    if Texts.query.first() is None:
        populate_texts()
    if ChunkComplexity.query.first() is None: 
        for text in Texts.query.all():
            store_chunk_complexity(text)
    if len(Texts.query.filter_by(user_id='1').all()) <=5:
        populate_texts('api/preloaded_texts_2.json')
        
if __name__ == '__main__':
    app.run(debug=True, port = 8000)

