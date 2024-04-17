// pages/webgazer.tsx or a similar file
"use client";

import React, { useEffect } from "react";
import DashboardLayout from "../layout";
import Mode2Display from "@/components/mode-2/mode-2-display";
import { PracticeIDProvider } from "@/contexts/PracticeIDContext";
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; // Adjust the import path if necessary
import { auth, currentUser, useAuth } from "@clerk/nextjs";

export default function WebgazerPage() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
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

  // const { userId } = auth();

  // const user = await currentUser();
  // const data = JSON.stringify({ user_id: userId });
  // console.log(data);

  // if (userId) {
  //   // console.log(userId);
  //   try {
  //     const response = await fetch(
  //       "http://localhost:3000/api/store-user-data",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ user_id: userId }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(
  //         `HTTP error! status: ${response.status} ${response.url}`
  //       );
  //     }

  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

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

// export const config = {
//   runtime: "edge",
// };

export const runtime = "edge"
