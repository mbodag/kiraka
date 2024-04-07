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

// Assuming you want a specific number of words per chunk,
// and estimating the average character count per word
const wordsPerChunk = 10;
const avgCharCountPerWord = 5; // This is an approximation (~4.7 for English language)

const Mode2Display = () => {
    // Predefined text same as from Mode1Display component
    const shortStory = `In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. The relentless pursuit of productivity often leads to increased stress and a higher risk of burnout. It's crucial to set clear boundaries between work responsibilities and personal life. Effective time management and task prioritization are keys to reducing work-related pressure. These strategies allow individuals to enjoy a more fulfilling life both inside and outside the workplace. <¶> Engaging in hobbies, pursuing personal interests, and spending quality time with family and friends are essential components of a well-rounded life. These activities offer opportunities for relaxation and personal growth, contributing to overall happiness and satisfaction. <¶> On the professional front, employers play a significant role in promoting a healthy work environment. This includes offering flexible working conditions, encouraging regular breaks, and recognizing the importance of mental health. Supportive workplace cultures that value employee well-being lead to increased productivity, greater job satisfaction, and lower turnover rates. <¶> Ultimately, achieving a balance between work and life leads to improved mental and physical health, heightened job performance, and a richer, more rewarding life experience. It's about finding a rhythm that allows for both career progression and personal contentment, ensuring long-term happiness and success.`;

    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [WPM, setWPM] = useState(300 ); 
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isPaused, setIsPaused] = useState(true); // Add a state to track whether the flashing is paused
    const [fontSize, setFontSize] = useState(44); // Start with a default font size
    const maxCharsPerChunk = wordsPerChunk * avgCharCountPerWord
    const gazeTimeRef = useRef<{ rightSide: number; total: number }>({ rightSide: 0, total: 0 });
    const wordChunks = shortStory.match(new RegExp('.{1,' + maxCharsPerChunk + '}(\\s|$)', 'g')) || [];


    // Accessing the current state of WebGazer
    const { isWebGazerActive } = useWebGazer();

    useEffect(() => {
        // Function to adjust font size based on the window width
        const adjustFontSize = () => {
            const viewportWidth = window.innerWidth;
            // Adjust the font size formula as needed to match your design and readability requirements
            const newFontSize = Math.max(16, (0.77*viewportWidth)/(maxCharsPerChunk*0.6)); // taking 77% of viewpoer and assuming one character width if 60% of font size
            setFontSize(newFontSize);
        };

        adjustFontSize();
        window.addEventListener('resize', adjustFontSize);
        
        return () => window.removeEventListener('resize', adjustFontSize);
    }, []);


    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                setWPM((prevWPM) => Math.min(prevWPM + 10, 1100)); // Increase dynamicWPM, max 1100
            } else if (event.key === "ArrowLeft") {
                setWPM((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease dynamicWPM, min 50
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
            // Converts WPM to seconds per word.
            const secondsPerWord = 60 / WPM;
            
            // New function to calculate display time for a chunk, excluding short words.
            const calculateDisplayTime = (chunk: any) => {
                const words: string[] = chunk.split(/\s+/); // Splits chunk into words.
                const longWords = words.filter(word => word.length > 1); // Filters out short words.
                // Returns total display time for the chunk, adjusting for number of longer words.
                return longWords.length * secondsPerWord * 1000; // Convert to milliseconds for setInterval.
            };
    
            // Calculates interval duration for the current chunk.
            const intervalDuration = calculateDisplayTime(wordChunks[currentChunkIndex]);

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
    }, [WPM, isPaused, currentChunkIndex, wordChunks, isWebGazerActive]);


    return (
        <div className="centerContainer" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh"
        }}>
            <CounterDisplay count={WPM} fontSize="16px" />
            <div className="wordDisplay" style={{ 
                marginTop: "20px",
                fontSize: `${fontSize}px`,
                fontWeight: "bold",
                maxWidth: "100vw",
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
