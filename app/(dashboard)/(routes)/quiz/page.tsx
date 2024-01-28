import React from 'react';
import DashboardLayout from '../layout'; // Adjust the path if necessary
import QuizDisplay from "@/components/quiz-display"; // Make sure this component is created
import styles from '../dashboard/DashboardPage.module.css';

const QuizPage: React.FC = () => {
  return (
      <div
        className={
          styles.dashboardBg + " flex justify-center pt-16 pb-8 min-h-screen"
        }
      >
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8 my-2">
          <QuizDisplay /> {/* Your quiz content will be here */}
        </div>
      </div>
  );
};

export default QuizPage;
