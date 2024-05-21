import React from 'react';
import DashboardLayout from '../layout';
import QuizDisplay from "@/components/quiz-display";
import styles from '../Dashboard.module.css';
import { SelectedTextProvider } from '@/contexts/SelectedTextContext';
import { PracticeIDProvider } from '@/contexts/PracticeIDContext';

const QuizPage: React.FC = () => {
  return (
    <PracticeIDProvider>
      <SelectedTextProvider>
        <DashboardLayout navbarType="quiz">
          <div className={styles.dashboardBg + " flex justify-center pt-20 pb-8 min-h-screen quiz-font"}>
            <div>
              <QuizDisplay />
            </div>
          </div>
        </DashboardLayout>
      </SelectedTextProvider>
    </PracticeIDProvider>
  );
};

export default QuizPage;
