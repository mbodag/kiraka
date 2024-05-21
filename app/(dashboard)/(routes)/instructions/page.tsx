import React from 'react';
import { auth, currentUser } from "@clerk/nextjs";
import styles from '../Dashboard.module.css';
import DashboardLayout from '../layout';
import { SelectedTextProvider } from "@/contexts/SelectedTextContext";
import Routes from '@/config/routes';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TiFlash } from "react-icons/ti";
import { HiMiniDocumentText } from "react-icons/hi2";


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
          <div className="home-container" style={{ maxWidth: '70vw', width: '100%', textAlign: 'center' }}>

            <h1 style={{ fontSize: '2.5rem' }}>Welcome to Kiraka.ai!</h1>

            <ul style={{ listStyle: 'none', fontSize: '14px', padding: '5px' , marginTop: '15px'}}>
              <p>This platform&apos;s main feature, FlashMode, uses real-time eye-tracking technology to enhance your reading speed.</p>
            </ul>

            <ul style={{ listStyle: 'none', lineHeight: '1.6', fontSize: '14px', padding: '20px', marginTop: '20px' }}>
              <li>Multiple reading modes are available on this website, depending on what works better for you:</li>
              <li className='mx-2 bg-amber-50 shadow-lg rounded-xl'>
                <div className="" style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <HiMiniDocumentText className="text-2xl" style={{ marginRight: '20px' }} />
                  </div>
                  <div>
                    <strong>DocMode:</strong> See the text in full, with the option to
                    <span style={{ color: 'rgb(0, 100, 200)', fontWeight: 'bold' }}> add a pointer </span>
                    <span>to follow the pace you set, or </span> 
                    <span className="hoverable" style={{ color: 'rgb(150, 70, 0)' }}>
                      <b>bo</b>ld <b>t</b>he <b>begin</b>ning <b>o</b>f <b>wor</b>ds
                    </span> to help you focus.
                  </div>
                </div>
              </li>
              <li className='mx-2 mt-2 bg-amber-50 shadow-lg rounded-xl'>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <TiFlash className="text-3xl" style={{ marginRight: '15px' }} />
                  </div>
                  <div>
                    <strong>FlashMode:</strong> Experience text in chunks, displayed sequentially until the entire content is read.
                    This method aims to improve both focus and speed. Optional eye tracking can be used to adapt to your speed.
                  </div>
                </div>
                <div className="pt-4" style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <TiFlash className="text-3xl" style={{ marginRight: '15px', opacity: 0 }} />
                  </div>
                  <div>
                  <span style={{ fontStyle: "italic"}}>Technology:</span> For gaze tracking, we use <a href="https://webgazer.cs.brown.edu" target='_blank' rel="noopener noreferrer"><span style={{ fontStyle: "italic", color: 'purple', fontWeight: 'bold'}}>WebGazer</span></a>, a tool developed and maintained by researchers at Brown University.
                  </div>
                </div>
              </li>
              <br></br>

              <li className='mx-2 mt-2 bg-red-50 shadow-lg rounded-xl'>
                <strong>Important Tips:</strong> In FlashMode, <span style={{ color: 'rgb(200, 0, 0)', fontWeight: 'bold' }}>promptly return your gaze to the left after reading each sentence</span>. This motion should be part of your speed reading rhythm. Our algorithm will automatically detect it and dynamically adjusts your WPM (Words Per Minute) to both challenge and match your reading speed. To ensure the gaze detection remains accurate and to prevent premature transitions, <span style={{ color: 'rgb(200, 0, 0)', fontWeight: 'bold' }}>when needed, consider blinking at the end of the sentence before shifting your gaze</span>. This helps refresh your eyes and minimises potential errors in gaze tracking due to involuntary movements.
                <br></br><br></br>
                <strong>Adjusting for Accuracy:</strong> If you notice unusual results with WPM adjustments, it may indicate a need to <span style={{ color: 'rgb(200, 0, 0)', fontWeight: 'bold' }}>recalibrate the gaze tracking system</span>. To recalibrate, simply press the WebGazer button located on the top right corner while in FlashMode.
              </li>
              <br></br>

              <li className='mx-2 mt-2 bg-cyan-50 shadow-lg rounded-xl'>
                <strong>Thank you for being a test user!</strong> These are the features we would like you to explore and give us feedback on:
                <br></br><br></br>
                <div className='mx-5 mt-2'>
                  • Use <a href={Routes.DOCMODE}><b>Docmode</b></a> and explore the different <b>features</b> that can be found in the control panel above the text.
                </div>
                <div className='mx-5 mt-2'>
                  • Use <a href={Routes.DEFAULT_MODE}><b>Flashmode</b></a> and explore both the <b>static</b> and <b>adaptive</b> configurations. In FlashMode Adaptive, we have introduced a new toggle feature called complexity mode. Please test it out to see if it improves the speed adjustment.
                </div>
                <div className='mx-5 mt-2'>
                  • You can now speedread your own texts! Use our new <a href={Routes.UPLOAD}><b>upload</b></a> feature with any mode you want and try out the generated quizzes on your text!
                </div>
              </li>
              <br></br>

              <li>After your session, don&apos;t forget to <span style={{ color: 'rgb(0, 100, 250)', fontWeight: 'bold' }}>save your performance and tackle our custom quiz to test your understanding of the content.</span></li>
              <li>Please <a href={Routes.FEEDBACK} target='_blank' rel="noopener noreferrer"><span style={{ color: 'rgb(0, 180, 50)', fontWeight: 'bold' }}>give us feedback</span></a> about your experience when you&apos;re done!</li>
            </ul>
            <div className="text-sm" style={{ marginTop: '20px', marginBottom: '20px' }}>
              <label htmlFor="terms">By advancing, you agree to the <a href="/terms" target='_blank' rel="noopener noreferrer"><u>Terms and Conditions</u></a></label>
            </div>
            <div>
              <Link href={Routes.DEFAULT_MODE} passHref>
                <Button className="border-2 flash-orange-border rounded-xl bg-amber-200 hover:bg-amber-500 text-black navbar-dashboard-font">Start Your Speed Reading Session!</Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </SelectedTextProvider>
  );
}


export const runtime = "edge";
