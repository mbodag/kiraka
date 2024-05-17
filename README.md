# Kiraka.ai — Speed Reading Platform

Welcome to Kiraka.ai! Inspired by the Arabic word for reading, *[qirā'ah]*, our platform is dedicated to enhancing your reading experience through innovative, technology-driven solutions. Initiated as a university project at Imperial College London, Kiraka.ai's main feature—***FlashMode Adaptive***—leverages eye-tracking technology and lexical analysis to tailor the reading experience to your pace and comprehension needs.

Here's the link to our website: https://srp.doc.ic.ac.uk

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
    - [Adaptive Complexity Adjustment](#adaptive-complexity-adjustment)
    - [Difficulty Levels](#difficulty-levels)
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
- **Real-Time Adjustments**: Uses WebGazer's eye-tracking technology (https://webgazer.cs.brown.edu/) to adjust the WPM (Words Per Minute) dynamically in FlashMode.


## Getting Started

### Prerequisites

- Node.js (version 14 or above)
- npm or yarn
- Python 3.8+
- See `requirements.txt` for a full list of required dependencies.

### Installation

1. Clone the repository:
    ```bash
    git clone https://gitlab.doc.ic.ac.uk/g237007906/kiraka.git
    ```
2. Install the required Python libraries on your (activated) virtual environment:
    ```bash
    pip install -r requirements.txt
    ```
3. Install the required dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Application 

1. First, run the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```
2. Open http://localhost:3000 in your browser to see the result; or if the latter is already taken, check your terminal for info about which localhost to open.

    **Note:** LLMs (Large Language Models) will be downloaded when you run the software. They are about 5GB in size and might take a while to download before the project starts running.


## Reading Modes

### DocMode
In DocMode, you have the freedom to see the whole text and read it at your own pace. We also have some extra features you may find useful. These are controlled via the control panel above the text.

Features include:
- `Pointer`: Enhance your reading with a karaoke-style pointer. Customise the pointer by adjusting its length and colour for optimal tracking, and set its speed to match your preferred reading pace in Words Per Minute (WPM).
- `HyperBold`: Bold the beginning of words to create artificial fixation points with varying degrees. This feature helps in improving reading speed by guiding your visual focus.
- `Others`:
    - *Dark Mode*: Switch to Dark Mode for a reading experience in low-light conditions.
    - *Focused Reading*: Choose to only display the pointer, hiding the rest of the text. This helps minimise regression (unnecessary re-reading), enhancing concentration.
    - *Font Customisation*: Freely adjust the font size to suit your visual preference, ensuring comfort and readability.


### FlashMode
Explore two configurations: **Static** and **Adaptive**.

- **Static**: Chunks of text appear in brief, rapid bursts or "flashes". Manually adjust speed with arrow keys. Pause, start, or restart at any time.

- **Adaptive (Recommended)**: Integrates WebGazer's eye-tracking to automatically adjust your WPM, encouraging faster reading. Manual WPM adjustments are still available.

#### Adaptive Complexity Adjustment
FlashMode Adaptive not only adapts to your reading speed through your gaze but also adjusts based on the lexical complexity of each text chunk. Leveraging a pre-trained Large Language Model (LLM), each chunk is scored for complexity. This score is then used to adjust the WPM for subsequent chunks, ensuring that the reading challenge is optimised for your comprehension and speed. This dynamic adjustment process happens after each chunk is displayed, allowing for a seamless reading experience.

#### Difficulty Levels
FlashMode Adaptive offers three levels of difficulty, each designed to cater to different user proficiencies:
- **`Beginner`**: Ideal for those new to speed reading.
- **`Intermediate`**: For readers with some experience in dynamic reading environments.
- **`Expert`**: For those who seek to challenge their reading capabilities to the limit.

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
