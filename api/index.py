from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.sql.expression import func
from datetime import datetime
import requests
import random
from config import DATABASE_URI, PORT, ADMIN_ID
import json

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
    title = db.Column(db.Text)
    
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
    user_id = db.Column(db.Integer, primary_key=True) #If clerk_id this might need to be a string
    username = db.Column(db.Text, unique=True)
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
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    wpm = db.Column(db.Integer)
    timestamp = db.Column(db.DateTime, default=datetime.today())
    quiz_results = db.relationship('QuizResults', backref='practice', lazy=True)
    mode = db.Column(db.Text)
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

def populate_texts():
    '''
    Add initial texts to the database
    '''
    try:
        with open('api/preloaded_text.json', 'r') as texts_file:
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
                    new_quiz_question = Questions(text_id=new_text.text_id,
                                                  question_content=question['question'],
                                                  multiple_choices=';'.join(question['options']),
                                                  correct_answer=question['correct_answer']
                                                  )
                    db.session.add(new_quiz_question)
                    db.session.commit()
        print('Texts and quizzes added successfully!')
    except Exception as e:
        db.session.rollback()
        print(f'Error: {str(e)}')

def add_admin():
    user_zero = Users(user_id = 1, username = 'admin', admin=True)
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

@app.route('/api/texts', methods=['POST'])
def add_text():
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
    Fetches a random admin text from the database and returns it as JSON
    '''
    random_text = Texts.query.filter_by(user_id=ADMIN_ID).order_by(func.rand()).first()
    if random_text:
        text_data = {
            'text_id': random_text.text_id,
            'text_content': random_text.text_content,
            'quiz_questions': [question.to_dict() for question in random_text.quiz_questions]
        }
        return jsonify(text_data)
    else:
        return jsonify({'message': 'No texts found'}), 404


@app.route('/api/texts/user', methods=['GET'])
def text_by_user_id():
    '''
    Fetches all texts from a user and returns it as JSON
    '''
    user_id = request.args.get('user_id')
    texts = Texts.query.filter_by(user_id=user_id).all()
    all_texts_data = []
    for text in texts:
        text_data = {
            'text_id': text.text_id,
            'text_content': text.text_content,
            'quiz_questions': [question.to_dict() for question in text.quiz_questions],
            'keywords': text.keywords
        }
        all_texts_data.append(text_data)
    return jsonify(all_texts_data)
      
@app.route('/api/texts/<int:text_id>', methods=['DELETE'])
def delete_text(text_id):
    user_id = int(request.args.get('user_id'))
    text_to_delete = Texts.query.filter_by(text_id=text_id).first()
    if text_to_delete.user_id != user_id:
        return jsonify({'error': 'Unauthorized to delete this text'}), 401
    else:
        try:
            Questions.query.filter_by(text_id=text_id).delete()
            Texts.query.filter_by(text_id=text_id).delete()
            db.session.commit()
            return jsonify({'message': 'Text deleted successfully!'}), 200
        except:
            db.session.rollback()
            return jsonify({'error': 'Failed to delete text'}), 500

    
@app.route('/api/texts/summarize', methods=['POST'])
def summarize_text():
    g = {"text":"What is the Point of Decentralized AI? Traditionally, the development of AI systems has remained siloed among a handful of technology vendors like Google and OpenAI, who have had the financial resources necessary to develop the infrastructure and resources necessary to build and process large datasets.\nHowever, the centralization of AI development in the industry has meant that organizations need to have significant funding to be able to develop and process the data necessary to compete in the market.\nLikewise, it’s also incentivized vendors to pursue a black box approach to AI development, giving users and regulators little to no transparency over how an organization’s AI models operate and make decisions. This makes it difficult to identify inaccuracies, bias, prejudice, and misinformation.\nDecentralized AI applications address these shortcomings by providing a solution to move AI development away from centralized providers and toward smaller researchers who innovate as part of an open-source community.\nAt the same time, users can unlock the benefits of AI-driven decision-making locally without needing to share their personal data with third parties.\nFederated Learning vs. Decentralised AI\nFederated learning is the name given to an approach where two or more AI models are trained on different computers, using a decentralized dataset. Under a federated learning methodology, machine-learning models are trained on data stored within a user device without that data being shared with the upstream provider.\nWhile this sounds similar to decentralized AI, there is a key difference. Under federated learning, an organization has centralized control over the AI model used to process the datasets, while under a decentralized AI system, there is no central entity in charge of processing the data.\nThus federated learning is typically used by organizations looking to build a centralized AI model that makes decisions based on data that has been processed on a decentralized basis (usually to maintain user privacy), whereas decentralized AI solutions have no central authority in charge of the underlying model that processes the data.\nAs Patricia Thaine, co-founder and CEO of Private AI, explained to Techopedia, “Federated learning tends to have a centralized model that gets updated based on the learnings of distributed models. A decentralized system would have multiple nodes that come to a consensus, with no central model as an authority.\nBenefits of Decentralized AI\nUsing a decentralized AI architecture offers some key benefits to both AI developers and users alike. Some of these are:\nUsers can benefit from AI-based decision-making without sharing their data;\nMore transparency and accountability over how AI-based decisions are made;\nIndependent researchers have more opportunities to contribute to AI development;\nBlockchain technology provides new opportunities for encryption;\nDecentralization unlocks new opportunities for integrations with Web3 and the metaverse \nDemocratizing AI Development\nWhile decentralized AI is still in its infancy, it has the potential to democratize AI development, providing more opportunities for open-source model developers to interact with users independent of a centralized authority.\nIf enough vendors support decentralized AI models, this could significantly reduce the amount of control that proprietary model developers have in the market and increase transparency over AI development as a whole."}
    input_text = g['text']
    #input_text = request.json.get('text', '')
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
    app.run(debug=True, port = PORT)


#{"text":"What is the Point of Decentralized AI? Traditionally, the development of AI systems has remained siloed among a handful of technology vendors like Google and OpenAI, who have had the financial resources necessary to develop the infrastructure and resources necessary to build and process large datasets.\nHowever, the centralization of AI development in the industry has meant that organizations need to have significant funding to be able to develop and process the data necessary to compete in the market.\nLikewise, it’s also incentivized vendors to pursue a black box approach to AI development, giving users and regulators little to no transparency over how an organization’s AI models operate and make decisions. This makes it difficult to identify inaccuracies, bias, prejudice, and misinformation.\nDecentralized AI applications address these shortcomings by providing a solution to move AI development away from centralized providers and toward smaller researchers who innovate as part of an open-source community.\nAt the same time, users can unlock the benefits of AI-driven decision-making locally without needing to share their personal data with third parties.\nFederated Learning vs. Decentralised AI\nFederated learning is the name given to an approach where two or more AI models are trained on different computers, using a decentralized dataset. Under a federated learning methodology, machine-learning models are trained on data stored within a user device without that data being shared with the upstream provider.\nWhile this sounds similar to decentralized AI, there is a key difference. Under federated learning, an organization has centralized control over the AI model used to process the datasets, while under a decentralized AI system, there is no central entity in charge of processing the data.\nThus federated learning is typically used by organizations looking to build a centralized AI model that makes decisions based on data that has been processed on a decentralized basis (usually to maintain user privacy), whereas decentralized AI solutions have no central authority in charge of the underlying model that processes the data.\nAs Patricia Thaine, co-founder and CEO of Private AI, explained to Techopedia, “Federated learning tends to have a centralized model that gets updated based on the learnings of distributed models. A decentralized system would have multiple nodes that come to a consensus, with no central model as an authority.\nBenefits of Decentralized AI\nUsing a decentralized AI architecture offers some key benefits to both AI developers and users alike. Some of these are:\nUsers can benefit from AI-based decision-making without sharing their data;\nMore transparency and accountability over how AI-based decisions are made;\nIndependent researchers have more opportunities to contribute to AI development;\nBlockchain technology provides new opportunities for encryption;\nDecentralization unlocks new opportunities for integrations with Web3 and the metaverse \nDemocratizing AI Development\nWhile decentralized AI is still in its infancy, it has the potential to democratize AI development, providing more opportunities for open-source model developers to interact with users independent of a centralized authority.\nIf enough vendors support decentralized AI models, this could significantly reduce the amount of control that proprietary model developers have in the market and increase transparency over AI development as a whole."}