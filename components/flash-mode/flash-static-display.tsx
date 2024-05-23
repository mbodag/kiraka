"use client"; 

import { useEffect, useState, useRef, FC } from "react";
import { useSelectedText } from "@/contexts/SelectedTextContext";
import CounterDisplay from "@/components/doc-mode/counter-display";
import styles from '@/app/(dashboard)/(routes)/Dashboard.module.css';
import '@/app/globals.css';
import { TbSquareLetterR } from "react-icons/tb";
import { RiSpace } from "react-icons/ri";
import { ArrowLeftSquare, ArrowRightSquare } from 'lucide-react';
import  { usePracticeID } from '@/contexts/PracticeIDContext';
import { useAuth } from "@clerk/nextjs";
import { VscDebugRestart } from "react-icons/vsc";
import { PiPauseBold, PiPlayBold } from "react-icons/pi";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/navigation';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const wordsPerChunk = 10;
const avgCharCountPerWord = 5; // This is an approximation (~4.7 for English language)
const startWPM = 300;
const minWPM = 100;
const maxWPM = 1000;
const constIncreaseWPM = 25;
const constDecreaseWPM = 25;


const Mode1Display = () => {
 
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [pastAvgWPMs, setPastAvgWPMs] = useState<number[]>([startWPM]);
    const [WPM, setWPM] = useState(startWPM);
    const WPMValues = useRef<number[]>([startWPM]); // To store the WPMs values and take their average at the end of the session; to be sent to the database
    const adjustedStartWPM = useRef<number>(startWPM); 
    const [averageWPM, setAverageWPM] = useState<number | null>(null);

    const [isPaused, setIsPaused] = useState(true); // Added a state to track whether the flashing is paused
    const [isRestartActive, setIsRestartActive] = useState(false);
    const [isPausePlayActive, setIsPausePlayActive] = useState(false);

    const maxCharsPerChunk = wordsPerChunk * avgCharCountPerWord
    const { selectedTextId } = useSelectedText(); // Use the ID from context
    const { userId } = useAuth();
    const [wordChunks, setWordChunks] = useState<string[]>([]);
    const [complexityChunks, setComplexityChunks] = useState<number[]>([]);

    // Accessing the current state of WebGazer
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [redirectingToQuiz, setRedirectingToQuiz] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const router = useRouter();
    

    useEffect(() => {
      const fetchTextById = async (textId: number) => {
        try {
            const response = await fetch(`/api/chunks/${textId}?user_id=${userId}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();

            // Replace newlines (\n) with spaces and set the cleaned text
            const chunk_list = data.chunks;
            const complexity_list = data.complexity;
            setWordChunks(chunk_list);
            setComplexityChunks(complexity_list);
            } catch (error) {
            console.error("Error fetching text:", error);
        }
      };

      if (selectedTextId) {
        fetchTextById(selectedTextId);
      }
    }, [selectedTextId]);


    useEffect(() => {
        const fetchPastWPM = async () => {
          try {
            const response = await fetch(`/api/avgWPM?user_id=${userId}&mode=1`);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPastAvgWPMs(data.avgWPMs);
          } catch (error) {
            console.error('Error fetching text:', error);
          }
        };
          fetchPastWPM();
    }, []);

    useEffect(() => {
        if (pastAvgWPMs.length > 0) {
            // Consider only the last 10 entries for averaging
            const recentWPMs = pastAvgWPMs.slice(-10);
            const sum = recentWPMs.reduce((acc, curr) => acc + curr, 0);
            const average = Math.round(sum / recentWPMs.length);
    
            adjustedStartWPM.current = Math.min(Math.max(average, 150), 500);
            setWPM(adjustedStartWPM.current);
            WPMValues.current = [adjustedStartWPM.current]
        }
    }, [pastAvgWPMs]);

    const handleContinueToQuiz = async () => {
        setShowCompletionPopup(false);
        setRedirectingToQuiz(true);
        await submitReadingSpeed(averageWPM);
        window.location.href = '/quiz';
        // router.push('/quiz')
    };


    const calculateFontSize = () => {
        // Get screen width
        const screenWidth = window.innerWidth;

        // Retrieve the CSS variable --sidebar-width and convert it to pixels
        const root = document.documentElement;
        const sidebarWidthRem = getComputedStyle(root).getPropertyValue('--sidebar-width').trim();
        const sidebarWidthPixels = parseFloat(sidebarWidthRem) * parseFloat(getComputedStyle(root).fontSize);

        // Calculate the width based on the formula: screen width - 2 * (sidebar width + 24px)
        const calculatedWidth = screenWidth - 2 * (sidebarWidthPixels + 24);

        // Calculate the new font size based on the calculated width
        const w1 = 1
        const w2 = 0.65 // w1 and w2 defined per fopnt basis, visually to fit within the div
        return Math.max(1, (w1 * calculatedWidth) / (maxCharsPerChunk * w2));
    };

    const [fontSize, setFontSize] = useState(calculateFontSize);

    useEffect(() => {
        const adjustFontSize = () => {
            const newFontSize = calculateFontSize();
            setFontSize(newFontSize);
        };

        adjustFontSize();
        window.addEventListener('resize', adjustFontSize);
        return () => window.removeEventListener('resize', adjustFontSize);
    }, []);


    useEffect(() => {
        let timerId: NodeJS.Timeout;
      
        if (countdown !== null && countdown > 0) {
          // Set a timer to decrement the countdown every 800ms
          timerId = setTimeout(() => {
            setCountdown(countdown - 1);
          }, 800);
        } else if (countdown === 0) {
            // Display "Go!" for a brief moment before resetting
            timerId = setTimeout(() => {
                setIsPaused(false);  // Ensure the display starts if it was paused
                setCountdown(null);  // Reset countdown to not counting down state
            }, 400);  // Allow 400ms for "Go!" to be visible
        }

        return () => {
          clearTimeout(timerId); // Clean up the timer
        };
      }, [countdown]);

    // Function to handle restart action
    const restartAction = () => {
        setCurrentChunkIndex(0); // Restart from the first chunk
        setIsPaused(true); // Pause the session
        WPMValues.current = [adjustedStartWPM.current];
        setWPM(adjustedStartWPM.current); // Reset the WPM value
        setAverageWPM(null); // Reset the averageWPM value
        setIsRestartActive(true); // Set active to true
        setTimeout(() => setIsRestartActive(false), 100); // Reset after 100ms
    };
    
    useEffect(() => {
        if (selectedTextId !== null) {
            if (showCompletionPopup) {
                setShowCompletionPopup(false);  // Hide the popup if it's visible
            }
            restartAction();  // Then call the restart action
        }
    }, [selectedTextId]);

    // Function to toggle pause/play action
    const togglePausePlayAction = () => {
        if (isPaused) {
            setCountdown(3); // Start the countdown
        } else {
            setIsPaused(true); // Pause immediately without a countdown
        }
        setIsPausePlayActive(true); // Set active to true
        setTimeout(() => setIsPausePlayActive(false), 100); // Reset after 100ms
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (showCompletionPopup) {
                return;
            }
    
            switch (event.key) {
                case "ArrowRight":
                    setWPM((prevWPM) => Math.min(prevWPM + constIncreaseWPM, maxWPM));
                    break;
                case "ArrowLeft":
                    setWPM((prevWPM) => Math.max(prevWPM - constDecreaseWPM, minWPM));
                    break;
                case "R":
                case "r":
                    restartAction();
                    break;
                case " ":
                    event.preventDefault();
                    togglePausePlayAction();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [showCompletionPopup, isPaused]);

    
    // Function to calculate display time from WPM for a chunk
    const calculateDisplayTimeFromWPM = (chunk: string) => {
        const wordsPerSecond = WPM / 60;
        const wordCount = chunk.length / 5; // Assume an average of 5 characters per word including white spaces
        // Return the display time in milliseconds
        return (wordCount / wordsPerSecond) * 1000;
    };


    // Hook for managing word display based on chunk index, updating WPM based on gaze data
    useEffect(() => {
        let animationFrameId: number; // Used to store the request ID for cancellation

        // Continuously monitor and adjust based on gaze data
        const monitorAndAdjust = () => {
            // The start time of monitoring the current chunk
            const startTime = performance.now();
            // console.log('monitorAndAdjust')
    
            // Function to analyse gaze data and decide whether to adjust WPM or move to the next chunk
            const analyzeAndAdjust = () => {
                const currentTime = performance.now();
                const deltaTime = currentTime - startTime;
                const chunkDisplayTime = calculateDisplayTimeFromWPM(wordChunks[currentChunkIndex]);

                if (deltaTime >= chunkDisplayTime) {
                    setWPM(WPM);
                    WPMValues.current = [...WPMValues.current, WPM];
                    setCurrentChunkIndex(prevIndex => prevIndex + 1);
                }
    
                if (currentChunkIndex < wordChunks.length && !isPaused) {
                    animationFrameId = requestAnimationFrame(analyzeAndAdjust);
                } 
            };
    
            // Start the continuous analysis
            animationFrameId = requestAnimationFrame(analyzeAndAdjust); //generally has a refresh rate of 60Hz
        };
    
        if (!isPaused && currentChunkIndex < wordChunks.length) {
            monitorAndAdjust();
        }

        // When we reach the last chunk
        if (wordChunks.length > 0 && currentChunkIndex >= wordChunks.length - 1) {
            calculateAverageWPM();
            setIsPaused(true)
            setShowCompletionPopup(true);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };

    }, [currentChunkIndex, isPaused, wordChunks, WPM]);


    const calculateAverageWPM = () => {
        if (averageWPM !== null || WPMValues.current.length === 0) return;// Ensure there are recorded WPM values
    
        const sum = WPMValues.current.reduce((acc, cur) => acc + cur, 0);
        const calculatedAverageWPM = Math.round(sum / WPMValues.current.length);

        // Update state and submit.
        setAverageWPM(calculatedAverageWPM);
    };

    const { practiceId, setPracticeId } = usePracticeID(); // Accessing the setPracticeId method from the global context

    // This function takes the average WPM and sends it to the backend.
    const submitReadingSpeed = async (averageWpm: number | null) => {
        if (averageWpm === null) {
            console.error('No average WPM available to submit.');
            return; // Optionally show an error to the user
        }
        
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
                    mode: 1,
                    chunks_data: [],
                }),
            });
            if (response.status === 207) {
                console.log(response);
            }
            if (response.ok) {
                const data = await response.json();
                setPracticeId(data.practice_id); // Update global practice ID

            } else {
                // Handle non-OK responses
                console.error('Error submitting reading speed');
            }
        } catch (error) {
            console.error('Error in submitReadingSpeed:', error);
        }
    };
    

    const ReadingSpeedChart: FC<{ wpmValues: number[], averageWPM: number }> = ({ wpmValues, averageWPM }) => {
        const minWPM = Math.min(...wpmValues) - 50;
        const maxWPM = Math.max(...wpmValues) + 50;

        const data = {
            labels: wpmValues.map((_, index) => `Chunk ${index + 1}`),
            datasets: [
                {
                    label: 'WPM over Time',
                    data: wpmValues,
                    borderColor: 'rgb(0, 155, 155)',
                    backgroundColor: 'rgba(0, 192, 192, 0.5)',
                    fill: false,
                },
                {
                    label: 'Average WPM',
                    data: new Array(wpmValues.length).fill(averageWPM),
                    borderColor: 'rgb(215, 0, 0)',
                    borderDash: [5, 5],
                    fill: false,
                }
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: minWPM,  // Dynamically set minimum
                    suggestedMax: maxWPM,  // Dynamically set maximum
                }
            },
            plugins: {
                legend: {
                    position: 'top' as const, // This 'as const' assertion tells TypeScript this is a constant of type 'top'
                }
            }
        };

        return <div style={{ height: '100%', width: '100%' }}>
            <Line data={data} options={options} />
        </div>;
    };
    

    const gapBetweenSize = '10px';
    const displayHeight = '250px';
    const mainDivHeight = '320px';
    const plotHeight = '350px';

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
            className="flex justify-center items-start w-full bg-cyan-800 rounded-xl"
            style={{ gap: gapBetweenSize, height: mainDivHeight }}
        >
            <div className="rounded-lg ml-2 flex-1"
                style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                height: mainDivHeight,
            }}>

                {/* Div for Mode2 Display, taking more space */}
                <div
                    className="wordDisplayDiv flash-mode-display-bg-color rounded-lg shadow-lg w-full mt-2"
                    style={{
                    height: displayHeight,
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    alignItems: "center",
                    }}
                >
                        
                    {/* Countdown Display */}
                    {countdown !== null && (
                        <div style={{
                        position: 'absolute',
                        top: '50%', // Center vertically in the viewport
                        left: '50%', // Center horizontally in the viewport
                        transform: 'translate(-50%, -50%)',
                        fontSize: '50px',
                        zIndex: '1000',
                        color: 'rgb(200, 0, 0)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        }}>
                        {countdown > 0 ? countdown : 'Go!'}
                        </div>
                    )}

                    {/* Completion Popup */}
                    {showCompletionPopup && (
                        <>
                            <div className="flash-orange-border" style={{ 
                                position: 'absolute', // Position the modal absolutely relative to its nearest positioned ancestor
                                top: `-${gapBetweenSize}`, // Center it vertically
                                left: '50%', // Center it horizontally
                                transform: 'translate(-50%, -105%)', // Adjust the positioning to truly center the modal
                                width: '50vw',
                                display: 'flex',
                                borderRadius: '20px',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                background: 'white',
                                padding: '10px',
                                border: '3px solid orange',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                                <p style={{ fontSize: '18px', marginBottom: '20px', color: 'rgb(90, 90, 90)' }}>
                                    Congratulations on completing your speed-reading session!
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    {!redirectingToQuiz ? (
                                        <>
                                            <button className="BlackButton" style={{ margin: '0' }}  onClick={() => {
                                                setShowCompletionPopup(false);
                                                restartAction();
                                            }}>
                                                Restart
                                            </button>
                                            <button className="GreenButton" style={{ margin: '0' }}  onClick={handleContinueToQuiz}>
                                                Save Results & Start Quiz
                                            </button>
                                        </>
                                    ) : (
                                        <p style={{ fontSize: '18px', textAlign: 'center', color: 'rgb(90, 90, 90)' }}>
                                            Redirecting to Quiz Page 
                                            <span className="dot">.</span>
                                            <span className="dot">.</span>
                                            <span className="dot">.</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                
                    {/* Flex Container for CounterDisplay and Icons */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '100%', 
                        marginTop: "20px"
                    }}>
                        {/* Centered Counter Display */}
                        <CounterDisplay count={WPM} fontSize="16px"/>
                        {/* <button onClick={downloadGazeData}>Download Gaze Data</button> */}
                        {/* Container for Play/Pause and Restart Icons aligned to the top right */}
                        <div style={{ 
                            position: 'absolute',
                            top: 20, 
                            right: 20,
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', 
                            padding: '10px 10px', 
                            borderRadius: '10px', 
                            display: 'flex', 
                            gap: "10px"
                        }}>
                            {/* Play/Pause Icon */}
                            <button className={`icon-button ${isPausePlayActive ? 'active' : ''}`} onClick={togglePausePlayAction} disabled={showCompletionPopup}>
                                {isPaused ? <PiPlayBold size={22} /> : <PiPauseBold size={22} />}
                            </button>
                                                                            
                            {/* Restart Icon */}
                            <button className={`icon-button ${isRestartActive ? 'active' : ''}`} onClick={restartAction} disabled={showCompletionPopup}>
                                <VscDebugRestart size={24} />
                            </button>
                        </div>
                    </div>
                    {/* Mode 2: Chunk Display */}
                    <div className="wordDisplay monospaced" style={{ 
                        marginTop: "35px",
                        fontSize: `${fontSize}px`,
                        fontWeight: "bold",
                        maxWidth: "100vw",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}>
                        {wordChunks.length > 0 ? (
                            wordChunks[currentChunkIndex]
                        ) : (
                            <p style={{ color: 'gray', fontStyle: 'italic' }}>Please select a text from the sidebar on the left.</p>
                        )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ 
                        position: 'absolute',
                        bottom: '10px', // Set at the bottom of the parent div
                        width: '95%',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '10px'
                    }}>
                        <div className="bg-blue-700"
                            style={{
                            height: '8px',
                            borderRadius: '10px',
                            width: `${(currentChunkIndex + 1) / wordChunks.length * 100}%`
                        }}></div>
                    </div>
                </div>
                <div
                    className="rounded-lg w-full mb-2 flex-1 text-white"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        position: "relative",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: gapBetweenSize,
                    }}
                >
                    {/* First command div */}
                    <div className="rounded-lg h-full mr-1"
                        style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '15px', 
                        backgroundColor: 'rgb(130, 180, 200)', 
                    }}>
                        <p style={{ marginRight: '10px' }}>Press</p>
                        <TbSquareLetterR style={{ marginRight: '10px', fontSize: '24px' }} />
                        <p>to Restart</p>
                    </div>

                    {/* Second command div */}
                    <div className="rounded-lg h-full mx-1"
                        style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '15px', 
                        backgroundColor: 'rgb(130, 180, 200)',  
                    }}>
                        <p style={{ marginRight: '10px' }}>Press</p>
                        <RiSpace style={{ marginRight: '10px', fontSize: '26px' }} />
                        <p>to Pause/Play</p>
                    </div>

                    {/* Third command div */}
                    <div className="rounded-lg h-full ml-1"
                        style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '15px', 
                        backgroundColor: 'rgb(130, 180, 200)', 
                    }}>
                        <p style={{ marginRight: '10px' }}>Press</p>
                        <ArrowLeftSquare style={{ marginRight: '10px', fontSize: '24px' }} />
                        <ArrowRightSquare style={{ marginRight: '10px', fontSize: '24px' }} />
                        <p>to Adjust WPM</p>
                    </div>
                </div>
            </div>


            {/* Smaller divs on the right */}
            <div className="mr-2"
                style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                height: mainDivHeight,
            }}>

                {/* div 1 */}
                <div
                    className="flash-mode-display-bg-color rounded-lg shadow-lg px-6 pt-1.5 mt-2 pb-3"
                    style={{
                    width: `calc(var(--sidebar-width) - ${gapBetweenSize})`, // Use template literals to include the gapSize
                    display: 'flex',
                    flexDirection: 'column', // This will stack children divs on top of each other
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    marginBottom: `${gapBetweenSize}`,
                    }}
                >
                {/* First inner div for the title "Stats" and a gray horizontal line */}
                    <div className="flash-mode-display-bg-color"
                        style={{
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                        padding: '1px',
                        borderRadius: '10px',
                        margin: '5px',
                        width: '100%', 
                        textAlign: 'center',
                        }}
                    >
                        <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Stats</h3>
                    </div>

                    {/* Second inner div for the text "Average WPM:" centered */}
                    <div className="mt-1.5"
                        style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        }}
                    >
                        <p style={{ fontSize: '15px', color: 'rgb(90, 90, 90)' }}>
                        Average WPM: {averageWPM !== null ? averageWPM : <span style={{ fontStyle: 'italic', color: 'rgb(150, 150, 150)' }}>Pending</span>}
                        </p>
                    </div>
                </div>

                {/* div 2 */}
                <div
                    className="flash-mode-display-bg-color rounded-lg shadow-lg px-6 py-1.5 mb-2"
                    style={{
                    width: `calc(var(--sidebar-width) - ${gapBetweenSize})`, // Use template literals to include the gapSize
                    display: 'flex',
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    flexGrow: 1, 
                    }}
                >
                {/* First inner div for the title "Stats" and a gray horizontal line */}
                    <div style={{
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                        padding: '1px',
                        borderRadius: '10px',
                        margin: '5px',
                        width: '100%', 
                        textAlign: 'center',
                        }}
                    >
                        <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Features</h3>
                    </div>

                    <div
                        style={{
                        width: '100%', 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'space-evenly',
                        flex: 1, 
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>
                            <p style={{ margin: '0', marginRight: '3px' }}>Press</p>
                                <ArrowLeftSquare color={"rgb(90, 90, 90)"} /><ArrowRightSquare color={"rgb(90, 90, 90)"} />
                            <p style={{ marginLeft: '3px'}}>to Adjust WPM</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '15px', color: 'rgb(90, 90, 90)', textAlign: 'center' }}>
                                No eye-tracking technology or lexical complexity are used for WPM adjustments here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Chart display on completion */}
        <div
            className={`flex justify-center items-start w-full rounded-xl mt-2 py-2 ${
                showCompletionPopup && WPMValues.current.length > 0 ? 'bg-cyan-800' : 'bg-transparent'
            }`}
            style={{height: plotHeight }}
        >
            {showCompletionPopup && WPMValues.current.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg mx-2 h-full" style={{
                    width:'100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: "relative",
                    padding: '30px', // Padding to prevent content from touching the edges
                    // border: '2px solid gray',
                }}>
                    <ReadingSpeedChart wpmValues={WPMValues.current} averageWPM={averageWPM || 0} />
                </div>
            )}
        </div>
    </div>

    );
};

export default Mode1Display; 
