# Kiraka.ai — Speed Reading Platform

Welcome to Kiraka.ai! Inspired by the Arabic word for reading, *[qirā'ah]*, our platform is dedicated to enhancing your reading experience through innovative, technology-driven solutions. Initiated as a university project at Imperial College London, Kiraka.ai's main feature—***FlashMode Adaptive***—leverages eye-tracking technology and lexical analysis to tailor the reading experience to your pace and comprehension needs.

Kiraka.ai is currently hosted at: https://srp.doc.ic.ac.uk

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Reading Modes](#reading-modes)
  - [Doc Mode](#docmode)
  - [Flash Mode](#flashmode)
  - [AI Quiz Generation](#ai-quiz-generation)
  - [User Analytics](#user-analytics)
- [Contact Us](#contact-us)
- [Terms and Conditions](#terms-and-conditions)
- [Authors](#authors)

## Project Overview

Kiraka.ai is designed to explore the potential of speed reading and its impact on comprehension, pushing the boundaries of how information is absorbed. Our tools dynamically adjust to your reading pace and style, challenging your limits and enhancing comprehension through two primary modes: ***DocMode*** and ***FlashMode***.

## Key Features

- **DocMode**: See the full text, add a pointer to follow the pace you set, or bold the beginning of words to help you focus.
- **FlashMode**: Read text in chunks, displayed sequentially to improve focus and speed, with optional real-time eye tracking to adapt to your reading speed. 
- **Real-Time Adjustments**: Uses [WebGazer](https://webgazer.cs.brown.edu/)'s eye-tracking technology to adjust the WPM (Words Per Minute) dynamically in FlashMode.

## Getting Started

### Prerequisites

- Node.js (version 14 or above)
- npm or yarn
- MariaDB
- Python 3.10+
- See `requirements.txt` for a full list of required dependencies.

### Installation

1. Clone the repository:
    ```bash
    git clone https://gitlab.doc.ic.ac.uk/g237007906/kiraka.git
    ```
2. Our backend uses Flask, so we recommend downloading Python 3.10 and creating a virtual environment.

    Then, install the required Python libraries on your (activated) virtual environment:
    ```bash
    pip install -r requirements.txt
    ```
3. Install the required Next.js dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
4. Authentication is handled by *Clerk*, which creates an ID for each user. This ID is the only piece of user authentication we store. 

    Add your Clerk API keys and instructions after sign-in/sign-up to an `.env.local` file in your root directory:

    ```bash
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<replace_with_your_public_Clerk_key>"
    CLERK_SECRET_KEY="<replace_with_your_secret_Clerk_key>"

    WEBHOOK_SECRET="<replace_with_your_Clerk_webhook_secret>"

    NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
    NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/instructions"
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/instructions"
    ```
    For assistance with API keys or setup, please contact us at srp.doc.ic.ac.uk@gmail.com.

## Running the Application 

1. Prepare the Database:
    - Ensure MariaDB is installed and actively running on your system (in the background). Visit [MariaDB's official site](https://mariadb.org/) for installation guides and more information.

2. Configure the API:
    - In the `/api` directory, create a file named `config.py`.
    - Add your database details and administrative credentials to `config.py`:

        ```bash
        USERNAME = 'root'
        PASSWORD = '<replace_with_your_database_password>'
        DATABASE_NAME = '<replace_with_your_database_name>'
        DATABASE_URI = f'mariadb+mariadbconnector://{USERNAME}:{PASSWORD}@localhost/{DATABASE_NAME}'
        PORT = 8000
        ADMIN_ID = '<1 or replace_with_your_clerk_id>'
        ```
        For assistance with database setup or any related issues, please contact us at srp.doc.ic.ac.uk@gmail.com.

3. Run the server:
    - To run the *development* server:

        ```bash
        npm run dev
        # or
        yarn dev
        ```
    - Alternatively, to prepare and run the *production* server:

        ```bash
        npm run build
        npm run start
        # or
        yarn build
        yarn start
        ```

4. Access the Application:
    - Open http://localhost:3000 in your browser to see the result; or if the latter is already in use, check your terminal for info about which localhost to open. 

    - Our website is deployed in a similar fashion on one of Imperial's virtual machines, where both the frontend and the backend are hosted.

         >**Note:** LLMs (Large Language Models) will be downloaded when you first run the software. They are about 5GB in size and might take a while to download before the project starts running.


## Reading Modes

### DocMode
In DocMode, you have the freedom to see the whole text and read it at your own pace. We also have some extra features you may find useful. These are controlled via the control panel above the text.

Features include:
- $\color{blue}{Pointer}$: Enhance your reading with a karaoke-style pointer. Customise the pointer by adjusting its length and colour for optimal tracking, and set its speed to match your preferred reading pace in Words Per Minute (WPM).
- $\color{blue}{HyperBold}$: Bold the beginning of words to create artificial fixation points with varying degrees. This feature helps in improving reading speed by guiding your visual focus.
- $\color{blue}{Others}$:
    - $\color{darkblue}{Dark\ Mode}$: Switch to Dark Mode for a reading experience in low-light conditions.
    - $\color{darkblue}{Focused\ Reading}$: Choose to only display the pointer, hiding the rest of the text. This helps minimise regression (unnecessary re-reading), enhancing concentration.
    - $\color{darkblue}{Font\ Customisation}$: Freely adjust the font size to suit your visual preference, ensuring comfort and readability.


### FlashMode
Explore two configurations: **Static** and **Adaptive**.

- **Static**: Chunks of text appear in brief, rapid bursts or "flashes". Manually adjust speed with arrow keys. Pause, start, or restart at any time.

- **Adaptive (Recommended)**: Integrates WebGazer's eye-tracking to automatically adjust your WPM, encouraging faster reading. Manual WPM adjustments are still available.

\
$\color{red}{Adaptive\ Complexity\ Adjustment}$:
\
FlashMode Adaptive not only adapts to your reading speed through your gaze but also adjusts based on the lexical complexity of each text chunk. Leveraging a pre-trained Large Language Model (LLM), each chunk is scored for complexity. This score is then used to adjust the WPM for subsequent chunks, ensuring that the reading challenge is optimised for your comprehension and speed. This dynamic adjustment process happens after each chunk is displayed, allowing for a seamless reading experience.

\
$\color{red}{Difficulty\ Levels}$:
\
FlashMode Adaptive offers three levels of difficulty, each designed to cater to different user proficiencies:
- $\color{darkred}{Beginner}$: Ideal for those new to speed reading.
- $\color{darkred}{Intermediate}$: For readers with some experience in dynamic reading environments.
- $\color{darkred}{Expert}$: For those who seek to challenge their reading capabilities to the limit.

### AI Quiz Generation
After your reading sessions, AI-generated quizzes designed to test comprehension will be presented. These quizzes are crucial for addressing the trade-offs between speed and comprehension commonly seen with traditional speed reading techniques. Currently being refined for improved question generation, this feature also accommodates ***user-uploaded texts***, reinforcing our commitment to user-centric learning experiences.

### User Analytics
Kiraka.ai provides an analytics page to help users track their reading (average WPM) and comprehension performance (Quiz Score). Displayed through informative graphs, these analytics allow users to reflect on their progress and stay motivated, ideal for those looking to systematically enhance their reading skills.

## Contact Us
For more information or if you have any questions, please contact us at: srp.doc.ic.ac.uk@gmail.com


## Terms and Conditions
For more information about our terms and conditions, please visit the following page: https://srp.doc.ic.ac.uk/terms


## Authors
- *Fadi Zahar* **(fadi.zahar23@imperial.ac.uk)**
- *Konstantinos Mitsides* **(konstantinos.mistides23@imperial.ac.uk)**
- *Kyoya Higashino* **(kyoya.higashino23@imperial.ac.uk)**
- *Matis Bodaghi* **(matis.bodaghi23@imperial.ac.uk)**
- *Jack Hau* **(jack.hau23@imperial.ac.uk)**
- *Evangelos Georgiadis* **(evangelos.geordiadis23@imperial.ac.uk)**
<br><br/>

>Thank you for being a part of our journey to push the limits of accelerated reading! We invite you to explore Kiraka.ai and would love to hear about your experiences and feedback as you discover the possibilities of speed reading with us.
