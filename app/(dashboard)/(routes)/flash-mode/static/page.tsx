"use client";

import React, { useEffect } from "react";
import DashboardLayout from "../../layout";
import Mode1Display from "@/components/flash-mode/flash-static-display";
import { PracticeIDProvider } from "@/contexts/PracticeIDContext";
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; // Adjust the import path if necessary
import { useAuth } from "@clerk/nextjs";

export default function WebgazerPage() {
  const { userId } = useAuth();
  useEffect(() => {
    const sendDatatoServer = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/store-user-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} ${response.url}`
          );
        }

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error("Error sending data to server: ", error);
      }
    };
    sendDatatoServer();
  });

  return (
    <SelectedTextProvider>
      <PracticeIDProvider>
        <DashboardLayout navbarType="standard-auto">
          <Mode1Display />
        </DashboardLayout>
      </PracticeIDProvider>
    </SelectedTextProvider>
  );
}

export const runtime = "edge"
