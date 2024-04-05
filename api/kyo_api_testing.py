import unittest
from datetime import datetime
from flask import json
from index import app, db  # Replace 'index' with the actual name of your Flask app file
from index import QuizResults, PracticeResults, Users, Texts, Questions  # Replace 'your_model_file' with the file where your models are defined

class FlaskApiTest(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['TESTING'] = True
        db.create_all()
        
        # Create and insert a User instance
        user = Users(username='unique_test_user_1', admin=False)
        db.session.add(user)
        db.session.commit()

        # Fetch a Text and its first Question for testing
        text = Texts.query.first()
        question1 = Questions.query.filter_by(text_id=text.text_id).first()
        question2 = Questions.query.filter(Questions.text_id == text.text_id, Questions.question_id != question1.question_id).first()

        # Create PracticeResults
        practice_result = PracticeResults(
        text_id=text.text_id,
        user_id=user.user_id,
        wpm=120,
        timestamp=datetime.utcnow(),
        mode='1'  # Replace with actual mode value as required
        )
        db.session.add(practice_result)
        db.session.commit()

        # Save IDs for later use in tests
        self.user_id = user.user_id
        self.text_id = text.text_id
        self.question1_id = question1.question_id
        self.question2_id = question2.question_id
        self.practice_result_id = practice_result.practice_id

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    # Comment out each test method to run the next one
    
    # def test_save_quiz_results(self):
        
    #     # Define mock data for testing /save-quiz-results endpoint
    #     mock_quiz_results = [
    #         {
    #             'practice_id': self.practice_result_id,  # Use a valid ID from setUp
    #             'question_id': self.question1_id,        # Use a valid ID from setUp
    #             'answer': 'A',
    #             'score': 1
    #         },
    #         {
    #             'practice_id': self.practice_result_id,  # Use a valid ID from setUp
    #             'question_id': self.question2_id,        # Use a valid ID from setUp
    #             'answer': 'B',
    #             'score': 0
    #         }
    #     ]

    #     # Send a POST request to the endpoint with the mock data
    #     response = self.app.post('/save-quiz-results', 
    #                             data=json.dumps(mock_quiz_results), 
    #                             content_type='application/json')
        
    #     self.assertEqual(response.status_code, 201)  # Ensure this matches your endpoint

    #     # Optional: Check if the data was actually saved in the database
    #     with app.app_context():
    #         for quiz_result in mock_quiz_results:
    #             result = QuizResults.query.filter_by(
    #                 practice_id=quiz_result['practice_id'],
    #                 question_id=quiz_result['question_id']
    #             ).first()
    #             self.assertIsNotNone(result)
    #             self.assertEqual(result.answer, quiz_result['answer'])
    #             self.assertEqual(result.score, quiz_result['score'])
    
    def test_save_reading_speed(self):
        
        # Define mock data for testing /save-reading-speed endpoint
        mock_reading_speed_data = {
            'text_id': self.text_id,  # Assuming self.text_id is set in the setUp method
            'user_id': self.user_id,  # Assuming self.user_id is set in the setUp method
            'wpm': 300  # Words per minute for the new record
        }

        # Send a POST request to the endpoint with the mock data
        response = self.app.post('/save-reading-speed', 
                                data=json.dumps(mock_reading_speed_data), 
                                content_type='application/json')
        
        # Check if the response status code is 201 (Created)
        self.assertEqual(response.status_code, 201)

        # Check if a new record is added to the PracticeResults table
        with app.app_context():
            new_practice_result = PracticeResults.query.filter_by(
                text_id=mock_reading_speed_data['text_id'],
                user_id=mock_reading_speed_data['user_id'],
                wpm=mock_reading_speed_data['wpm']
            ).order_by(PracticeResults.practice_id.desc()).first()  # Getting the most recent entry
            self.assertIsNotNone(new_practice_result)
            self.assertEqual(new_practice_result.wpm, mock_reading_speed_data['wpm'])

            print(f"Newly Added WPM: {new_practice_result.wpm}")

if __name__ == '__main__':
    unittest.main()
