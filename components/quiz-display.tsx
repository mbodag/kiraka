"use client";

import React, { useState, useEffect } from 'react';
import { useSelectedText } from "@/contexts/SelectedTextContext";
import { usePracticeID } from "@/contexts/PracticeIDContext";
import { useAuth } from "@clerk/nextjs";


interface QuizQuestion {
  correct_answer: string;
  multiple_choices: string;
  question_content: string;
  question_id: number;
  selected_answer: string;
  score: number;
  text_id: number;
}

interface ProcessedQuizQuestion extends Omit<QuizQuestion, 'multiple_choices'> {
  multiple_choices: string[]; // Now an array of strings
}


// Define the quiz questions and answers
const sendQuizResults = async (quizQuestions: ProcessedQuizQuestion[], userId: string | null | undefined, practiceId: number | null, textId: number | null) => {
  await fetch("/api/save-quiz-results", {
    method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({'quiz_results': quizQuestions, 'user_id': userId, 'text_id': textId, 'practice_id': practiceId}),
  })

}


const QuizDisplay: React.FC = () => {
  const [quizQuestions, setQuizQuestions] = useState<ProcessedQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const { selectedTextId, setSelectedTextId } = useSelectedText(); // Use the ID from context
  const { userId } = useAuth()
  const { practiceId, setPracticeId } = usePracticeID();


  useEffect(() => {
    const fetchQuizQuestions = async (textId: number) => {
      try {
        const response = await fetch(`/api/texts/${textId}?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const formattedQuestions: ProcessedQuizQuestion[] = data.quiz_questions.map((question: QuizQuestion) => ({
          correct_answer: question.correct_answer,
          multiple_choices: question.multiple_choices.split(';'), // Now splitting
          question_content: question.question_content,
          question_id: question.question_id,
          text_id: question.text_id,
          score: 0,
          selected_answer: '',
        }));
        setQuizQuestions(formattedQuestions);
      } catch (error) {
        console.error('Error fetching text:', error);
      }
    };

    if (selectedTextId && practiceId) {
      fetchQuizQuestions(selectedTextId);
    }
  }, [selectedTextId]);


  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
      quizQuestions[currentQuestionIndex].selected_answer = selectedOption;
      quizQuestions[currentQuestionIndex].score = quizQuestions[currentQuestionIndex].selected_answer === quizQuestions[currentQuestionIndex].correct_answer? 1 : 0;
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex => currentQuestionIndex + 1);
      setSelectedOption(quizQuestions[currentQuestionIndex + 1].selected_answer);
    } else {
      setQuizCompleted(true);
      let counter = 0;
      quizQuestions.forEach((question) => {
        if (question.selected_answer === question.correct_answer) {
          counter++;
        }
      });
      setScore(counter);
      sendQuizResults(quizQuestions, userId, practiceId, selectedTextId);
      setPracticeId(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      quizQuestions[currentQuestionIndex].selected_answer = selectedOption;
      quizQuestions[currentQuestionIndex].score = quizQuestions[currentQuestionIndex].selected_answer === quizQuestions[currentQuestionIndex].correct_answer? 1 : 0;
      setCurrentQuestionIndex(currentQuestionIndex => currentQuestionIndex - 1);
      setSelectedOption(quizQuestions[currentQuestionIndex - 1].selected_answer);
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
  if (practiceId){
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
  );}
  else {
    return(
      <div className="quiz-container">
      <h2>Please read the text before completing the quiz</h2>
      </div>
    )
  }
};

export default QuizDisplay;
