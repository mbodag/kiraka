// pages/webgazer.tsx or a similar file
import React from 'react';
import styles from '../dashboard/DashboardPage.module.css';
import DashboardLayout from '../layout';
import Mode2Display from "@/components/mode-2/mode-2-display";
import { SelectedTextProvider } from '@/contexts/SelectedTextContext'; // Adjust the import path if necessary
import { auth, currentUser } from "@clerk/nextjs";


export default async function WebgazerPage() {
  const { userId } = auth();

  const user = await currentUser();
  const data = JSON.stringify({ user_id: user?.id });
  console.log(data);

  if (userId) {
    try {
      const response = await fetch(
        "http://localhost:3000/api/store-user-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user?.id }),
        }
      );

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }


  const gapSize = '15px';
  
  return (
    <SelectedTextProvider>
    <DashboardLayout navbarType="standard-auto">
      <div
        className={
          styles.dashboardBg +
          " flex flex-col justify-start w-full pt-8 pb-10 min-h-screen"
        }
        style={{ paddingTop: "150px" }}
      >
        {/* Parent div with horizontal layout */}
        <div
          className="flex justify-center items-start w-full px-6"
          style={{ gap: gapSize }} // Adjust the gap as needed
        >
          {/* Div for Mode2Display, taking more space */}
          <div
            className="bg-white rounded-lg shadow-lg p-8 pt-2 my-2 flex-1"
            style={{
              maxWidth: `calc(100% - var(--sidebar-width) - ${gapSize})`, // Adjust based on your preference
              height: "25vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Mode2Display />
          </div>

          {/* Smaller div on the right with width of var(--sidebar-width) minus gap */}
          <div
            className="bg-white rounded-lg shadow-lg p-8 pt-2 my-2"
            style={{
              width: `calc(var(--sidebar-width) - ${gapSize})`,
              height: "25vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Content of the smaller div goes here */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  </SelectedTextProvider>
  );
}

export const config = {
  runtime: "edge",
};