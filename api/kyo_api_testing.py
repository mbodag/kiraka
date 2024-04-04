import unittest
from datetime import datetime
from flask import json
from index import app, db  # Replace 'index' with the actual name of your Flask app file
from index import QuizResults, PracticeResults, Users, Texts  # Replace 'your_model_file' with the file where your models are defined

class FlaskApiTest(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['TESTING'] = True
        db.create_all()

        # Create and insert a User instance
        test_user = Users(username='testuser', admin=False)
        db.session.add(test_user)
        db.session.commit()

        # Create and insert a Text instance
        test_text = Texts(
            keywords='sample, test',
            text_content='Sample text content',
            user_id=test_user.user_id
        )
        db.session.add(test_text)
        db.session.commit()

        # Create PracticeResults records for the test
        practice_result1 = PracticeResults(
            text_id=test_text.text_id,
            user_id=test_user.user_id,
            wpm=120,
            timestamp=datetime.utcnow()
        )
        practice_result2 = PracticeResults(
            text_id=test_text.text_id,
            user_id=test_user.user_id,
            wpm=100,
            timestamp=datetime.utcnow()
        )

        db.session.add(practice_result1)
        db.session.add(practice_result2)
        db.session.commit()

        # Save IDs for later use in tests
        self.test_user_id = test_user.user_id
        self.test_text_id = test_text.text_id
        self.practice_result1_id = practice_result1.practice_id
        self.practice_result2_id = practice_result2.practice_id

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_save_quiz_results(self):
        # Define mock data for testing /save-quiz-results endpoint
        mock_quiz_results = [
            {
                'practice_id': 1,
                'answer': 'A',
                'score': 0.8
            },
            {
                'practice_id': 2,
                'answer': 'B',
                'score': 0.7
            }
        ]

        # Send a POST request to the endpoint with the mock data
        response = self.app.post('/save-quiz-results', 
                                 data=json.dumps(mock_quiz_results), 
                                 content_type='application/json')

        # Check if the response status code is 201 (created)
        self.assertEqual(response.status_code, 201)

        # Additional assertions can be made here
        # ...

        # Optional: Check if the data was actually saved in the database
        with app.app_context():
            for quiz_result in mock_quiz_results:
                result = QuizResults.query.filter_by(practice_id=quiz_result['practice_id']).first()
                self.assertIsNotNone(result)
                print(f"Quiz result: {result.answer}")
                print(f"Expected score: {quiz_result['score']}")
                self.assertEqual(result.score, quiz_result['score'])

    # Add more test methods for other endpoints

if __name__ == '__main__':
    unittest.main()
