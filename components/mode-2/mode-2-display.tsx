"use client"; 

import { useEffect, useState, useRef } from "react";
import CounterDisplay from "../mode-1/counter-display";
import '@/app/globals.css';
import { useWebGazer } from '@/contexts/WebGazerContext';

interface ExtendedWindow extends Window {
    webgazer?: {
      setGazeListener: (callback: (data: any, elapsedTime: number) => void) => ExtendedWindow;
      clearGazeListener: () => void;
    };
  }

const Mode2Display = () => {
    // Predefined text same as from Mode1Display component
    const shortStory = `In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. The relentless pursuit of productivity often leads to increased stress and a higher risk of burnout. It's crucial to set clear boundaries between work responsibilities and personal life. Effective time management and task prioritization are keys to reducing work-related pressure. These strategies allow individuals to enjoy a more fulfilling life both inside and outside the workplace. <¶> Engaging in hobbies, pursuing personal interests, and spending quality time with family and friends are essential components of a well-rounded life. These activities offer opportunities for relaxation and personal growth, contributing to overall happiness and satisfaction. <¶> On the professional front, employers play a significant role in promoting a healthy work environment. This includes offering flexible working conditions, encouraging regular breaks, and recognizing the importance of mental health. Supportive workplace cultures that value employee well-being lead to increased productivity, greater job satisfaction, and lower turnover rates. <¶> Ultimately, achieving a balance between work and life leads to improved mental and physical health, heightened job performance, and a richer, more rewarding life experience. It's about finding a rhythm that allows for both career progression and personal contentment, ensuring long-term happiness and success.`;

    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [WPM, setWPM] = useState(400); 
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(true); // Add a state to track whether the flashing is paused
    const [maxCharsPerChunk, setMaxCharsPerChunk] = useState(60); // Initial value, will be updated
    const gazeTimeRef = useRef<{ rightSide: number; total: number }>({ rightSide: 0, total: 0 });
    const wordChunks = shortStory.match(new RegExp('.{1,' + maxCharsPerChunk + '}(\\s|$)', 'g')) || [];


    // Accessing the current state of WebGazer
    const { isWebGazerActive } = useWebGazer();

    useEffect(() => {
        const calculateMaxCharsPerChunk = () => {
            // Assuming the container width matches the window width for simplicity
            // You might need to adjust this to get the actual container's width if different
            const containerWidth = window.innerWidth;
            const fontSize = 40; // Font size in pixels
            const estimatedCharWidth = fontSize * 0.6; // Estimate: adjust based on your font's characteristics
            const chars = Math.floor((containerWidth * 0.8) / estimatedCharWidth); // Adjust based on container's maxWidth (90vw here)
            setMaxCharsPerChunk(chars);
        };

        calculateMaxCharsPerChunk(); // Calculate initially

        // Recalculate when the window is resized
        window.addEventListener('resize', calculateMaxCharsPerChunk);
        
        return () => window.removeEventListener('resize', calculateMaxCharsPerChunk);
    }, []); // Empty dependency array means this runs once on mount and cleanup on unmount


    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                setWPM((prevWPM) => Math.min(prevWPM + 20, 1100)); // Increase dynamicWPM, max 1100
            } else if (event.key === "ArrowLeft") {
                setWPM((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease dynamicWPM, min 100
            } else if (event.key === "R" || event.key === "r") {
                setCurrentChunkIndex(0); // Function from the first chunk
            } else if (event.key === " ") {
                event.preventDefault(); // Prevent default action (e.g., page scrolling)
                setIsPaused((prevIsPaused) => !prevIsPaused); // Toggle pause/start
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);


    // New useEffect to handle gaze data and update WPM accordingly
    useEffect(() => {
        if (isWebGazerActive && !isPaused && typeof window !== "undefined") {
            const extendedWindow: ExtendedWindow = window as ExtendedWindow;
            extendedWindow.webgazer?.setGazeListener((data: any) => {
                if (data && data.x) {
                const sentenceDisplayElement = document.querySelector('.wordDisplay');
                    if (sentenceDisplayElement) {
                        const { left, width } = sentenceDisplayElement.getBoundingClientRect();
                        const rightBoundary = left + width * 0.7; // Adjusting to 70% to consider the rightmost part

                        // Increment total gaze time
                        gazeTimeRef.current.total += 1;

                        // Check if gaze is in the rightmost part
                        if (data.x >= rightBoundary) {
                        gazeTimeRef.current.rightSide += 1;
                        }
                    }
                }
            });

        return () => extendedWindow.webgazer?.clearGazeListener();
        }
    }, [isWebGazerActive, isPaused]);

  
    // Adjusting the useEffect for chunk display and WPM update
    useEffect(() => {
        if (!isPaused && currentChunkIndex < wordChunks.length) {
        const intervalDuration = (60000 / WPM) * (maxCharsPerChunk / 5);  // 5 chars per word
        const timer = setInterval(() => {
            if (isWebGazerActive) {
                // Calculate percentage of time spent looking at the right side
                const gazeRightPercentage = (gazeTimeRef.current.rightSide / gazeTimeRef.current.total) * 100;
                let newWPM = WPM;

                // NEW: Adjust WPM based on gazeRightPercentage and ensure it's an integer
                if (gazeRightPercentage > 50) {
                    // Increase WPM by 10% and round to nearest integer
                    newWPM = Math.round(WPM +50);
                } else {
                    // Decrease WPM by 10% and round to nearest integer
                    newWPM = Math.round(WPM -30);
                }

                // NEW: Only update if there's a significant change
                if (Math.abs(newWPM - WPM) >= 1) {
                    setWPM(newWPM);
                }
            }

            // Prepare for next sentence
            setCurrentChunkIndex((prevIndex) => {
                if (prevIndex + 1 >= wordChunks.length) {
                    clearInterval(timer); // Stop the interval when reaching the end
                    return prevIndex; // Keep the index at the last element to avoid looping
                }
                return prevIndex + 1;
            });
            gazeTimeRef.current = { rightSide: 0, total: 0 }; // Reset gaze data

        }, intervalDuration);

        return () => clearInterval(timer);
        }
    }, [WPM, isPaused, currentChunkIndex, wordChunks.length, maxCharsPerChunk, isWebGazerActive]);


    return (
        <div className="centerContainer" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
        }}>
        <CounterDisplay count={WPM} fontSize="16px" />
        <div className="wordDisplay" style={{ 
            marginTop: "20px",
            fontSize: "40px",
            fontWeight: "bold",
            maxWidth: "90vw",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        }}>
            {wordChunks[currentChunkIndex]}
        </div>
        </div>
    );
};

export default Mode2Display;
