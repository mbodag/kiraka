"use client"; 

import { useEffect, useState, useRef } from "react";
import { useSelectedText } from "@/contexts/SelectedTextContext";
import CounterDisplay from "@/components/mode-1/counter-display";
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
    //const shortStory = `In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. The relentless pursuit of productivity often leads to increased stress and a higher risk of burnout. It's crucial to set clear boundaries between work responsibilities and personal life. Effective time management and task prioritization are keys to reducing work-related pressure. These strategies allow individuals to enjoy a more fulfilling life both inside and outside the workplace. <¶> Engaging in hobbies, pursuing personal interests, and spending quality time with family and friends are essential components of a well-rounded life. These activities offer opportunities for relaxation and personal growth, contributing to overall happiness and satisfaction. <¶> On the professional front, employers play a significant role in promoting a healthy work environment. This includes offering flexible working conditions, encouraging regular breaks, and recognizing the importance of mental health. Supportive workplace cultures that value employee well-being lead to increased productivity, greater job satisfaction, and lower turnover rates. <¶> Ultimately, achieving a balance between work and life leads to improved mental and physical health, heightened job performance, and a richer, more rewarding life experience. It's about finding a rhythm that allows for both career progression and personal contentment, ensuring long-term happiness and success.`;

    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [startWPM, setstartWPM] = useState(300); 
    const [WPM, setWPM] = useState(startWPM); 
    const [wpmValues, setWpmValues] = useState<number[]>([]); // To store the WPMs values and take their average at the end of the session; to be sent to the database
    const [isPaused, setIsPaused] = useState(true); // Add a state to track whether the flashing is paused
    const [fontSize, setFontSize] = useState(44); // Start with a default font size
    const maxCharsPerChunk = wordsPerChunk * avgCharCountPerWord
    const gazeTimeRef = useRef<{ rightSide: number; total: number }>({ rightSide: 0, total: 0 });
    const [shortStory, setShortStory] = useState("");
    const { selectedTextId } = useSelectedText(); // Use the ID from context
    const wordChunks = shortStory.match(new RegExp('.{1,' + maxCharsPerChunk + '}(\\s|$)', 'g')) || [];


    // Accessing the current state of WebGazer
    const { isWebGazerActive } = useWebGazer();
    const [showCalibrationPopup, setShowCalibrationPopup] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);


    useEffect(() => {
        const fetchTextById = async (textId: number) => {
          try {
            const response = await fetch(`/api/texts/${textId}`);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data.quiz_questions);
            setShortStory(data.text_content);
          } catch (error) {
            console.error('Error fetching text:', error);
          }
        };
    
        if (selectedTextId) {
          fetchTextById(selectedTextId);
        }
      }, [selectedTextId]);


    // useEffect(() => {
    //     const isCalibrated = sessionStorage.getItem('isCalibrated');
    //     if (!isCalibrated) {
    //       setShowCalibrationPopup(true);
    //     }
    //   }, []);
    useEffect(() => {
        // Directly check if WebGazer is not active to prompt for calibration.
        if (!isWebGazerActive) {
            // sessionStorage.setItem('isCalibrated', 'false');
            setShowCalibrationPopup(true);
        } else {
            // Assume WebGazer being active means calibration is done
            // const isCalibrated = sessionStorage.getItem('isCalibrated');
            // setShowCalibrationPopup(isCalibrated !== 'true');
            setShowCalibrationPopup(false);
        }
    }, [isWebGazerActive]);


    const handleGoToCalibration = () => {
        setRedirecting(true); // Set redirecting state to true
        setTimeout(() => {
            window.location.href = '/calibration'; // Redirect after a brief pause
        }, 1500); // Adjust this delay as needed
    };

      
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
            // Check if the calibration popup is shown; if true, return early to disable functionality
            if (showCalibrationPopup) {
                return;
              }

            if (event.key === "ArrowRight") {
                setWPM((prevWPM) => Math.min(prevWPM + 20, 1100)); // Increase dynamicWPM, max 1100
            } else if (event.key === "ArrowLeft") {
                setWPM((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease dynamicWPM, min 50
            } else if (event.key === "R" || event.key === "r") {
                setCurrentChunkIndex(0); // Restart from the first chunk
                setIsPaused(true); // Pause the session
                setWpmValues([]); // Reset the stored WPM values
                setWPM(startWPM); // Reset the WPM value
            } else if (event.key === " ") {
                event.preventDefault(); // Prevent default action (e.g., page scrolling)
                setIsPaused((prevIsPaused) => !prevIsPaused); // Toggle pause/start
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [showCalibrationPopup]);


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
            const wordsPerSecond = WPM / 60;
            
            // New function to calculate display time for a chunk, excluding short words.
            const calculateDisplayTime = (chunk: string) => {
                const characterCount = chunk.length;
                // Divides by 5 to find the equivalent "word" count based on the provided definition
                const wordCount = characterCount / 5;
                // Calculates how many seconds to display this chunk, converting to milliseconds for setInterval
                return (wordCount / wordsPerSecond) * 1000;
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
                // Add the new WPM value to the wpmValues array.
                setWpmValues(prevValues => [...prevValues, newWPM]);
            }

            // Prepare for next sentence
            setCurrentChunkIndex((prevIndex) => {
                if (prevIndex + 1 >= wordChunks.length) {
                    clearInterval(timer); // Stop the interval when reaching the end
                    calculateAndSubmitAverageWpm(); // Calculate and submit average WPM at the end of the session
                    return prevIndex; // Keep the index at the last element to avoid looping
                }
                return prevIndex + 1;
            });
            gazeTimeRef.current = { rightSide: 0, total: 0 }; // Reset gaze data

        }, intervalDuration);

        return () => clearInterval(timer);
        }
    }, [WPM, isPaused, currentChunkIndex, wordChunks, isWebGazerActive]);


    useEffect(() => {
        const mainContent = document.querySelector('.main-content'); // Target the main content container
        if (mainContent) { // Check if the element exists
          if (showCalibrationPopup) {
            mainContent.classList.add('blur-effect');
          } else {
            mainContent.classList.remove('blur-effect');
          }
      
          // Cleanup function to safely remove the class
          return () => {
            if (mainContent) {
              mainContent.classList.remove('blur-effect');
            }
          };
        }
      }, [showCalibrationPopup]);


    const calculateAndSubmitAverageWpm = () => {
        if (wpmValues.length === 0) return; // Ensure there are recorded WPM values
    
        const sum = wpmValues.reduce((acc, cur) => acc + cur, 0);
        const averageWpm = sum / wpmValues.length;
    
        // Call the function to submit the average WPM to the backend
        submitReadingSpeed(averageWpm);
    
        // Reset WPM values for a new session.
        setWpmValues([]);
    };


    // This function takes the average WPM and sends it to the backend.
    const submitReadingSpeed = async (averageWpm: number) => {
        await fetch("/api/save-reading-speed", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // Assuming the payload requires 'text_id', 'user_id', and 'wpm'.
                // Replace 'text_id' and 'user_id' with actual values as needed.
                text_id: 1, // Example text_id
                user_id: 1, // Example user_id
                wpm: averageWpm,
            }),
        });
    };



      return (
        <div className="centerContainer" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
        }}>
            {
                showCalibrationPopup && (
                    <>
                    <div className="modal-backdrop" style={{ zIndex: 500}}></div>
                        <div className="modal-content" style={{ 
                            width: '30vw', 
                            display: 'flex', 
                            flexDirection: 'column', // Stack children vertically
                            alignItems: 'center', // Center children horizontally
                            justifyContent: 'center', // Center children vertically
                            textAlign: 'center', // Ensures that text inside children elements is centered, if needed
                            }}> 
                            {!redirecting ? (
                            <>
                                <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}>
                                    Click the button below to begin calibrating WebGazer and start your speed reading session!
                                </p>
                                <button className="GreenButton" onClick={handleGoToCalibration}>
                                    Go to Calibration
                                </button>
                            </>
                            ) : (
                            <p style={{ fontSize: '18px', textAlign: 'center' }}>
                                Redirecting to Calibration Page
                                <span className="dot">.</span>
                                <span className="dot">.</span>
                                <span className="dot">.</span>
                            </p>
                        )}
                        </div>
                    </>
                )
            }
      
          {/* The rest of your component's content, keeping the inline styles for alignment and sizing */}
          <CounterDisplay count={WPM} fontSize="16px" className={showCalibrationPopup ? 'blur-effect' : ''}/>
            <div className={`wordDisplay ${showCalibrationPopup ? 'blur-effect' : ''}`} style={{ 
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
