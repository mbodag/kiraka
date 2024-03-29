from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.sql.expression import func
from datetime import datetime
import requests
import random
from config import DATABASE_URI, PORT

app = Flask(__name__)
CORS(app) # See what this does
# Huggingface API token
API_TOKEN = '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'
# MariaDB credentials
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # What does this do?
db = SQLAlchemy(app)

# Creates the database model. This means we create a class for each table in the database
class Texts(db.Model):  
    __tablename__ = 'Texts'
    text_id = db.Column(db.Integer, primary_key=True)
    keywords = db.Column(db.Text)
    text_content = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'))
    quiz_questions = db.relationship('Questions', backref='text', lazy=True)
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
class Questions(db.Model): 
    __tablename__ = 'Questions'
    question_id = db.Column(db.Integer, primary_key=True)
    text_id = db.Column(db.Integer, db.ForeignKey('Texts.text_id'), nullable=False)
    question_content = db.Column(db.Text, nullable=False)
    multiple_choices = db.Column(db.Text, nullable=False) # Comma-separated list of choices
    correct_answer = db.Column(db.Text, nullable=False) 
class Users(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True) #If clerk_id this might need to be a string
    username = db.Column(db.Text, unique=True)
    texts = db.relationship('Texts', backref='user', lazy=True)
    
class QuizResults(db.Model):
    __tablename__ = 'QuizResults'
    result_id = db.Column(db.Integer, primary_key=True)
    practice_id = db.Column(db.Integer, db.ForeignKey('PracticeResults.practice_id'), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer)

class PracticeResults(db.Model):
    __tablename__ = 'PracticeResults'
    practice_id = db.Column(db.Integer, primary_key=True)
    text_id = db.Column(db.Integer, db.ForeignKey('Texts.text_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    wpm = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.today())
    quiz_results = db.relationship('QuizResults', backref='practice', lazy=True)
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

def populate_texts():
    '''
    Add initial texts to the database
    '''
    try:
        with open('texts.txt', 'r') as texts_file, open('quiz_questions.txt', 'r') as quiz_file:
            for text_line, quiz_line in zip(texts_file, quiz_file):
                new_text = Texts(
                    text_content=text_line.strip(),  # Remove any trailing newline characters 
                    user_id=1
                ) 
                db.session.add(new_text)
                db.session.commit()
                new_quiz_question = Questions(text_id=new_text.text_id,
                                              question_content=quiz_line.strip(),
                                              multiple_choices='a,b,c,d',
                                              correct_answer='a'
                                              )
                db.session.add(new_quiz_question)
                db.session.commit()
        print('Texts and quizzes added successfully!')
    except Exception as e:
        db.session.rollback()
        print(f'Error: {str(e)}')

def add_admin():
    user_zero = Users(user_id = 1, username = 'admin')
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
    return text_content and isinstance(text_content, str) and len(text_content) >= 100

def user_id_is_valid(user_id):
    return isinstance(user_id, int) and user_id > 0

def username_is_valid(username):
    return username and isinstance(username, str) and len(username) <= 100


@app.route('/api/texts/add', methods=['PUT'])
def add_text():
    '''
    Adds a new text to the database
    '''
    if not request.is_json:
        return jsonify({'error':'Request must be JSON'}), 400
    else:
        text_content = request.json.get('text_content')
        user_id = request.json.get('user_id')

        if text_content is None or user_id is None:
            return jsonify({'error': 'Invalid request. Missing text_content or user_id'}), 400
        if not text_content_is_valid(text_content):
            return jsonify({'error': 'Invalid text_content'}), 400
        if not user_id_is_valid(user_id):
            return jsonify({'error': 'Invalid user_id'}), 400
        else:
            new_text = Texts(
                text_content=text_content,
                user_id = user_id
            )
            db.session.add(new_text)
            db.session.commit()
            try:
                quiz = generate_quiz()
                if quiz:
                    pass
        
            except Exception as e: 
                db.session.rollback()
                return jsonify({'error': f'Failed to generate quiz: {str(e)}'}), 500
        
            finally:      
                return jsonify({'message': 'Text added successfully!', 'text_id':new_text.text_id}), 201

@app.route('/api/texts/random', methods=['GET'])
def get_random_text():
    '''
    Fetches a random text from the database and returns it as JSON
    '''
    print(request)
    # if not request.is_json:
    #     return jsonify({'error':'Request must be JSON'}), 400
    random_text = Texts.query.order_by(func.rand()).first()
    if random_text:
        text_data = {
            'text_id': random_text.text_id,
            'text_content': random_text.text_content,
        }
        return jsonify(text_data)
    else:
        return jsonify({'message': 'No texts found'}), 404
    

@app.route('/api/texts/summarize', methods=['POST'])
def summarize_text():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
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

@app.route('/api/users/created', methods=['POST'])
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

@app.route('/api/texts/users_texts', methods=['GET'])
def fetch_all_user_texts():
    # Stores a text uploaded by the user
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    user_id = request.json.get('user_id')
    user_texts = Texts.query.filter_by(user_id=user_id).all()
    if user_texts:
        user_texts = [text.to_dict() for text in user_texts]
        return jsonify(user_texts)
    else:
        return jsonify({'message': 'No texts found'}), 404
    
@app.route('/api/users/login', methods=['POST'])
def get_login_info():
    pass

@app.route('/api/users/logout', methods=['POST'])
def get_logout_info():
    pass

@app.route('/api/users/deleted', methods=['POST'])
def delete_user_data():
    pass

@app.route('/api/analytics', methods=['GET'])
def get_user_analytics():
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    user_ids = request.json.get('user_ids')
    if not isinstance(user_ids, list):
        return jsonify({'error': 'Invalid format, user_ids should be a list'}), 400
    users_data = {}
    for user_id in user_ids:
        if not user_id_is_valid(user_id):
            return jsonify({'error': f'Invalid user_id: {user_id}'}), 400
        user = Users.query.filter_by(user_id=user_id).first()
        if not user:
            return jsonify({'error': f'User with id {user_id} not found'}), 404
        username = user.username
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
                practice_result_dict = {'textId': practice_result.text_id, 'avgWPM': practice_result.wpm, 'timestamp': practice_result.timestamp.strftime('%d/%m/%Y'), 'quizScore': score}
                user_results.append(practice_result_dict)
            user_results = sorted(user_results, key=lambda x: x['timestamp'], reverse=True)
        users_data[username] = user_results
    return jsonify(users_data)

@app.route('/api/analytics/fake', methods=['POST'])
def populate_with_fake_analytics():
    usernames = ['Fadi', 'Jack', 'Kyoya', 'Konstantinos', 'Evangelos', 'Matis']
    texts = ['This is a test text', 'This is another test text', 'This is a third test text']
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
            for k in range(3):
                practice = PracticeResults(text_id=text_id, user_id=i, wpm=random.randint(100, 300), timestamp=datetime.today())
                db.session.add(practice)
                db.session.commit()
                print(f'Practice {k} added successfully!')
                for l in range(5):
                    quiz = QuizResults(practice_id=practice.practice_id, answer='a', score=random.randint(0, 1))
                    db.session.add(quiz)
                    db.session.commit()  
                    print(f'Quiz {l} added successfully!')
    return jsonify(user_ids)

with app.app_context():
    db.create_all()
    
    if Users.query.first() is None:
        add_admin()
    if Texts.query.first() is None:
        populate_texts()

if __name__ == '__main__':
    app.run()
