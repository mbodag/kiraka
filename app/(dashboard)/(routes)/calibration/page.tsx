"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWebGazer } from '@/contexts/WebGazerContext';
import { SiTarget } from "react-icons/si";
import Routes from '@/config/routes';
import { useAuth } from "@clerk/nextjs";


// Type definitions for extended window object and calibration points
interface ExtendedWindow extends Window { webgazer?: any; } // Adjust the type based on the 'webgazer' object
interface CalibrationPoint { x: number; y: number; clicks: number; }
interface CalibrationPoints { [key: string]: CalibrationPoint; }

// Extend the window object to include webgazer
let extendedWindow: ExtendedWindow | undefined;
if (typeof window !== "undefined") {
  extendedWindow = window as ExtendedWindow;
}

export default function WebgazerCalibration() {
  const [webgazerInitialized, setWebgazerInitialized] = useState(false);
  const [calibrationStarted, setCalibrationStarted] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoints>({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [allCalibrated, setAllCalibrated] = useState(false);
  const [showCalibrationButton, setShowCalibrationButton] = useState(true);

  // Accessing setWebgazerActive from context
  const { isWebGazerActive, setWebGazerActive } = useWebGazer();
  const { userId } = useAuth();

  // Function to start the calibration process
  const startCalibration = () => {
    setAllCalibrated(false);
    setCalibrationStarted(true);
    setShowCalibrationButton(false);
    if (extendedWindow && extendedWindow.webgazer) {
      // Show prediction points if WebGazer is available
      extendedWindow.webgazer.showPredictionPoints(true).addMouseEventListeners();
      extendedWindow.webgazer.showVideo(true)
    }
    setShowInstructions(false); // Hide instructions overlay
  };

  // Function to hide instructions when the user clicks "Got it"
  const handleGotItClick = () => {
    setShowInstructions(false);
  };

  // useEffect hook to initialise calibration points once WebGazer is initialised
  useEffect(() => {
    if (webgazerInitialized) {
      initCalibrationPoints();
    }
  }, [webgazerInitialized]);

  useEffect(() => {
    console.log("Is WebGazer Active (updated):", isWebGazerActive);
  }, [isWebGazerActive]);


  // Asynchronous function to initialise the WebGazer library
  const initWebgazer = async () => {
    if (!extendedWindow) return; // Exit if we don't have window object

    try {
      // Dynamically imports the WebGazer library
      const webgazerModule = await import("webgazer");

        // Configures WebGazer with specific settings
        extendedWindow.webgazer = webgazerModule.default
          .setRegression("weightedRidge") // Sets the regression model to "weightedRidge"
          .setTracker("TFFacemesh") // Sets the tracker to "TFFacemesh"
          .applyKalmanFilter(true) // Applies a Kalman filter for smoother predictions
          .showVideo(true) // Shows the video feed from the webcam
          .showPredictionPoints(false) // Initially hides the prediction points
          .removeMouseEventListeners() // Adds mouse event listeners for calibration
          .saveDataAcrossSessions(false); // Disables saving data across sessions for privacy

        // Sets up a gaze listener to log data and elapsed time for each prediction
        extendedWindow.webgazer
          .setGazeListener((data: any, elapsedTime: number) => {
            if (data == null) {
              return; // Exit if data is null
            }
            var xprediction = data.x; // Extract the x-coordinate
            var yprediction = data.y; // Extract the y-coordinate

            // gaze listener
            //console.log("X prediction:", xprediction, "Y prediction:", yprediction, "Elapsed Time:", elapsedTime);
          })
          .begin(); // Starts the WebGazer eye-tracking
      
      console.log("Initialising WebGazer...");
      setWebgazerInitialized(true);
    } catch (error) {
      console.error("Failed to initialise WebGazer:", error);
      setWebGazerActive(false); // Ensure context is updated on failure
    }
  };


  // Function to initialise calibration points on the screen
  const initCalibrationPoints = () => {
    // Sets up initial positions and click counters for each calibration point
    setCalibrationPoints({
      // Each point is positioned relative to the screen's width and height
      // and initialised with 0 clicks
      Pt1: { x: 350, y: 30, clicks: 0 },
      Pt2: { x: window.innerWidth / 2, y: 30, clicks: 0 },
      Pt3: { x: window.innerWidth -50, y: 30, clicks: 0 },
      Pt4: { x: 30, y: window.innerHeight / 2, clicks: 0 },
      Pt5: { x: window.innerWidth / 2, y: window.innerHeight / 2, clicks: 0 },
      Pt6: { x: window.innerWidth - 50, y: window.innerHeight / 2, clicks: 0 }, // Top-center
      Pt7: { x: 30, y: window.innerHeight - 50, clicks: 0 }, // Right-center
      Pt8: { x: window.innerWidth / 2, y: window.innerHeight - 50, clicks: 0 }, // Bottom-center
      Pt9: { x: window.innerWidth - 50, y: window.innerHeight - 50, clicks: 0 }, // Left-center
    });
  };

  // Handles clicks on calibration points
  const handleCalibrationClick = (pointID: string) => {
    const updatedPoints: CalibrationPoints = { ...calibrationPoints }; // Copies the current state of calibrationPoints to update it
    updatedPoints[pointID].clicks += 1; // Increments the click counter for the clicked calibration point
    setCalibrationPoints(updatedPoints);  // Updates the calibrationPoints state with the new click counts

    if (updatedPoints[pointID].clicks === 5) {  // Checks if the clicked point has reached 5 clicks
      console.log("Calibration point complete");
    }

    // Checks if all calibration points have been clicked 5 times
    const allCalibrated = Object.values(updatedPoints).every(
      (point: CalibrationPoint) => point.clicks >= 5
    );

    // If all points are calibrated, logs the completion and updates state
    if (allCalibrated) {
      console.log("WebGazer is fully calibrated and ready.");
      setAllCalibrated(true); // Marks all points as calibrated
      setCalibrationStarted(false); // Stops the calibration process
      setWebGazerActive(true); // Now updates context to reflect active state after calibration is complete

      if (extendedWindow) {
        // Shows prediction points, hides the video feed, and removes mouse event listeners
        extendedWindow.webgazer
          .showPredictionPoints(false)
          .showVideo(false)
          .removeMouseEventListeners();
      }

      // Resets the calibration points for potential re-calibration
      initCalibrationPoints();
    }
  };

  // State hook to track if the component has mounted
  const [isMounted, setIsMounted] = useState(false);

  // Effect hook to set isMounted to true after the component has mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Conditional rendering based on the isMounted state
  if (!isMounted) {
    return null;  // Renders nothing if the component hasn't mounted yet
  }


  const resetAndReinitWebgazer = async () => {
      if (extendedWindow && extendedWindow.webgazer) {
          await extendedWindow.webgazer.clearData();
          extendedWindow.webgazer.end();
      }

      // Reset the state
      setWebgazerInitialized(false);
      setCalibrationStarted(false);
      setCalibrationPoints({});
      setShowCalibrationButton(true);

      // Reinitialize WebGazer
      await initWebgazer();
      startCalibration();
  };


  const calculateColor = (clicks: number) => {
    const maxClicks = 5;
    // Check if calibration is complete
    if (clicks >= maxClicks) {
      return 'rgb(0, 200, 0)'; // Green color when done
    }
  
    // Starting RGB for red
    const startColor = { r: 255, g: 0, b: 0 };
    // Ending RGB for blue
    const endColor = { r: 100, g: 0, b: 0 };
  
    // Linear interpolation between start and end colors based on clicks
    const r = Math.round(startColor.r + ((endColor.r - startColor.r) * (clicks / maxClicks)));
    const g = Math.round(startColor.g + ((endColor.g - startColor.g) * (clicks / maxClicks)));
    const b = Math.round(startColor.b + ((endColor.b - startColor.b) * (clicks / maxClicks)));
  
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  return (
    <div>
      {/* Initialise WebGazer Button */}
      <button
        onClick={allCalibrated ? resetAndReinitWebgazer : initWebgazer} // Calls the initWebgazer function when clicked
        className={allCalibrated ? "OrangeButton" : "GreenButton"}
      >
        {allCalibrated ? "Re-calibrate" : "Initialise WebGazer"}
      </button>

      {/* Conditionally rendered Start Calibration Button */}
      {webgazerInitialized && showCalibrationButton && (
        <button
          onClick={startCalibration} // Calls the startCalibration function when clicked
          className="BlueButton"
        >
          Start Calibration
        </button>
      )}

      {/* Calibration Points Buttons */}
      {calibrationStarted &&
        Object.entries(calibrationPoints).map(([pointId, point]) => (
          <button
            key={pointId}
            onClick={() => handleCalibrationClick(pointId)}
            style={{
              position: "absolute",
              left: `${point.x}px`,
              top: `${point.y}px`,
              background: 'none', // Make the button background transparent
              border: 'none', // Remove button border
              cursor: "pointer",
              zIndex: 9999,
            }}
            disabled={point.clicks >= 5}
          >
            <SiTarget style={{
              color: calculateColor(point.clicks),
              fontSize: "20px"
            }} />
          </button>
        ))}

      {/* Link to Dashboard if All Calibrated */}
      {allCalibrated && (
        <div style={{ position: 'absolute', top: '0', right: '0', padding: '0px' }}>
          <Link href={Routes.DEFAULT_MODE}>
              <button className="GreenButton">Start Speed Reading</button>
          </Link>
        </div>
      )}

      {/* Instructions Overlay */}
      {showInstructions && (
        <div
          style={{
            position: "absolute",
            width: "600px",
            // height: "200px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <p style={{ 
              color: "black",
              paddingTop: "5px",
              paddingBottom: "10px",
          }}>
              Click each on-screen target point <span style={{ color: 'rgb(200, 0, 0)', fontWeight: '', fontStyle: 'italic' }}>at least 5 times</span> until it changes colour <span style={{ fontStyle: 'italic', textDecoration: 'underline' }}>from red to green</span> to calibrate the eye-tracking system. <span style={{ color: 'rgb(200, 0, 0)', fontWeight: '', fontStyle: 'italic' }}>While clicking, focus your gaze on the center of each target</span>.<br /><br />
              For best results, <span style={{ color: 'rgb(0, 0, 180)', fontWeight: '', fontStyle: 'italic' }}>remain in a well-lit area</span>, <span style={{ color: 'rgb(0, 0, 180)', fontWeight: '', fontStyle: 'italic' }}>keep your head still</span> during calibration, and <span style={{ color: 'rgb(0, 0, 180)', fontWeight: '', fontStyle: 'italic' }}>avoid significant changes to your environment</span> while using WebGazer.<br /><br />
              When prompted, please <span style={{ color: 'rgb(150, 0, 150)', fontWeight: '', fontStyle: 'italic' }}>allow “srp.doc.ic.ac.uk” to use your camera</span>. Note that the active camera is solely used to track your eyes for calibration and speed reading purposes.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "5px" }}>
            {/* Got it Button */}
            <button
              onClick={handleGotItClick}
              className="GreenButton"
            >
              Got it
            </button>
            {/* Back Button */}
            <button
              onClick={() => {
                window.location.href = Routes.DEFAULT_MODE;
              }}
              className="BlackButton"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}