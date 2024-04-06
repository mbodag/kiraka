"use client";

import React, { useState, useEffect } from 'react';
import styles from '@/app/(dashboard)/(routes)/quiz/QuizDisplay.module.css';
import { useSelectedText } from "../contexts/SelectedTextContext"; // Adjust path if necessary

interface QuizQuestion {
  correct_answer: string;
  multiple_choices: string;
  question_content: string;
  question_id: number;
  text_id: number;
}

// Define your quiz questions and answers


const QuizDisplay: React.FC = () => {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const { selectedTextId } = useSelectedText(); // Use the ID from context

  useEffect(() => {
    const fetchQuizQuestions = async (textId: number) => {
      try {
        const response = await fetch(`/api/texts/${textId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const formattedQuestions: QuizQuestion[] = data.quiz_questions.map((question: QuizQuestion) => ({
          correct_answer: question.correct_answer,
          multiple_choices: question.multiple_choices.split(';'), // Now splitting
          question_content: question.question_content,
          question_id: question.question_id,
          text_id: question.text_id
        }));
        setQuizQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error fetching text:', error);
      }
    };

    if (selectedTextId) {
      fetchQuizQuestions(selectedTextId);
    }
  }, [selectedTextId]);

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === quizQuestions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }

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
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(quizQuestions[currentQuestionIndex - 1].correct_answer);
    }
  };

  const question = quizQuestions[currentQuestionIndex] || { correct_answer: '', multiple_choices: [], question_content: '' }; // Fallback for initial state

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
      <p className="quiz-question">{question.question_content}</p>
      <div className="quiz-options">
        {question.multiple_choices.map((option, index) => (
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