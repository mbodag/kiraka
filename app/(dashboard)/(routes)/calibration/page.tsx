"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ExtendedWindow extends Window {
  webgazer?: any; // Adjust the type based on the 'webgazer' object
}

let extendedWindow: ExtendedWindow | undefined;

if (typeof window !== "undefined") {
  extendedWindow = window as ExtendedWindow;
}

export default function WebgazerCalibration() {
  const [webgazerInitialized, setWebgazerInitialized] = useState(false);
  const [calibrationStarted, setCalibrationStarted] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [allCalibrated, setAllCalibrated] = useState(false);

  const startCalibration = () => {
    setCalibrationStarted(true);
    if (extendedWindow) {
      extendedWindow.webgazer.showPredictionPoints(true);
    }
    setShowInstructions(false);
  };

  const handleGotItClick = () => {
    setShowInstructions(false);
  };

  useEffect(() => {
    if (webgazerInitialized) {
      initCalibrationPoints();
    }
  }, [webgazerInitialized]);

  const initWebgazer = async () => {
    try {
      const webgazerModule = require("webgazer");

      if (extendedWindow) {
        extendedWindow.webgazer = webgazerModule.default
          .setRegression("weightedRidge")
          .setTracker("TFFacemesh")
          .applyKalmanFilter(true)
          .showVideo(true)
          .showPredictionPoints(false)
          .addMouseEventListeners()
          .saveDataAcrossSessions(false);

        extendedWindow.webgazer
          .setGazeListener((data: any, elapsedTime: number) => {
            // gaze listener
            console.log(data, elapsedTime);
          })
          .begin();
      }
      setWebgazerInitialized(true);
    } catch (err) {
      console.error(err);
    }
  };

  const initCalibrationPoints = () => {
    setCalibrationPoints({
      Pt1: {
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 + 300,
        clicks: 0,
      },
      Pt2: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 300,
        clicks: 0,
      },
      Pt3: {
        x: window.innerWidth / 2 + 300,
        y: window.innerHeight / 2 + 300,
        clicks: 0,
      },
      Pt4: {
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2,
        clicks: 0,
      },
      Pt5: { x: window.innerWidth / 2, y: window.innerHeight / 2, clicks: 0 },
      Pt6: {
        x: window.innerWidth / 2 + 300,
        y: window.innerHeight / 2,
        clicks: 0,
      }, // Top-center
      Pt7: {
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 300,
        clicks: 0,
      }, // Right-center
      Pt8: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 - 300,
        clicks: 0,
      }, // Bottom-center
      Pt9: {
        x: window.innerWidth / 2 + 300,
        y: window.innerHeight / 2 - 300,
        clicks: 0,
      }, // Left-center
    });
  };

  const handleCalibrationClick = (pointID: string) => {
    const updatedPoints = { ...calibrationPoints };
    updatedPoints[pointID].clicks += 1;
    setCalibrationPoints(updatedPoints);

    if (updatedPoints[pointID].clicks === 5) {
      console.log("Calibration point complete");
    }

    const allCalibrated = Object.values(updatedPoints).every(
      (point) => point.clicks >= 5
    );
    if (allCalibrated) {
      console.log("All calibration points complete");
      setAllCalibrated(true);
      setCalibrationStarted(false);
      if (extendedWindow) {
        extendedWindow.webgazer
          .showPredictionPoints(true)
          .showVideo(false)
          .removeMouseEventListeners();
      }

      initCalibrationPoints();
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <button
        onClick={initWebgazer}
        style={{
          backgroundColor: "#4CAF50", // Green background
          color: "white", // White text
          padding: "10px 20px", // Padding around text
          margin: "10px", // Margin around the button
          border: "none", // No border
          borderRadius: "5px", // Rounded corners
          cursor: "pointer", // Cursor changes to a pointer on hover
          fontSize: "16px", // Font size
          transition: "background-color 0.3s ease", // Smooth transition for background color
        }}
      >
        Initialize WebGazer
      </button>
      {webgazerInitialized && (
        <button
          onClick={startCalibration}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#008CBA", // Blue background
            color: "white", // White text
            padding: "10px 20px", // Padding around text
            border: "none", // No border
            borderRadius: "5px", // Rounded corners
            cursor: "pointer", // Cursor changes to a pointer on hover
            fontSize: "16px", // Font size
            transition: "background-color 0.3s ease", // Smooth transition for background color
          }}
        >
          Start Calibration
        </button>
      )}
      {calibrationStarted &&
        Object.entries(calibrationPoints).map(([pointId, point]) => (
          <button
            key={pointId}
            onClick={() => handleCalibrationClick(pointId)}
            style={{
              position: "absolute",
              left: `${point.x}px`,
              top: `${point.y}px`,
              backgroundColor: point.clicks >= 5 ? "yellow" : "red",
              // Additional styling as needed
            }}
            disabled={point.clicks >= 5}
          >
            {pointId}
          </button>
        ))}
      {allCalibrated && (
        <Link href="../dashboard">
          <Button>Go Back</Button>
        </Link>
      )}
      {showInstructions && (
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "200px",
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
          <p style={{ color: "black" }}>
            Please follow the on-screen points and click on each one to
            calibrate the eye-tracking system. Ensure you are in a well-lit area
            and maintain a consistent position during calibration.
          </p>
          <button
            onClick={handleGotItClick}
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}