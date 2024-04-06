// pages/quiz.tsx or similar file
import React from 'react';
import DashboardLayout from '../layout'; // Adjust the path if necessary
import QuizDisplay from "@/components/quiz-display";
import styles from '../dashboard/DashboardPage.module.css';
import { SelectedTextProvider } from '../../../../contexts/SelectedTextContext'; // Adjust the import path if necessary

const QuizPage: React.FC = () => {
  return (
    <SelectedTextProvider>
      <DashboardLayout navbarType="quiz">
        <div className={styles.dashboardBg + " flex justify-center pt-20 pb-8 min-h-screen quiz-font"}>
          <div>
            <QuizDisplay />
          </div>
        </div>
      </DashboardLayout>
    </SelectedTextProvider>
  );
};

export default QuizPage;
