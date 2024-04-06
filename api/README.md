# Backend server

## Database tables
The database architecture consists of the following tables

PLACEHOLDER FOR ERD\
### Texts
`text_id` (INT, Primary Key)\
`keywords` (TEXT) Words to highlight\
`text_content` (TEXT) The text itself\
`user_id` (INT, Foreign Key) is the id of the User who the text belongs to\
`quiz_questions` (SET) is the set of questions related to the text\

### Questions
`question_id` (INT, Primary Key)\
`text_id` (INT, Foreign Key) The id of the text the questions are related to\
`question_content` (TEXT) The question itself\
`multiple_choices` (TEXT) The possible answers\
`correct_answer` (TEXT)

### Users
`user_id` (TEXT, Primary Key) The user's Clerk id\
`username` (TEXT) The user's username\
`texts` (SET) All Texts uploaded by the user\

### QuizResults
`result_id` (INT, Primary Key)\
`practice_id` (INT, Foreign Key) The id of the practice session these results are related to\
`answer` (TEXT) The answer given to the quiz\
`score` (INT) 

### PracticeResults
`practice_id` (INT, Primary Key)\
`text_id` (INT, Foreign Key) The text being read\
`user_id` (INT, Foreign Key) The user reading the text\
`wpm` (INT) The average wpm during the text read\
`timestamp` (DateTime) The date at which the practice took place\
`quiz_results` (SET) The results gotten on the quiz\

## API routes
The following routes have been created for API calls:

- Add a text: `texts` 
    - PUT method adds the text to the database

- Fetch a random text (from admin texts) `api/texts/random`
- Summarize a text

## Running the app

You need a MariaDB server up and running. Try running `mariadb` and seeing if it works (you might need a username and password depending on the config). If you're able to access mariadb then this code should work too, otherwise I might be able to help you but I'm not sure. 

```bash
$ export FLASK_APP=database_connection.py
$ flask run
```

## Backing up the database
From the root kiraka folder:
Create a backup folder if it doesn't exist (e.g `mkdir -p data/backup`)
Run `mariadb-dump --lock-tables --databases kiraka_db > data/backup/kiraka_db.sql`


