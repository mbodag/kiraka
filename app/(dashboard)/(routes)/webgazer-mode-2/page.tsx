// pages/webgazer.tsx or a similar file
import React from 'react';
import styles from '../dashboard/DashboardPage.module.css';
import DashboardLayout from '../layout';
import Mode2Display from "@/components/mode-2/mode-2-display";
import { SelectedTextProvider } from '@/contexts/SelectedTextContext';

const WebgazerPage: React.FC = () => {
  return (
    <SelectedTextProvider>
      <DashboardLayout navbarType="standard-auto">
        <div
          className={
            styles.dashboardBg + " flex flex-col justify-start w-full pt-8 pb-10 min-h-screen"
          }
          style={{ paddingTop: '150px' }}
        >
          <div className="bg-white rounded-lg shadow-lg mx-auto p-8 pt-2 my-2" style={{
              width: '90%', height: '25vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Mode2Display />
          </div>
        </div>
      </DashboardLayout>
    </SelectedTextProvider>
  );
};

export default WebgazerPage;
