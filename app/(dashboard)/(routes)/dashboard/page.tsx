import React from 'react';
import { UserButton } from "@clerk/nextjs";
import styles from './DashboardPage.module.css';
import DashboardLayout from '../layout';
import Mode1Display from "@/components/mode-1/mode-1-display";
import Sidebar from "../../../../components/sidebar"; // Adjust the import path as necessary
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; // Adjust the import path as necessary

// DashboardPage.tsx

const DashboardPage: React.FC = () => {
  return (
    <SelectedTextProvider>
      <DashboardLayout navbarType="standard-manual">
        <div className={styles.dashboardBg + " flex justify-center pt-10 pb-8 min-h-screen"}>
          {/* The Sidebar component will be included via DashboardLayout based on navbarType */}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8 pt-2 my-2">
            <Mode1Display />
          </div>
        </div>
      </DashboardLayout>
    </SelectedTextProvider>
  );
};

export default DashboardPage;
