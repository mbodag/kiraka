"use client";

import React, { useState } from 'react';
import styles from '@/app/(dashboard)/(routes)/quiz/QuizDisplay.module.css';
import { useAuth } from "@clerk/nextjs";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  selectedAnswer: string;
  score: number;
  question_id: number;
  practice_id: number;

}

// Define your quiz questions and answers
const quizQuestions: QuizQuestion[] = [
  {
    question: "What is essential for achieving personal well-being and professional success?",
    options: ["Work-life balance", "Continuous work", "High productivity", "Stress management"],
    answer: "Work-life balance",
    selectedAnswer: "",
    score: 0,
    question_id: 3,
    practice_id: 1,
  },
  {
    question: "What can lead to increased stress and burnout?",
    options: ["Hobbies", "Flexible working conditions", "Pursuit of productivity", "Personal interests"],
    answer: "Pursuit of productivity",
    selectedAnswer: "",
    score: 0,
    question_id: 2,
    practice_id: 1,

  },
  {
    question: "What is a key factor in reducing work-related pressure and enjoying life both inside and outside the workplace?",
    options: ["Regular breaks", "Time management and task prioritisation", "Pursuing personal interests", "Flexible working conditions"],
    answer: "Time management and task prioritisation",
    selectedAnswer: "",
    score: 0,
    question_id: 1,
    practice_id: 1,

  }
];
const sendQuizResults = async (quizQuestions: QuizQuestion[], userId:any) => {
  await fetch("/api/save-quiz-results", {
    method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({'quiz_results': quizQuestions, 'user_id': userId}),
  })

}

const QuizDisplay: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const {userId} = useAuth()


  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
      quizQuestions[currentQuestionIndex].selectedAnswer = selectedOption;
      quizQuestions[currentQuestionIndex].score = quizQuestions[currentQuestionIndex].selectedAnswer === quizQuestions[currentQuestionIndex].answer? 1 : 0;
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex => currentQuestionIndex + 1);
      setSelectedOption(quizQuestions[currentQuestionIndex + 1].selectedAnswer);
    } else {
      setQuizCompleted(true);
      let counter = 0;
      quizQuestions.forEach((question) => {
        if (question.selectedAnswer === question.answer) {
          counter++;
        }
      });
      setScore(counter);
      sendQuizResults(quizQuestions, userId)
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      quizQuestions[currentQuestionIndex].selectedAnswer = selectedOption;
      quizQuestions[currentQuestionIndex].score = quizQuestions[currentQuestionIndex].selectedAnswer === quizQuestions[currentQuestionIndex].answer? 1 : 0;
      setCurrentQuestionIndex(currentQuestionIndex => currentQuestionIndex - 1);
      setSelectedOption(quizQuestions[currentQuestionIndex - 1].selectedAnswer);
    }
  };

  const question = quizQuestions[currentQuestionIndex];

  if (quizCompleted) {
    return (
      <div className="quiz-container">
        <h2 className="quiz-title">Quiz Completed!</h2>
        <p className="quiz-score">Your score: {score} out of {quizQuestions.length}</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Question {currentQuestionIndex + 1}</h2>
      <p className="quiz-question">{question.question}</p>
      <div className="quiz-options">
        {question.options.map((option, index) => (
          <div key={index} className="quiz-option">
            <input 
              type="radio" 
              id={`option-${index}`} 
              name="quiz-option" 
              value={option} 
              checked={selectedOption === option}
              onChange={() => handleOptionChange(option)}
            />
            <label htmlFor={`option-${index}`} className="quiz-label">{option}</label>
          </div>
        ))}
      </div>
      <div className="quiz-navigation">
        {currentQuestionIndex > 0 && (
          <button className="quiz-next-button" onClick={handlePreviousQuestion}>Back</button>
        )}
        {currentQuestionIndex < quizQuestions.length - 1 &&
        <button className="quiz-next-button" onClick={handleNextQuestion}>Next</button>
        }
        {currentQuestionIndex === quizQuestions.length - 1 &&
        <button className="quiz-next-button" onClick={handleNextQuestion}>End Quiz</button>
        }
      </div>
    </div>
  );
};

export default QuizDisplay;