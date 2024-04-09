"use client"; 

import { useEffect, useState, useRef } from "react";
import { useSelectedText } from "@/contexts/SelectedTextContext";
import CounterDisplay from "@/components/mode-1/counter-display";
import styles from '@/app/(dashboard)/(routes)/dashboard/DashboardPage.module.css';
import '@/app/globals.css';
import { useWebGazer } from '@/contexts/WebGazerContext';
import { TbSquareLetterR } from "react-icons/tb";
import { RiSpace } from "react-icons/ri";

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

    // Hook to set up and manage the gaze listener based on WebGazer's activity and pause state
    useEffect(() => {
        // Only proceed if WebGazer is active, the component is not paused, and we're in a browser environment
        if (isWebGazerActive && !isPaused && typeof window !== "undefined") {
            // Cast the window object to an ExtendedWindow type to access custom properties like webgazer
            const extendedWindow: ExtendedWindow = window as ExtendedWindow;
            // Use optional chaining to safely call setGazeListener if webgazer is defined
            extendedWindow.webgazer?.setGazeListener((data: any) => {
                // Proceed if there's gaze data and it includes an x-coordinate
                if (data && data.x) {
                    // Find the element displaying the sentence to track gaze within its bounds
                    const sentenceDisplayElement = document.querySelector('.wordDisplay');
                    if (sentenceDisplayElement) {
                        // Get the element's position and size
                        const { left, width } = sentenceDisplayElement.getBoundingClientRect();
                        // Calculate a boundary (70% from the left) to define the "rightmost part"
                        const rightBoundary = left + width * 0.7;

                        // Increment the total gaze time counter
                        gazeTimeRef.current.total += 1;

                        // If the gaze is to the right of the boundary, increment the right-side gaze counter
                        if (data.x >= rightBoundary) {
                            gazeTimeRef.current.rightSide += 1;
                        }
                    }
                }
            });

            // Cleanup function to clear the gaze listener when the component unmounts or dependencies change
            return () => extendedWindow.webgazer?.clearGazeListener();
        }
    }, [isWebGazerActive, isPaused]); // Depend on WebGazer's activity and pause state
    

    // Hook for managing word display based on chunk index, updating WPM based on gaze data
    useEffect(() => {
        // Only proceed if not paused and there are more chunks to display
        if (!isPaused && currentChunkIndex < wordChunks.length) {
            // Convert WPM to words per second for timing calculations
            const wordsPerSecond = WPM / 60;

            // Function to calculate how long to display a chunk of text, based on its length
            const calculateDisplayTime = (chunk: string) => {
                // Calculate the equivalent word count using an average character count per word
                const wordCount = chunk.length / 5;
                // Return the display time in milliseconds
                return (wordCount / wordsPerSecond) * 1000;
            };

            // Determine how long to display the current chunk
            const intervalDuration = calculateDisplayTime(wordChunks[currentChunkIndex]);

            // Set up an interval to move through the chunks based on calculated display times
            const timer = setInterval(() => {
                // Check gaze data and adjust WPM if WebGazer is active
                if (isWebGazerActive) {
                    // Calculate the percentage of time spent looking at the right side of the text
                    const gazeRightPercentage = (gazeTimeRef.current.rightSide / gazeTimeRef.current.total) * 100;
                    let newWPM = WPM;

                    // Adjust WPM based on the gaze direction (increase if gazing right, decrease if not)
                    if (gazeRightPercentage > 50) {
                        newWPM = Math.round(WPM + 50);
                    } else {
                        newWPM = Math.round(WPM - 30);
                    }

                    // Apply the new WPM value if it represents a significant change
                    if (Math.abs(newWPM - WPM) >= 1) {
                        setWPM(newWPM);
                    }
                    // Store the new WPM for later analysis
                    setWpmValues(prevValues => [...prevValues, newWPM]);
                }

                // Move to the next chunk or end the session
                setCurrentChunkIndex((prevIndex) => {
                    // Check if we've reached the end of the chunks
                    if (prevIndex + 1 >= wordChunks.length) {
                        clearInterval(timer); // Stop the timer
                        calculateAndSubmitAverageWpm(); // Submit the average WPM
                        return prevIndex; // Keep the index unchanged to avoid overflow
                    }
                    return prevIndex + 1; // Move to the next chunk
                });

                // Reset gaze data counters for the next interval
                gazeTimeRef.current = { rightSide: 0, total: 0 };

            }, intervalDuration); // Use the calculated duration for the interval

            // Cleanup function to clear the interval when the component unmounts or dependencies change
            return () => clearInterval(timer);
        }
    }, [WPM, isPaused, currentChunkIndex, wordChunks, isWebGazerActive]); // Depend on these states and data to trigger updates

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


    const gapBetweenSize = '10px';
    const gapEdgeSize = '15px';

    return (
    <div
        className={
        styles.dashboardBg +
        " flex flex-col justify-start w-full px-4 pt-8 pb-10 min-h-screen"
        }
        style={{ paddingTop: "150px" }}
    >

        {/* Parent div with horizontal layout */}
        <div
            className="flex justify-center items-start w-full"
            style={{ gap: gapBetweenSize }}
          >

            {/* Div for Mode2 Display, taking more space */}
            <div
                className="bg-white rounded-lg shadow-lg p-8 pt-2 my-2 flex-1"
                style={{
                maxWidth: `calc(100% - var(--sidebar-width) - ${gapEdgeSize})`,
                height: "25vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                }}
            >
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
            </div>


            {/* Smaller divs on the right */}
            <div className="my-2" style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between", // This will evenly space the children vertically
                    height: "25vh",
            }}>

                {/* div 1 */}
                <div
                className="bg-white rounded-lg shadow-lg p-6 pt-2"
                style={{
                width: `calc(var(--sidebar-width) - ${gapBetweenSize})`, // Use template literals to include the gapSize
                display: 'flex',
                flexDirection: 'column', // This will stack children divs on top of each other
                alignItems: 'center',
                justifyContent: 'space-evenly', // Adjust spacing between inner divs
                flexGrow: 1,
                marginBottom: `${gapBetweenSize}`,
                }}
                >
                {/* First inner div for the title "Stats" and a gray horizontal line */}
                    <div
                        style={{
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                        padding: '1px',
                        borderRadius: '10px',
                        margin: '5px',
                        width: '100%', // Adjust width as necessary
                        textAlign: 'center',
                        }}
                    >
                        <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Commands</h3>
                    </div>

                    {/* Second inner div for the text "Average WPM:" centered */}
                    <div
                        style={{
                        width: '100%', // Matches the width of the first inner div for consistency
                        display: 'flex',
                        justifyContent: 'center', // Center-align the text horizontally
                        alignItems: 'center',
                        flexDirection: 'column',
                        flex: 1, // Take up remaining space
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px' }}>
                            <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                            <TbSquareLetterR style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                            <p style={{ margin: '0'}}>to Restart</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)' , marginBottom: '5px' }}>
                            <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                            <RiSpace style={{ marginRight: '5px', color: '#606060', fontSize: '26px' }} />
                            <p style={{ margin: '0' }}>to Pause/Play</p>
                        </div>
                    </div>
                </div>

                {/* div 2 */}
                <div
                className="bg-white rounded-lg shadow-lg p-6 pt-2"
                style={{
                width: `calc(var(--sidebar-width) - ${gapBetweenSize})`, // Use template literals to include the gapSize
                display: 'flex',
                flexDirection: 'column', // This will stack children divs on top of each other
                alignItems: 'center',
                justifyContent: 'space-evenly', // Adjust spacing between inner divs
                flexGrow: 1, 
                }}
                >
                {/* First inner div for the title "Stats" and a gray horizontal line */}
                    <div
                        style={{
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                        padding: '1px',
                        borderRadius: '10px',
                        margin: '5px',
                        width: '100%', // Adjust width as necessary
                        textAlign: 'center',
                        }}
                    >
                        <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Stats</h3>
                    </div>

                    {/* Second inner div for the text "Average WPM:" centered */}
                    <div
                        style={{
                        width: '100%', // Matches the width of the first inner div for consistency
                        display: 'flex',
                        alignItems: 'center', // Center-align the text vertically
                        justifyContent: 'center',
                        flex: 1, // Take up remaining space
                        }}
                    >
                        <p style={{ fontSize: '15px', color: 'rgb(90, 90, 90)' }}>Average WPM: {/* Dynamic content here */}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    );
};

export default Mode2Display;
