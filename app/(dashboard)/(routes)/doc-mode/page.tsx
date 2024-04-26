import React from 'react';
import { auth, currentUser } from "@clerk/nextjs";
import styles from '../Dashboard.module.css';
import DashboardLayout from '../layout';
import Mode0Display from "@/components/doc-mode/doc-mode-display";
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; // Adjust the import path as necessary
import { PracticeIDProvider } from "@/contexts/PracticeIDContext";

export default async function DashboardPage() {
  const { userId } = auth();
  const user = await currentUser();
  const data = JSON.stringify({ user_id: user?.id });
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

  return (
    <SelectedTextProvider>
      <PracticeIDProvider>
      <DashboardLayout navbarType="standard-manual">
        <div className={styles.dashboardBg + " flex justify-center pt-10 pb-8 min-h-screen"}>
          {/* The Sidebar component will be included via DashboardLayout based on navbarType */}
            <Mode0Display />
        </div>
      </DashboardLayout>
      </PracticeIDProvider>
    </SelectedTextProvider>
  );
}

export const runtime = "edge";
