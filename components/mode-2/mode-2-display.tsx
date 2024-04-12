"use client"; 

import { useEffect, useState, useRef } from "react";
import { useSelectedText } from "@/contexts/SelectedTextContext";
import CounterDisplay from "@/components/mode-1/counter-display";
import styles from '@/app/(dashboard)/(routes)/dashboard/DashboardPage.module.css';
import '@/app/globals.css';
import { useWebGazer } from '@/contexts/WebGazerContext';
import { TbSquareLetterR } from "react-icons/tb";
import { RiSpace } from "react-icons/ri";
import  { usePracticeID } from '@/contexts/PracticeIDContext';
import { useAuth } from "@clerk/nextjs";

interface ExtendedWindow extends Window {
    webgazer?: {
      setGazeListener: (callback: (data: any, elapsedTime: number) => void) => ExtendedWindow;
      clearGazeListener: () => void;
    };
  }

interface GazeDataPoint {
    x: number;
    y: number;
    elapsedTime: number;
    deltaX: number;
    deltaY: number;
    deltaT: number;
    speedX: number;
    Lefts: number;
}

// Assuming you want a specific number of words per chunk, 
// and estimating the average character count per word
const wordsPerChunk = 10;
const avgCharCountPerWord = 5; // This is an approximation (~4.7 for English language)
const minWPM = 200;
const maxWPM = 800; // This is an approximation (~4.7 for English language)
const significantLeftSpeed = -2;
const constIncreaseWPM = 20;
const constDecreaseWPM = 20;

const Mode2Display = () => {
    // Predefined text same as from Mode1Display component
    // const shortStory = `In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. `;

    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [startWPM, setstartWPM] = useState(400); 
    const [WPM, setWPM] = useState(startWPM);
    const [wpmValues, setWpmValues] = useState<number[]>([]); // To store the WPMs values and take their average at the end of the session; to be sent to the database
    const [averageWPM, setAverageWPM] = useState<number | null>(null);
    const gazeDataRef = useRef<GazeDataPoint[]>([]);
    const consecutiveLeftMovements = useRef<number>(0);

    const [isPaused, setIsPaused] = useState(true); // Add a state to track whether the flashing is paused
    const [fontSize, setFontSize] = useState(44); // Start with a default font size
    const maxCharsPerChunk = wordsPerChunk * avgCharCountPerWord
    const [shortStory, setShortStory] = useState("");
    const { selectedTextId } = useSelectedText(); // Use the ID from context
    const { userId } = useAuth()
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
            // Replace newlines (\n) with spaces and set the cleaned text
            const cleanedText = data.text_content.replace(/\n+/g, ' ');
            setShortStory(cleanedText);
          } catch (error) {
            console.error('Error fetching text:', error);
          }
        };
    
        if (selectedTextId) {
          fetchTextById(selectedTextId);
        }
      }, [selectedTextId]);

    useEffect(() => {
        const isCalibrated = sessionStorage.getItem('isCalibrated');
        if (!isCalibrated) {
          setShowCalibrationPopup(true);
        }
      }, []);

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
                setWPM((prevWPM) => Math.min(prevWPM + constIncreaseWPM, maxWPM)); // Increase dynamicWPM
            } else if (event.key === "ArrowLeft") {
                setWPM((prevWPM) => Math.max(prevWPM - constDecreaseWPM, minWPM)); // Decrease dynamicWPM
            } else if (event.key === "R" || event.key === "r") {
                setCurrentChunkIndex(0); // Restart from the first chunk
                setIsPaused(true); // Pause the session
                setWpmValues([]); // Reset the stored WPM values
                setWPM(startWPM); // Reset the WPM value
                setAverageWPM(null); // Reset the averageWPM value
            } else if (event.key === " ") {
                event.preventDefault(); // Prevent default action (e.g., page scrolling)
                setIsPaused((prevIsPaused) => !prevIsPaused); // Toggle pause/start
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [showCalibrationPopup]);



    // Function to calculate display time for a chunk
    const calculateDisplayTime = (chunk: string) => {
        const wordsPerSecond = WPM / 60;
        const wordCount = chunk.length / 5;
        // Return the display time in milliseconds
        return (wordCount / wordsPerSecond) * 1000;
    };
    
    
    // Hook to set up and manage the gaze listener based on WebGazer's activity and pause state
    useEffect(() => {
        // Only proceed if WebGazer is active, the component is not paused, and we're in a browser environment
        if (isWebGazerActive && !isPaused && typeof window !== "undefined") {
            // Cast the window object to an ExtendedWindow type to access custom properties like webgazer
            const extendedWindow: ExtendedWindow = window as ExtendedWindow;

            // Use optional chaining to safely call setGazeListener if webgazer is defined
            extendedWindow.webgazer?.setGazeListener((data: any, elapsedTime: any) => {
                // Proceed if there's gaze data and it includes an x-coordinate
                if (data && data.x && data.y && elapsedTime) {
                    const deltaX = gazeDataRef.current.length > 0 ? data.x - gazeDataRef.current[gazeDataRef.current.length - 1].x : 0;
                    const deltaY = gazeDataRef.current.length > 0 ? data.y - gazeDataRef.current[gazeDataRef.current.length - 1].y : 0;
                    const deltaT = gazeDataRef.current.length > 0 ? elapsedTime - gazeDataRef.current[gazeDataRef.current.length - 1].elapsedTime : 0;
                    const speedX = deltaT > 0 ? deltaX/deltaT : 0;
                    console.log(deltaX, deltaY, deltaT, speedX);

                    if (speedX < significantLeftSpeed) {
                        console.log('Significant leftward movement detected');
                        consecutiveLeftMovements.current += 1;
                      } else {
                        console.log('No significant leftward movement detected');
                        consecutiveLeftMovements.current = 0;
                      }
                    const Lefts = consecutiveLeftMovements.current

                    gazeDataRef.current.push({ x: data.x, y: data.y, elapsedTime, deltaX, deltaY, deltaT, speedX, Lefts });

                }
            });

            // Cleanup function to clear the gaze listener when the component unmounts or dependencies change
            return () => extendedWindow.webgazer?.clearGazeListener();
        }
    }, [isWebGazerActive, isPaused]); // Depend on WebGazer's activity and pause state
    

    // Hook for managing word display based on chunk index, updating WPM based on gaze data
    useEffect(() => {
        let animationFrameId: number; // Used to store the request ID for cancellation

        // Continuously monitor and adjust based on gaze data
        const monitorAndAdjust = () => {
            // The start time of monitoring the current chunk
            const startTime = performance.now();
    
            // Function to analyze gaze data and decide whether to adjust WPM or move to the next chunk
            const analyzeAndAdjust = () => {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startTime;
                console.log(`elapsed time: ${elapsedTime}`)
                const chunkDisplayTime = calculateDisplayTime(wordChunks[currentChunkIndex]);
    
                // Ensure we're analyzing only after at least 60% of the expected chunk display time has passed
                if (elapsedTime > chunkDisplayTime * 0.6) {
                    console.log(`elapsed time - RELEVANT: ${elapsedTime}`)
                    // If significant leftward movement is detected
                    if (gazeDataRef.current.length > 0 && gazeDataRef.current[gazeDataRef.current.length - 1].Lefts >= 2) {
                        console.log('Increasing WPM');
                        // Increase WPM and move to the next chunk
                        setWPM(prevWPM => Math.min(prevWPM + constIncreaseWPM, maxWPM));
                        setWpmValues(prevValues => [...prevValues, WPM]);
                        setCurrentChunkIndex(prevIndex => prevIndex + 1);
                        gazeDataRef.current = [];
                        consecutiveLeftMovements.current = 0;
                    } else if (elapsedTime >= chunkDisplayTime) {
                        // No leftward movement detected by the end of the chunk display time,
                        // possibly indicating the need to slow down
                        console.log('Decreasing WPM or flipping due to timeout');
                        setWPM(prevWPM => Math.max(prevWPM - constDecreaseWPM, minWPM));
                        setWpmValues(prevValues => [...prevValues, WPM]);
                        setCurrentChunkIndex(prevIndex => prevIndex + 1);
                        gazeDataRef.current = [];
                        consecutiveLeftMovements.current = 0;
                    }
                }
    
                // If the chunk hasn't ended or been skipped, keep monitoring
                if (currentChunkIndex < wordChunks.length && !isPaused) {
                    animationFrameId = requestAnimationFrame(analyzeAndAdjust);
                }
            };
    
            // Start the continuous analysis
            animationFrameId = requestAnimationFrame(analyzeAndAdjust); //generally has a refresh rate of 60Hz
        };
    
        if (isWebGazerActive && !isPaused && currentChunkIndex < wordChunks.length) {
            monitorAndAdjust();
        }

        // When we reach the last chunk
        if (currentChunkIndex >= wordChunks.length - 1) {
            calculateAndSubmitAverageWpm();
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };

    }, [currentChunkIndex, isPaused, wordChunks, WPM, isWebGazerActive]);


    const calculateAndSubmitAverageWpm = () => {
        if (averageWPM !== null || wpmValues.length === 0) return;// Ensure there are recorded WPM values
    
        const sum = wpmValues.reduce((acc, cur) => acc + cur, 0);
        const calculatedAverageWpm = Math.round(sum / wpmValues.length);

        // Update state and submit.
        setAverageWPM(calculatedAverageWpm);
        submitReadingSpeed(calculatedAverageWpm); // Use the freshly calculated value.
    
        // Reset WPM values for a new session.
        setWpmValues([]);
    };

    const { updatePracticeId } = usePracticeID(); // Accessing the updatePracticeId method from the global context

    // This function takes the average WPM and sends it to the backend.
    const submitReadingSpeed = async (averageWpm: number | null) => {
        try {
            const response = await fetch("/api/save-reading-speed", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text_id: selectedTextId, 
                    user_id: userId,
                    wpm: averageWpm,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                updatePracticeId(data.practice_id); // Update global practice ID
            } else {
                // Handle non-OK responses
                console.error('Error submitting reading speed');
            }
        } catch (error) {
            console.error('Error in submitReadingSpeed:', error);
        }
    };
    

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

    

    const gapBetweenSize = '10px';
    const gapEdgeSize = '15px';
    const divheight = '250px';

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
                height: divheight,
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
                                    borderRadius: '20px' ,
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
                {/* <button onClick={downloadGazeData}>Download Gaze Data</button> */}
                    <div className={`wordDisplay monospaced ${showCalibrationPopup ? 'blur-effect' : ''}`} style={{ 
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
                    height: divheight,
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
                        className={showCalibrationPopup ? 'blur-effect' : ''}
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
                        <div className={showCalibrationPopup ? 'blur-effect' : ''} style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px' }}>
                            <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                            <TbSquareLetterR style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                            <p style={{ margin: '0'}}>to Restart</p>
                        </div>
                        <div className={showCalibrationPopup ? 'blur-effect' : ''} style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)' , marginBottom: '5px' }}>
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
                        className={showCalibrationPopup ? 'blur-effect' : ''}
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
                        <p className={showCalibrationPopup ? 'blur-effect' : ''} style={{ fontSize: '15px', color: 'rgb(90, 90, 90)' }}>
                        Average WPM: {averageWPM !== null ? averageWPM : <span style={{ fontStyle: 'italic', color: 'rgb(150, 150, 150)' }}>Pending</span>}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    );
};

export default Mode2Display;
