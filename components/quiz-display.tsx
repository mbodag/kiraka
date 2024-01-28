"use client";

import React, { useState } from 'react';
import styles from '@/app/(dashboard)/(routes)/quiz/QuizDisplay.module.css';
import Link from 'next/link';

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
    options: ["Regular breaks", "Time management and task prioritization", "Pursuing personal interests", "Flexible working conditions"],
    answer: "Time management and task prioritization"
  }
];

const QuizDisplay: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    // For now, it simply moves to the next question
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption("");
    } else {
      // Handle the end of the quiz
      console.log("Quiz completed");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption("");
    }
  };

  const question = quizQuestions[currentQuestionIndex];

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