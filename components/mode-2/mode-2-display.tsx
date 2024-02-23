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
    const shortStory = `In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. The relentless pursuit of productivity often leads to increased stress and a higher risk of burnout. It's crucial to set clear boundaries between work responsibilities and personal life. Effective time management and task prioritization are keys to reducing work-related pressure. These strategies allow individuals to enjoy a more fulfilling life both inside and outside the workplace.
    ¶
    Engaging in hobbies, pursuing personal interests, and spending quality time with family and friends are essential components of a well-rounded life. These activities offer opportunities for relaxation and personal growth, contributing to overall happiness and satisfaction.
    ¶
    On the professional front, employers play a significant role in promoting a healthy work environment. This includes offering flexible working conditions, encouraging regular breaks, and recognizing the importance of mental health. Supportive workplace cultures that value employee well-being lead to increased productivity, greater job satisfaction, and lower turnover rates.
    ¶
    Ultimately, achieving a balance between work and life leads to improved mental and physical health, heightened job performance, and a richer, more rewarding life experience. It's about finding a rhythm that allows for both career progression and personal contentment, ensuring long-term happiness and success.`;
    
    //   // Adjust the maxCharsPerChunk according to your specific layout and font settings
    //   const maxCharsPerChunk = 60; // Example character limit
    //   const wordChunks = shortStory.match(new RegExp('.{1,' + maxCharsPerChunk + '}(\\s|$)', 'g')) || [];

    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [dynamicWPM, setDynamicWPM] = useState(400); // This WPM changes dynamically with gaze (webgazer) or keypress
    const [displayWPM, setDisplayWPM] = useState(400); // This WPM controls the actual display speed
    const [isPaused, setIsPaused] = useState(true); // Add a state to track whether the flashing is paused
    const [maxCharsPerChunk, setMaxCharsPerChunk] = useState(60); // Initial value, will be updated
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const UPDATE_INTERVAL_MS = 250;


    const sectionEntryTimestamps = useRef<number[]>(Array(5).fill(0));
    const timeSpentInSections = useRef<number[]>(Array(5).fill(0));
    const prevSectionIndex = useRef<number>(-1);

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
      window.addEventListener("resize", calculateMaxCharsPerChunk);

      return () =>
        window.removeEventListener("resize", calculateMaxCharsPerChunk);
    }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

    const wordChunks =
      shortStory.match(
        new RegExp(".{1," + maxCharsPerChunk + "}(\\s|$)", "g")
      ) || [];

    useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight") {
          setDynamicWPM((prevWPM) => Math.min(prevWPM + 20, 1100)); // Increase dynamicWPM, max 1100
        } else if (event.key === "ArrowLeft") {
          setDynamicWPM((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease dynamicWPM, min 100
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

    // useEffect(() => {
    //     if (typeof window !== "undefined" && isWebGazerActive && !isPaused) {
    //       const extendedWindow: ExtendedWindow = window;
    //       const updateWPMBasedOnGaze = (data: any) => {
    //         if (!data) return;
    //         const viewportWidth = window.innerWidth;
    //         if (data.x < viewportWidth / 2) {
    //             setDynamicWPM((currentWPM) => Math.max(currentWPM - 10, 100));
    //         } else {
    //             setDynamicWPM((currentWPM) => Math.min(currentWPM + 5, 1100));
    //         }
    //       };

    //       extendedWindow.webgazer?.setGazeListener((data: any, _) => {
    //         updateWPMBasedOnGaze(data);
    //       });

    //       // Cleanup function
    //       return () => {
    //         extendedWindow.webgazer?.clearGazeListener();
    //       };
    //     }
    //   }, [isWebGazerActive, isPaused]);

    // Adjust dynamicWPM based on gaze or keypress
    useEffect(() => {
      if (isWebGazerActive && typeof window !== "undefined") {
        const extendedWindow: ExtendedWindow = window as ExtendedWindow;
        extendedWindow.webgazer?.setGazeListener(
          (data: any, elapsedTime: number) => {
            if (data && data.x) {
              const numberofSections = 5;
              const viewportWidth = window.innerWidth / numberofSections; // Divide the viewport into 5 sections (need to adjust based on the sidebar!!!!)
              const sectionIndex = Math.floor(data.x / viewportWidth);
              const normalisedSectionIndex = Math.max(
                0,
                Math.min(sectionIndex, numberofSections - 1)
              );

              if (!isPaused) {
                // Only update time spent in sections if not paused

                if (prevSectionIndex.current !== normalisedSectionIndex) {
                  if (prevSectionIndex.current === -1) {
                    sectionEntryTimestamps.current[normalisedSectionIndex] =
                      elapsedTime;
                  } else {
                    timeSpentInSections.current[prevSectionIndex.current] +=
                      elapsedTime -
                      sectionEntryTimestamps.current[prevSectionIndex.current];
                    sectionEntryTimestamps.current[normalisedSectionIndex] =
                      elapsedTime;
                    sectionEntryTimestamps.current[
                      prevSectionIndex.current
                    ] = 0;
                  }
                }
              } else {
                // Reset time spent in sections if paused
                sectionEntryTimestamps.current.fill(0);
              }

              prevSectionIndex.current = normalisedSectionIndex;

              // const viewportWidth = window.innerWidth;
              // const gazePosition = data.x < viewportWidth / 2 ? -10 : 5;
              // setDynamicWPM((prevWPM) => Math.max(100, Math.min(prevWPM + gazePosition, 1000)));
            }
          }
        );

        return () => extendedWindow.webgazer?.clearGazeListener();
      }
    }, [isWebGazerActive, isPaused]);

    // useEffect(() => {
    //   timeSpentInSections.current.forEach((time, index) => {
    //     console.log(`Time spent in section ${index}: ${time}`);
    //   });
    // }, [isPaused]);

    // Sync displayWPM with dynamicWPM at intervals
    useEffect(() => {
        const intervalId = setInterval(() => {
        setDisplayWPM(dynamicWPM);
        }, UPDATE_INTERVAL_MS); // Sync every UPDATE_INTERVAL_MS ms

        return () => clearInterval(intervalId);
    }, [dynamicWPM]);

    // // Gradually adjust displayWPM to match dynamicWPM
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //     setDisplayWPM((prevDisplayWPM) => {
    //         const adjustment = (dynamicWPM - prevDisplayWPM) / 4;
    //         return prevDisplayWPM + adjustment;
    //     });
    //     }, 250); // Adjust interval as needed

    //     return () => clearInterval(interval);
    // }, [dynamicWPM]);


    // useEffect(() => {
    //     let timer: ReturnType<typeof setInterval>;
    //     if (!isPaused && currentChunkIndex < wordChunks.length) {
    //     const interval = (60000 / displayWPM) * (maxCharsPerChunk / 5); // Assuming an average of 5 characters per word for timing
    //     timer = setInterval(() => {
    //         setCurrentChunkIndex((prevIndex) => {
    //         if (prevIndex >= wordChunks.length - 1) {
    //             clearInterval(timer);
    //             return prevIndex;
    //         }
    //         return prevIndex + 1;
    //         });
    //     }, interval);
    //     }

    //     return () => {
    //     if (timer) clearInterval(timer);
    //     };
    // }, [displayWPM, wordChunks.length, isPaused, currentChunkIndex]);
  
    // Handle chunk display logic
    useEffect(() => {
        if (!isPaused && currentChunkIndex < wordChunks.length) {
        const interval = (60000 / displayWPM) * (maxCharsPerChunk / 5); // 5 chars per word
        const timer = setInterval(() => {
            setCurrentChunkIndex((prevIndex) => prevIndex + 1 >= wordChunks.length ? 0 : prevIndex + 1);
            onChunkAdvanced();
        }, interval);

        return () => clearInterval(timer);
        }
    }, [displayWPM, isPaused, currentChunkIndex, wordChunks.length, maxCharsPerChunk]);

    const onChunkAdvanced = () => {
      const total = timeSpentInSections.current.reduce(
        (acc, time) => acc + time,
        0
      );
      console.log(timeSpentInSections.current, total);
      console.log("Chunk advanced");
      timeSpentInSections.current.fill(0);
    };

    return (
        <div className="centerContainer" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
        }}>
        <CounterDisplay count={dynamicWPM} fontSize="16px" />
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
