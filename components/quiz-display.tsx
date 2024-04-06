"use client";

import React, { useState } from 'react';
import styles from '@/app/(dashboard)/(routes)/quiz/QuizDisplay.module.css';
import { useSelectedText } from "../contexts/SelectedTextContext"; // Adjust path if necessary

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

// Define your quiz questions and answers
const quizQuestions: QuizQuestion[] = [
  {
    question: "What is essential for achieving personal well-being and professional success?",
    options: ["Work-life balance", "Continuous work", "High productivity", "Stress management"],
    answer: "Work-life balance"
  },
  {
    question: "What can lead to increased stress and burnout?",
    options: ["Hobbies", "Flexible working conditions", "Pursuit of productivity", "Personal interests"],
    answer: "Pursuit of productivity"
  },
  {
    question: "What is a key factor in reducing work-related pressure and enjoying life both inside and outside the workplace?",
    options: ["Regular breaks", "Time management and task prioritisation", "Pursuing personal interests", "Flexible working conditions"],
    answer: "Time management and task prioritisation"
  }
];

const QuizDisplay: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === quizQuestions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption("");
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(quizQuestions[currentQuestionIndex - 1].answer);
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
        <button className="quiz-next-button" onClick={handleNextQuestion}>Next</button>
      </div>
    </div>
  );
};

export default QuizDisplay;