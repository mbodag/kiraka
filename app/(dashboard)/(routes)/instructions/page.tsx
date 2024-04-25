import React from 'react';
import { auth, currentUser, UserButton } from "@clerk/nextjs";
import styles from '../Dashboard.module.css';
import DashboardLayout from '../layout';
import { SelectedTextProvider } from "@/contexts/SelectedTextContext";
import Routes from '@/config/routes';
import Link from "next/link";
import { Button } from "@/components/ui/button";


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
            <div className={styles.dashboardBg + " flex justify-center pb-8 min-h-screen monospace-jetbrains-mono"}>
                        <div className="home-container" style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
                          <h1 style={{ fontSize: '2.5rem' }}>Welcome to Kiraka.ai!</h1>
                          <ul style={{ listStyle: 'none', fontSize: '14px', padding: '5px' , marginTop: '15px'}}>
                            <p>This platform uses real-time eye-tracking technology to enhance your reading speed through our FlashMode feature.</p>
                          </ul>
                          <ul style={{ listStyle: 'none', lineHeight: '1.6', fontSize: '14px', padding: '20px', marginTop: '20px' }}>
                            <li><strong>Technology:</strong> We use WebGazer, a gaze-tracking tool developed and maintained by researchers at Brown University.</li>
                            <li>Multiple reading modes are available on this website, depending on what works better for you:</li>
                            <li><strong>FlashMode:</strong> Experience text in chunks, displayed sequentially until the entire content is read. This method helps in improving focus and speed. Optional eye tracking can be used to adapt to your speed.</li>
                            <li><strong>DocMode:</strong> See the text in full, with the option to <span style={{ color: 'rgb(200, 0, 0)', fontWeight: 'bold' }}>add a <span className='highlighted'>pointer</span></span> to follow the pace you set, or <span className="hoverable" style={{ color: 'rgb(150, 70, 0)' }}><b>bo</b>ld <b>t</b>he <b>begin</b>ning <b>o</b>f <b>wor</b>ds</span> to help you focus.</li>
                            <li>
                              <strong>Important Tip:</strong> In FlashMode, <span style={{ color: 'rgb(200, 0, 0)', fontWeight: 'bold' }}>promptly return your gaze to the left after reading each sentence</span>. This motion should be part of your speed reading rhythm. Our algorithm will automatically detect it and dynamically adjusts your WPM (Words Per Minute) to both challenge and match your reading speed. To ensure the gaze detection remains accurate and to prevent premature transitions, <span style={{ color: 'rgb(150, 0, 200)', fontWeight: 'bold' }}>consider blinking at the end of each sentence before shifting your gaze</span>. This helps refresh your eyes and minimises potential errors in gaze tracking due to involuntary movements.
                            </li>
                            <li>
                              <strong>Adjusting for Accuracy:</strong> If you notice unusual results with WPM adjustments, it may indicate a need to <span style={{ color: 'rgb(200, 0, 0)', fontWeight: 'bold' }}>recalibrate the gaze tracking system</span>. To recalibrate, simply press the WebGazer button located on the top right corner while in FlashMode.
                            </li>
                            <li>
                              After your session, you can <span style={{ color: 'rgb(0, 100, 250)', fontWeight: 'bold' }}>save your performance and tackle our custom quiz to test your understanding of the content.</span>
                            </li>
                            <div style={{ marginTop: '20px' }}>
                              <input type="checkbox" id="terms" />
                              <label htmlFor="terms">I agree to the <a href="/terms">Terms and Conditions</a></label>
                            </div>
                            <a href='/flash-mode'>
                            <button className="quiz-next-button">
                            Click here to begin your reading session. Enjoy!
                            </button>
                            </a>
                        
                            
                          </ul>
                          
                            <div>
                      <Link href={Routes.DEFAULT_MODE} passHref>
                        <Button className="mt-5 border-2 flash-orange-border rounded-xl bg-amber-200 hover:bg-amber-500 text-black navbar-dashboard-font">Start Your Speed Reading Session!</Button>
                      </Link>
                    </div>
                </div>
                      </div>
                    </DashboardLayout>
                  </SelectedTextProvider>
                  );
}


export const runtime = "edge";
