import React from 'react';
import DashboardLayout from '../layout'; // Adjust the path if necessary
import QuizDisplay from "@/components/quiz-display";
import styles from '../dashboard/DashboardPage.module.css';

const QuizPage: React.FC = () => {
  return (
    <DashboardLayout navbarType="quiz">
      <div className={styles.dashboardBg + " flex justify-center pt-20 pb-8 min-h-screen"}>
        <div>
          <QuizDisplay />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuizPage;