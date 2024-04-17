# Backend server

## Database tables
The database architecture consists of the following tables

PLACEHOLDER FOR ERD\
### Users
`user_id` (TEXT, Primary Key) The user's Clerk id\
`username` (TEXT) The user's username\
`texts` (SET, relationship\[Texts\]) All Texts uploaded by the user\
`admin` (BOOLEAN) Whether the user is an admin

### Texts
`text_id` (INT, Primary Key)\
`keywords` (TEXT) Words to highlight\
`text_content` (TEXT) The text itself\
`user_id` (String, Foreign Key) is the id of the User who the text belongs to\
`quiz_questions` (SET, relationship\[Questions\]) is the set of questions related to the text\
`title` (TEXT) Title of the text

### Questions
`question_id` (INT, Primary Key)\
`text_id` (INT, Foreign Key) The id of the text the questions are related to\
`question_content` (TEXT) The question itself\
`multiple_choices` (TEXT) The possible answers. Answers are joined by a `;`\
`correct_answer` (TEXT) The correct answer


### QuizResults
`result_id` (INT, Primary Key)\
`practice_id` (INT, Foreign Key) The id of the practice session these results are related to\
`question_id` (INT, Foreign Key) The id of the question asked 
`answer` (TEXT) The answer given to the quiz\
`score` (INT) 1 if correct answer, 0 otherwise

### PracticeResults
`practice_id` (INT, Primary Key)\
`text_id` (INT, Foreign Key) The text being read\
`user_id` (Text, Foreign Key) The user reading the text\
`wpm` (INT) The average wpm during the text read\
`timestamp` (DateTime) The date at which the practice took place\
`quiz_results` (SET, relationship\[QuizResults\]) The results gotten on the quiz\
`mode` (TEXT) The mode the text was read in (1, 2 or 3)

## API routes
The following routes have been created for API calls:

- Add a text: `/api/texts` 
    - POST method adds the text to the database
        - Request format: ```{
        text_content: string 
        user_id: string
    }```
        - Returned format: ```{message: string, text_id: number}``` if success
        `{error: string}` if error

- Fetch a random text (from admin texts) `api/texts/random`
    - GET method retreives a random text from admins

- Fetch a specific text
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


