// pages/webgazer.tsx or a similar file
import React from 'react';
import DashboardLayout from '../layout';
import Mode2Display from "@/components/mode-2/mode-2-display";
import { PracticeIDProvider } from '@/contexts/PracticeIDContext';
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

  
  return (
    <SelectedTextProvider>
      <PracticeIDProvider>
        <DashboardLayout navbarType="standard-auto">
              <Mode2Display />
        </DashboardLayout>
      </PracticeIDProvider>
    </SelectedTextProvider>
  );
}

export const config = {
  runtime: "edge",
};
