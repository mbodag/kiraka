import React from 'react';
import { auth, currentUser, UserButton } from "@clerk/nextjs";
import styles from '../dashboard/DashboardPage.module.css';
import DashboardLayout from '../layout';
import Mode1Display from "@/components/mode-1/mode-1-display";
import { SelectedTextProvider } from "@/contexts/SelectedTextContext"; // Adjust the import path as necessary

export default async function InstructionPage() {
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
      <DashboardLayout navbarType="instructions">
            <div className={styles.dashboardBg + " flex justify-center pt-10 pb-8 min-h-screen monospace-jetbrains-mono"}>
                {/* The Sidebar component will be included via DashboardLayout based on navbarType */}
                <div className="home-container" style={{ maxWidth: '800px', width: '100%', marginTop: '20px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2.5rem' }}>Welcome to Kiraka.ai!</h1>
                    <ul style={{ listStyle: 'none', fontSize: '16px', padding: '10px' , marginTop: '20px'}}>
                        <p>This platform uses real-time eye-tracking technology to enhance your reading speed through our FlashMode feature.</p>
                    </ul>
                    <ul style={{ listStyle: 'none', lineHeight: '1.6', fontSize: '16px', padding: '20px', marginTop: '20px' }}>
                        <li><strong>Technology:</strong> We use WebGazer, a gaze-tracking tool developed and maintained by researchers at Brown University.</li>
                        <li><strong>FlashMode:</strong> Experience text in chunks, displayed sequentially until the entire content is read. This method helps in improving focus and speed.</li>
                        <li>
                            <strong>Important Tip:</strong> In FlashMode, <span style={{ color: 'rgb(200, 0, 0)', fontWeight: 'bold' }}>promptly return your gaze to the left after reading each sentence</span>. This motion should be part of your speed reading rhythm. Our algorithm will automatically detect it and dynamically adjusts your WPM to both challenge and match your reading speed.
                        </li>
                        <li>
                            After your session, you can save your performance and tackle our custom quiz to test your understanding of the content.
                        </li>
                        <li>
                            To start speed reading, go to FlashMode by clicking on the button at the top of the page, then select the text you want to read from the left sidebar.
                        </li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    </SelectedTextProvider>
  );
}


export const runtime = "edge";
