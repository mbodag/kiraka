"use client"; 

import { useEffect, useState, useRef, FC } from "react";
import { usePathname } from 'next/navigation';
import { useSelectedText } from "@/contexts/SelectedTextContext";
import CounterDisplay from "@/components/doc-mode/counter-display";
import styles from '@/app/(dashboard)/(routes)/Dashboard.module.css';
import '@/app/globals.css';
import { useWebGazer } from '@/contexts/WebGazerContext';
import { TbSquareLetterR } from "react-icons/tb";
import { RiSpace } from "react-icons/ri";
import { ArrowLeftSquare, ArrowRightSquare } from 'lucide-react';
import  { usePracticeID } from '@/contexts/PracticeIDContext';
import { useAuth } from "@clerk/nextjs";
import { VscDebugRestart } from "react-icons/vsc";
import { PiPauseBold, PiPlayBold } from "react-icons/pi";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


interface ExtendedWindow extends Window {
    webgazer?: {
      setGazeListener: (callback: (data: any, elapsedTime: number) => void) => ExtendedWindow;
      clearGazeListener: () => void;
    };
  }

interface GazeDataPoint {
    x: number;
    normScaledX: number;
    y: number;
    elapsedTime: number;
    deltaX: number;
    normScaledDeltaX: number;
    deltaY: number;
    deltaT: number;
    speedX: number;
    normScaledSpeedX: number;
    Lefts: number;
}

interface GazeDataToSend {
    normScaledX: number;
    y: number;
    elapsedTime: number;
}


const wordsPerChunk = 10;
const avgCharCountPerWord = 5; // This is an approximation (~4.7 for English language)
const startWPM = 300;
const significantLeftNormSpeed = -2/1201*100; // determined experimentally, based on the mac word display width (1201px) at the time of the experiment, and the value of -2px/s for threshold speed. Scaled by 100 (giving percentage)
// const yBlinkingUpperThreshold = 2; // determined experimentally
// const yBlinkingLowerThreshold = -2.6; // determined experimentally
const manualConstIncreaseWPM = 20;
const manualConstDecreaseWPM = 20;
const consecutiveWPMIncreaseThreshold = 2;
const consecutiveWPMDecreaseThreshold = 7;
const maxCutOffTime = 1500;

const Mode2Display = () => {

    const pathname = usePathname();

    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [pastAvgWPMs, setPastAvgWPMs] = useState<number[]>([startWPM]);
    const [WPM, setWPM] = useState(startWPM);
    const WPMValues = useRef<number[]>([startWPM]); // To store the WPMs values and take their average at the end of the session; to be sent to the database
    const adjustedStartWPM = useRef<number>(startWPM); 
    const [averageWPM, setAverageWPM] = useState<number | null>(null);
    const gazeDataRef = useRef<GazeDataPoint[]>([]);
    const gazeDataByChunk = useRef<GazeDataToSend[][]>([]);
    const consecutiveLeftMovements = useRef<number>(0);
    const consecutiveWPMDecrease = useRef<number>(0);
    const consecutiveWPMIncrease = useRef<number>(0);
    const [isUserTired, setIsUserTired] = useState(false);

    const [isPaused, setIsPaused] = useState(true); // Added a state to track whether the flashing is paused
    const [isRestartActive, setIsRestartActive] = useState(false);
    const [isPausePlayActive, setIsPausePlayActive] = useState(false);

    const maxCharsPerChunk = wordsPerChunk * avgCharCountPerWord
    const { selectedTextId } = useSelectedText(); // Use the ID from context
    const { userId } = useAuth();
    const [wordChunks, setWordChunks] = useState<string[]>([]);
    const [complexityChunks, setComplexityChunks] = useState<number[]>([]);

    // Accessing the current state of WebGazer
    const { isWebGazerActive, setWebGazerActive } = useWebGazer();
    const [showCalibrationPopup, setShowCalibrationPopup] = useState(true);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [redirectingToCalibration, setRedirectingToCalibration] = useState(false);
    const [redirectingToQuiz, setRedirectingToQuiz] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Added features
    const [integrateComplexity, setIntegrateComplexity] = useState(false);

    // Added Difficulty Levels
    const [difficultyLevel, setDifficultyLevel] = useState("beginner"); 

    // Dynamic parameters to update based on difficulty
    const [minWPM, setMinWPM] = useState(180);
    const [maxWPM, setMaxWPM] = useState(700);
    const [constDecreaseWPM, setConstDecreaseWPM] = useState(60);
    const [percentageDisplayTimeUpper, setPercentageDisplayTimeUpper] = useState(0.8);
    const [percentageDisplayTimeLower, setPercentageDisplayTimeLower] = useState(0.6);
    const percentageDisplayTimeToIgnoreExperimental = 0.6; // chosen experimentally
    const [maxConstIncreaseWPM, setMaxConstIncreaseWPM] = useState(40);
    const [minConstDecreaseWPM, setMinConstDecreaseWPM] = useState(20);
    const [cumulativeIncreaseThreshold1, setCumulativeIncreaseThreshold1] = useState(maxConstIncreaseWPM * 1.5);
    const [cumulativeIncreaseThreshold2, setCumulativeIncreaseThreshold2] = useState(maxConstIncreaseWPM * 2);
    const [dampenedIncreaseWPM, setDampenedIncreaseWPM] = useState(0);
    const [dampenedDecreaseWPM, setDampenedDecreaseWPM] = useState(0);
    const [decreaseAdjustmentStep, setDecreaseAdjustmentStep] = useState(1);

    // Update parameters based on difficulty level
    useEffect(() => {
        switch (difficultyLevel) {
            case "beginner":
                setMinWPM(100);
                setMaxWPM(450);
                setConstDecreaseWPM(60);
                setPercentageDisplayTimeUpper(0.8);
                setPercentageDisplayTimeLower(0.5);
                setMaxConstIncreaseWPM(40);
                setMinConstDecreaseWPM(20);
                setCumulativeIncreaseThreshold1(40 * 1.5);
                setCumulativeIncreaseThreshold2(40 * 2);
                setDampenedIncreaseWPM(0);
                setDampenedDecreaseWPM(-5);
                setDecreaseAdjustmentStep(1);
                break;
            case "intermediate":
                setMinWPM(200);
                setMaxWPM(700);
                setConstDecreaseWPM(50);
                setPercentageDisplayTimeUpper(0.82);
                setPercentageDisplayTimeLower(0.52);
                setMaxConstIncreaseWPM(50);
                setMinConstDecreaseWPM(17);
                setCumulativeIncreaseThreshold1(50 * 1.5);
                setCumulativeIncreaseThreshold2(50 * 2);
                setDampenedIncreaseWPM(2);
                setDampenedDecreaseWPM(-10);
                setDecreaseAdjustmentStep(1);
                break;
            case "expert":
                setMinWPM(300);
                setMaxWPM(1000);
                setConstDecreaseWPM(40);
                setPercentageDisplayTimeUpper(0.85);
                setPercentageDisplayTimeLower(0.55);
                setMaxConstIncreaseWPM(60);
                setMinConstDecreaseWPM(15);
                setCumulativeIncreaseThreshold1(60 * 1.5);
                setCumulativeIncreaseThreshold2(60 * 2);
                setDampenedIncreaseWPM(5);
                setDampenedDecreaseWPM(-15);
                setDecreaseAdjustmentStep(2);
                break;
            default:
                setMinWPM(180);
                setMaxWPM(500);
                setConstDecreaseWPM(60);
                setPercentageDisplayTimeUpper(0.8);
                setPercentageDisplayTimeLower(0.6);
                setMaxConstIncreaseWPM(40);
                setMinConstDecreaseWPM(20);
                setCumulativeIncreaseThreshold1(40 * 1.5);
                setCumulativeIncreaseThreshold2(40 * 2);
                setDampenedIncreaseWPM(0);
                setDampenedDecreaseWPM(0);
                setDecreaseAdjustmentStep(1);
                break;
        }
    }, [difficultyLevel]);


    useEffect(() => {
        // Check if the session is new -- if yes, ensure webgazer is set to inactive as camera will be off
        const isExistingSession = sessionStorage.getItem('isExistingSession');
        if (!isExistingSession) {
            // If no existing session, set WebGazer to inactive
            setWebGazerActive(false);
            sessionStorage.setItem('isExistingSession', 'true'); // Mark this session as existing
        }
    }, []);
    
    useEffect(() => {
        const handleBeforeUnload = (event: any) => {
            localStorage.setItem('webGazerActive', 'false');
            // event.returnValue = `Are you sure you want to leave?`;
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      }, []);

    useEffect(() => {
        const fetchPastWPM = async () => {
          try {
            const response = await fetch(`/api/avgWPM?user_id=${userId}&mode=2`);
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
    
            // Adjust starting WPM based on difficulty level
            // Ensure it's within [minWPM, minWPM + 200] and never exceeds 450
            const maxAllowedWPM = Math.min(minWPM + 200, 450);
            const adjustedWPM = Math.min(Math.max(average, minWPM), maxAllowedWPM);
            adjustedStartWPM.current = adjustedWPM;

            setWPM(adjustedStartWPM.current);
            WPMValues.current = [adjustedStartWPM.current]
        }
    }, [pastAvgWPMs, minWPM]);


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
        if (!isWebGazerActive && !redirectingToQuiz) {
            setShowCalibrationPopup(true);
        } else {
            setShowCalibrationPopup(false);
        }
    }, [isWebGazerActive, redirectingToQuiz]);

    const handleGoToCalibration = () => {
        setRedirectingToCalibration(true); // Set redirecting state to true
        setTimeout(() => {
            window.location.href = '/calibration'; // Redirect after a brief pause
        }, 1500);
    };
    const handleContinueToQuiz = async () => {
        setShowCompletionPopup(false);
        setRedirectingToQuiz(true);
        await submitReadingSpeed(averageWPM);
        setWebGazerActive(false)
        window.location.href = '/quiz';
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
            }, 400);  // Allow 400ms second for "Go!" to be visible
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
        consecutiveLeftMovements.current = 0;
        consecutiveWPMDecrease.current = 0;
        consecutiveWPMIncrease.current = 0;
        gazeDataByChunk.current = [];
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
            if (showCalibrationPopup || showCompletionPopup) {
                return;
            }
    
            switch (event.key) {
                case "ArrowRight":
                    setWPM((prevWPM) => Math.min(prevWPM + manualConstIncreaseWPM, maxWPM));
                    break;
                case "ArrowLeft":
                    setWPM((prevWPM) => Math.max(prevWPM - manualConstDecreaseWPM, minWPM));
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
    }, [showCalibrationPopup, showCompletionPopup, isPaused]);



    useEffect(() => {
        if (showCompletionPopup) {
            setShowCompletionPopup(false);  // Hide the popup if it's visible
        }
        restartAction();
    }, [integrateComplexity, difficultyLevel]);
    
    
    // Function to calculate display time from WPM for a chunk
    const calculateDisplayTimeFromWPM = (chunk: string) => {
        const wordsPerSecond = WPM / 60;
        const wordCount = chunk.length / 5; // Assume an average of 5 characters per word including white spaces
        // Return the display time in milliseconds
        return (wordCount / wordsPerSecond) * 1000;
    };
    // Function to calculate WPM from display time for a chunk
    const calculateWPMFromDisplayTime = (displayTimeMs: number, chunk: string) => {
        const displayTimeSeconds = displayTimeMs / 1000; // Convert milliseconds to seconds
        const wordCount = chunk.length / 5; // Assume an average of 5 characters per word including white spaces
        const wordsPerSecond = wordCount / displayTimeSeconds;
        const WPM = wordsPerSecond * 60;
        return WPM;
    };
    // Function to calculate percentageDisplayTimeToIgnore for a chunk
    const calculatePercentageDisplayTimeToIgnore = (displayTimeMs: number): number => {
        // const baseTime = 10 * 60 * 1000; // Base time for 10 minutes in milliseconds (assuming 10 words per chunk -- equivalent to the maximum of 50 characters per chunk)
        // const minScaledDisplayTime = baseTime / minWPM;
        // const maxScaledDisplayTime = baseTime / maxWPM;
        // const normalisedTime = (displayTimeMs - minScaledDisplayTime) / (maxScaledDisplayTime - minScaledDisplayTime);
        const normalisedTime = Math.min(1, Math.max(0, (WPM - minWPM)/(maxWPM - minWPM)))
        const percentageToIgnore = percentageDisplayTimeLower + normalisedTime * (percentageDisplayTimeUpper - percentageDisplayTimeLower);
        return Math.max(percentageDisplayTimeLower, Math.min(percentageToIgnore, percentageDisplayTimeUpper));
    };

    const getGradualSpeedIncrement = (inferredWPM: number, maxWPM: number) => {
        const gapThreshold = 400;  // WPM difference to start scaling down the increment
        const baseIncrement = 8; // Default increment
        const minimumIncrement = 4; // Minimum increment when close to maxWPM
        const gap = maxWPM - inferredWPM;
        if (gap <= gapThreshold) {
          return minimumIncrement + (baseIncrement - minimumIncrement) * (gap / gapThreshold);
        }
        return baseIncrement;
      };

    const computeStrongComplexityFactor = (complexity: number): number => {
        // Derived so that it is 0 for 0.77 and 0.9 for 1
        const a = 10.0112;
        const b = -7.70865;
        return 1 - Math.exp(-(a * complexity + b)); // bounded by 1 
    }
    const computeWeakComplexityFactor = (complexity: number): number => {
        // Derived so that it is 0 for 0.7 and 0.9 for 0.5
        const a = 11.5129;
        const b = -8.05905;
        return 1 - Math.exp((a * complexity + b)); // bounded by 1 (i.e., 100% for factor)
    }
    const adjustWPMForComplexity = (chunkIndex: number, integrateComplexity: boolean): number => {
        if (!integrateComplexity) return 0;  // No adjustment if integration is disabled

        let complexity = 0.74;  // Default value for complexity that triggerd no adjustments (in case there is an error on the returned complexity list)
        if (chunkIndex >= 0 && chunkIndex < complexityChunks.length) {
            complexity = complexityChunks[chunkIndex];
        }
        const Kmin = 5;
        const Kmax = complexity <= 0.7 ? 15 : 30;

        if (complexity >= 0.77) {
            // Complexity is high, decrease WPM
            const factor = computeStrongComplexityFactor(complexity);
            const decrease = Kmin + factor * (Kmax - Kmin);
            return -decrease;
        } else if (complexity <= 0.7) {
            // Complexity is low, increase WPM
            const factor = computeWeakComplexityFactor(complexity);
            const increase = Kmin + factor * (Kmax - Kmin);
            return increase;
        } else {
            return 0
        }
    }
    
    
    // Hook to set up and manage the gaze listener:
    useEffect(() => {
        // Only proceed if WebGazer is active, the component is not paused, and we're in a browser environment
        if (isWebGazerActive && !isPaused && typeof window !== "undefined") {
            // Cast the window object to an ExtendedWindow type to access custom properties like webgazer
            const extendedWindow: ExtendedWindow = window as ExtendedWindow;
            // Use optional chaining to safely call setGazeListener if webgazer is defined
            extendedWindow.webgazer?.setGazeListener((data: any, elapsedTime: any) => {
                // Proceed if there's gaze data and it includes an x-coordinate
                if (data && data.x && data.y && elapsedTime) {
                    const divWidth = document.querySelector('.wordDisplayDiv')?.clientWidth ?? 1;
                    const normScaledX = data.x / divWidth * 100;
                    const deltaX = gazeDataRef.current.length > 0 ? data.x - gazeDataRef.current[gazeDataRef.current.length - 1].x : 0;
                    const normScaledDeltaX = gazeDataRef.current.length > 0 ? normScaledX - gazeDataRef.current[gazeDataRef.current.length - 1].normScaledX : 0;
                    const deltaY = gazeDataRef.current.length > 0 ? data.y - gazeDataRef.current[gazeDataRef.current.length - 1].y : 0;
                    const deltaT = gazeDataRef.current.length > 0 ? elapsedTime - gazeDataRef.current[gazeDataRef.current.length - 1].elapsedTime : 0;
                    const speedX = deltaT > 0 ? deltaX/deltaT : 0;
                    const speedY = deltaT > 0 ? deltaY/deltaT : 0;
                    const normScaledSpeedX = deltaT > 0 ? normScaledDeltaX/deltaT : 0;
                    console.log('x:', data.x, '|', 'normScaledX:', normScaledX, '|', 'y:', data.y, '|', 'elapsedTime:', elapsedTime, '|', 'deltaX:', deltaX, '|', 
                    'normScaledDeltaX:', normScaledDeltaX, '|', 'deltaY:', deltaY, '|', 'deltaT:', deltaT, '|', 'speedX:', speedX, '|', 'speedY:', speedY, '|', 'normScaledSpeedX:', normScaledSpeedX);
                
                    if (normScaledSpeedX < significantLeftNormSpeed) {
                        consecutiveLeftMovements.current += 1;
                      } else {
                        consecutiveLeftMovements.current = 0;
                      }
                    const Lefts = consecutiveLeftMovements.current

                    gazeDataRef.current.push({ x: data.x, normScaledX: normScaledX, y: data.y, elapsedTime, deltaX, normScaledDeltaX: normScaledDeltaX, 
                        deltaY, deltaT, speedX, normScaledSpeedX: normScaledSpeedX, Lefts });


                    const newGazeData: GazeDataToSend = {
                        normScaledX: normScaledX,
                        y: data.y,
                        elapsedTime: elapsedTime
                    };
                    if (!gazeDataByChunk.current[currentChunkIndex]) {
                        gazeDataByChunk.current[currentChunkIndex] = [];
                    }
                    gazeDataByChunk.current[currentChunkIndex].push(newGazeData);
                }
            });

            // Cleanup function to clear the gaze listener when the component unmounts or dependencies change
            return () => extendedWindow.webgazer?.clearGazeListener();
        }
    }, [isWebGazerActive, isPaused, currentChunkIndex]); // Depend on WebGazer's activity, pause state, and current chunk index
    


    // Hook for managing word display based on chunk index, updating WPM based on gaze data
    useEffect(() => {
        let animationFrameId: number; // Used to store the request ID for cancellation

        // Continuously monitor and adjust based on gaze data
        const monitorAndAdjust = () => {
            // The start time of monitoring the current chunk
            const startTime = performance.now();
            console.log('monitorAndAdjust')
    
            // Function to analyse gaze data and decide whether to adjust WPM or move to the next chunk
            const analyzeAndAdjust = () => {
                const currentTime = performance.now();
                const deltaTime = currentTime - startTime;
                const chunkDisplayTime = calculateDisplayTimeFromWPM(wordChunks[currentChunkIndex]);
                let percentageDisplayTimeToIgnore = calculatePercentageDisplayTimeToIgnore(chunkDisplayTime);
                let displayTimeToIgnore = chunkDisplayTime * percentageDisplayTimeToIgnore;
                if (currentChunkIndex === 0) {
                    displayTimeToIgnore = 500;
                }
                console.log('one iteration')
                console.log('WPM', WPM)
                console.log('currentChunkIndex', currentChunkIndex)
                console.log('chunkDisplayTime', chunkDisplayTime)
                console.log('displayTimeToIgnore', displayTimeToIgnore)
                console.log('deltaTime', deltaTime)

                // Ensure we're analysing only after at least displayTimeToIgnore has passed
                if (deltaTime > Math.min(displayTimeToIgnore, maxCutOffTime)) {
                    console.log('entered 0.6T')

                    // If significant leftward movement is detected
                    if (gazeDataRef.current.length > 0 && gazeDataRef.current[gazeDataRef.current.length - 1].Lefts >= 1) {
                        // Increase WPM and move to the next chunk
                        const inferredWPM = calculateWPMFromDisplayTime(deltaTime, wordChunks[currentChunkIndex])
                        const gradualSpeedIncrement = getGradualSpeedIncrement(inferredWPM, maxWPM);
                        const increasedWPM = Math.round(Math.min(WPM + maxConstIncreaseWPM, inferredWPM + gradualSpeedIncrement, maxWPM));
                        console.log('increasedWPM', increasedWPM)

                        let complexityAdjustment = 0; 
                        if (currentChunkIndex < wordChunks.length - 1) {
                            complexityAdjustment = Math.round(adjustWPMForComplexity(currentChunkIndex + 1, integrateComplexity));
                        } 
                        console.log('NEW currentChunkIndex', currentChunkIndex)
                        console.log('NEW complexityChunks', complexityChunks)
                        console.log('NEW complexityChunks[currentChunkIndex]', complexityChunks[currentChunkIndex])
                        console.log('NEW complexityChunks[currentChunkIndex + 1]', complexityChunks[currentChunkIndex + 1])
                        console.log('NEW complexityAdjustment 1', complexityAdjustment)
                        
                        // Track consecutive increases
                        if (increasedWPM > WPM) {
                            consecutiveWPMIncrease.current += 1;
                            console.log('Incrementing consecutive increases:', consecutiveWPMIncrease.current);
                        } else {
                            consecutiveWPMIncrease.current = 0; // Reset if WPM does not increase
                            console.log('Resetting consecutive increases because new WPM is not greater than old WPM');
                        }
                        
                        // Check for uncontrolled increase after at least {consecutiveWPMIncreaseThreshold} consecutive increases
                        if (consecutiveWPMIncrease.current >= consecutiveWPMIncreaseThreshold) {
                            console.log('Checking for uncontrolled increase:', consecutiveWPMIncrease.current, 'Threshold:', consecutiveWPMIncreaseThreshold);
                            const prevWPMIncrease = WPMValues.current[WPMValues.current.length - 1] - WPMValues.current[WPMValues.current.length - 2];
                            const currentWPMIncrease = increasedWPM - WPMValues.current[WPMValues.current.length - 1];
                            console.log('Previous and Current WPM Increases:', prevWPMIncrease, currentWPMIncrease);

                            if (consecutiveWPMIncrease.current >= (consecutiveWPMIncreaseThreshold + 1)) {
                                if (WPMValues.current.length >= (consecutiveWPMIncreaseThreshold + 1)) {
                                    const totalIncrease = WPMValues.current.slice(-3).reduce((acc, val, index, array) => {
                                        if (index === 0) return acc;
                                        return acc + (array[index] - array[index - 1]);
                                    }, 0);
                            
                                    console.log('Total increase over three increments:', totalIncrease);
                            
                                    if (totalIncrease > cumulativeIncreaseThreshold2) {
                                        // Apply damping using dampenedDecreaseWPM
                                        const dampenedWPM = WPM + dampenedDecreaseWPM;
                                        console.log('Applying heavier dampening with dampenedDecreaseWPM', dampenedWPM);
                                        const adjustedDampenedWPM = Math.max(minWPM, Math.min(maxWPM, dampenedWPM + complexityAdjustment));
                                        setWPM(adjustedDampenedWPM);
                                        WPMValues.current = [...WPMValues.current, adjustedDampenedWPM];
                                        consecutiveWPMIncrease.current = 0;
                                        return;
                                    }
                                }
                            }

                            if (currentWPMIncrease + prevWPMIncrease > cumulativeIncreaseThreshold1) {
                                // Apply standard damping
                                const dampenedWPM = WPM + dampenedIncreaseWPM; // Example damping: Smaller increment
                                console.log('Applying normal dampening with dampenedIncreaseWPM', dampenedWPM);
                                const adjustedDampenedWPM = Math.max(minWPM, Math.min(maxWPM, dampenedWPM + complexityAdjustment));
                                console.log('NEW adjustedDampenedWPM', adjustedDampenedWPM)
                                setWPM(adjustedDampenedWPM);
                                WPMValues.current = [...WPMValues.current, adjustedDampenedWPM];
                                // consecutiveWPMIncrease.current = 0; // Do not reset here to allow for three consecutive checks
                                console.log('DAMPED increase of WPM', dampenedWPM, 'for WPM:', WPM)
                            } else {
                                const adjustedIncreasedWPM = Math.max(minWPM, Math.min(maxWPM, increasedWPM + complexityAdjustment));
                                console.log('NEW adjustedIncreasedWPM 1', adjustedIncreasedWPM)
                                setWPM(adjustedIncreasedWPM);
                                WPMValues.current = [...WPMValues.current, adjustedIncreasedWPM];
                                console.log('NORMAL increase of WPM', increasedWPM, 'for WPM:', WPM)
                            }

                        } else {
                            const adjustedIncreasedWPM = Math.max(minWPM, Math.min(maxWPM, increasedWPM + complexityAdjustment));
                            console.log('NEW adjustedIncreasedWPM 2', adjustedIncreasedWPM)
                            setWPM(adjustedIncreasedWPM);
                            WPMValues.current = [...WPMValues.current, adjustedIncreasedWPM];
                            console.log('NORMAL increase of WPM', increasedWPM, 'for WPM:', WPM)
                        }
            
                        setCurrentChunkIndex(prevIndex => prevIndex + 1);
                        gazeDataRef.current = [];
                        consecutiveLeftMovements.current = 0;
                        consecutiveWPMDecrease.current = 0;
                        console.log('TOO SLOW - LEFT DETECTED')
                        console.log('WPM', WPM)
                        console.log('currentChunkIndex', currentChunkIndex)


                    } else if (deltaTime >= chunkDisplayTime) {
                        // No leftward movement detected by the end of the chunk display time,
                        // possibly indicating the need to slow down
                        // Gradually reduce the decrease factor based on the number of chunks read -- this is to boost speed reading
                        const chunksReadFactor = Math.floor(currentChunkIndex / (wordChunks.length/10));
                        const adjustedDecreaseWPM = Math.max(constDecreaseWPM - chunksReadFactor * decreaseAdjustmentStep, minConstDecreaseWPM);
                        const decreasedWPM = Math.max(WPM - adjustedDecreaseWPM, minWPM)
                        console.log('decreasedWPM', decreasedWPM, 'for WPM:', WPM)

                        // Track consecutive decreases
                        if (decreasedWPM < WPM) {
                            consecutiveWPMDecrease.current += 1;
                        } else {
                            consecutiveWPMDecrease.current = 0; // Reset if WPM does not decrease
                        }

                        let complexityAdjustment = 0; 
                        if (currentChunkIndex < wordChunks.length - 1) {
                            complexityAdjustment = Math.round(adjustWPMForComplexity(currentChunkIndex + 1, integrateComplexity));
                        }
                        console.log('NEW currentChunkIndex', currentChunkIndex)
                        console.log('NEW complexityChunks', complexityChunks)
                        console.log('NEW complexityChunks[currentChunkIndex]', complexityChunks[currentChunkIndex])
                        console.log('NEW complexityChunks[currentChunkIndex + 1]', complexityChunks[currentChunkIndex + 1])
                        console.log('NEW complexityAdjustment 1', complexityAdjustment)

                        const adjustedDecreasedWPM = Math.max(minWPM, Math.min(maxWPM, decreasedWPM + complexityAdjustment));
                        console.log('NEW adjustedDecreasedWPM', adjustedDecreasedWPM)
                        setWPM(adjustedDecreasedWPM);
                        WPMValues.current = [...WPMValues.current, adjustedDecreasedWPM];
                        setCurrentChunkIndex(prevIndex => prevIndex + 1);
                        gazeDataRef.current = [];
                        consecutiveLeftMovements.current = 0;
                        consecutiveWPMIncrease.current = 0;
                        // if (consecutiveWPMDecrease.current > consecutiveWPMDecreaseThreshold) {
                        //     setIsUserTired(true)
                        //     setIsPaused(true)
                        //     // console.log('TIRED')
                        //     // consecutiveWPMDecrease.current = 0;
                        // }
                        console.log('TOO FAST - LEFT NOT DETECTED')
                        console.log('WPM', WPM)
                        console.log('currentChunkIndex', currentChunkIndex)
                    }
                }
    
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

    }, [currentChunkIndex, isPaused, wordChunks, WPM, isWebGazerActive]);


    const calculateAverageWPM = () => {
        if (averageWPM !== null || WPMValues.current.length === 0) return;// Ensure there are recorded WPM values
    
        const sum = WPMValues.current.reduce((acc, cur) => acc + cur, 0);
        const calculatedAverageWPM = Math.round(sum / WPMValues.current.length);

        // console.log('WPMValues', WPMValues.current)
        // console.log('WPMValues length', WPMValues.current.length)
        // console.log('word chunks', wordChunks.length)

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
                    mode: 2,
                    chunks_data: gazeDataByChunk.current,
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



    const downloadGazeData = () => {
        const fileName = "gazeDataByChunk.json";
        const json = JSON.stringify(gazeDataByChunk.current, null, 2);
        const blob = new Blob([json], {type: "application/json"});
        const href = URL.createObjectURL(blob);
      
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
      
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
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
            className="flex justify-center items-start w-full bg-green-800 rounded-xl"
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
                    {
                        showCalibrationPopup && (
                            <>
                            <div className="modal-backdrop" style={{ zIndex: -1}}></div>
                                <div className="modal-content" style={{ 
                                    width: '600px', 
                                    display: 'flex', 
                                    borderRadius: '20px' ,
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    }}> 
                                    {!redirectingToCalibration ? (
                                    <>
                                        <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}>
                                            Welcome to <strong>FlashMode!</strong>
                                        </p>
                                        <p>Explore two FlashMode configurations: <span style={{ color: 'darkblue' }}><strong>Static</strong></span> and <span style={{ color: 'darkgreen' }}><strong>Adaptive</strong></span>. To choose, use the toggle switch button above.</p>
                                        <div className='mx-2 mt-4 bg-blue-50 shadow-lg rounded-xl p-4'>
                                        <p><strong>Static:</strong> Chunks of text successively appear in brief, rapid bursts or &quot;flashes&quot;. Speed, measured in <span style={{ fontStyle: 'italic' }}>WPM (Words Per Minute)</span>, can be adjusted with the arrow keys. Options to pause, start, or restart are also available at any time.</p>
                                        </div>
                                        <div className='mx-2 my-6 bg-green-50 shadow-lg rounded-xl p-4'>
                                            <p><strong>Adaptive</strong> <span style={{ fontStyle: 'italic' }}>(Recommended)</span>: Integrates Webgazer&apos;s eye-tracking to automatically adjust your WPM, encouraging faster reading. <span style={{ textDecoration: 'underline'  }}>If the pace feels too fast</span>, manual WPM adjustments via arrow keys and controls to pause, start, or restart are still available.</p>
                                        </div>
                                        <p>To begin WebGazer calibration, click the button below!</p>
                                        <br></br>
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
                        <CounterDisplay count={WPM} fontSize="16px" className={showCalibrationPopup ? 'blur-effect' : ''}/>
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
                            gap: "10px"  // Space between icons
                        }} className={showCalibrationPopup ? 'blur-effect' : ''}>
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
                    <div className={`wordDisplay monospaced ${showCalibrationPopup ? 'blur-effect' : ''}`} style={{ 
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
                    <div className={showCalibrationPopup ? 'blur-effect' : ''} style={{ 
                        position: 'absolute',
                        bottom: '10px', // Set at the bottom of the parent div
                        width: '95%',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '10px'
                    }}>
                        <div style={{
                            height: '8px',
                            borderRadius: '10px',
                            backgroundColor: '#4CAF50',
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
                        backgroundColor: 'rgb(80, 150, 80)', 
                    }}>
                        <p style={{ marginRight: '10px' }} className={showCalibrationPopup ? 'blur-effect' : ''}>Press</p>
                        <TbSquareLetterR style={{ marginRight: '10px', fontSize: '24px' }} className={showCalibrationPopup ? 'blur-effect' : ''}/>
                        <p className={showCalibrationPopup ? 'blur-effect' : ''}>to Restart</p>
                    </div>

                    {/* Second command div */}
                    <div className="rounded-lg h-full mx-1"
                        style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '15px', 
                        backgroundColor: 'rgb(80, 150, 80)',
                    }}>
                        <p style={{ marginRight: '10px' }} className={showCalibrationPopup ? 'blur-effect' : ''}>Press</p>
                        <RiSpace style={{ marginRight: '10px', fontSize: '26px' }} className={showCalibrationPopup ? 'blur-effect' : ''}/>
                        <p className={showCalibrationPopup ? 'blur-effect' : ''}>to Pause/Play</p>
                    </div>

                    {/* Third command div */}
                    <div className="rounded-lg h-full ml-1"
                        style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '15px', 
                        backgroundColor: 'rgb(80, 150, 80)',
                    }}>
                        <p style={{ marginRight: '10px' }} className={showCalibrationPopup ? 'blur-effect' : ''}>Press</p>
                        <ArrowLeftSquare style={{ marginRight: '10px', fontSize: '24px' }} className={showCalibrationPopup ? 'blur-effect' : ''}/>
                        <ArrowRightSquare style={{ marginRight: '10px', fontSize: '24px' }} className={showCalibrationPopup ? 'blur-effect' : ''}/>
                        <p className={showCalibrationPopup ? 'blur-effect' : ''}>to Adjust WPM</p>
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
                    <div
                        className={`flash-mode-display-bg-color ${showCalibrationPopup ? 'blur-effect' : ''}`}
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
                    {/* Checkbox for toggling complexity adjustment */}
                    <div className="mt-1.5"
                        style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flex: 1, 
                        }}
                    >
                        <p className={showCalibrationPopup ? 'blur-effect' : ''} style={{ fontSize: '15px', color: 'rgb(90, 90, 90)' }}>
                        Average WPM: {averageWPM !== null ? averageWPM : <span style={{ fontStyle: 'italic', color: 'rgb(150, 150, 150)' }}>Pending</span>}
                        </p>
                    </div>
                </div>

                {/* div 2 */}
                <div
                    className="flash-mode-display-bg-color rounded-lg shadow-lg px-6 pt-1.5 mb-2"
                    style={{
                    width: `calc(var(--sidebar-width) - ${gapBetweenSize})`, // Use template literals to include the gapSize
                    display: 'flex',
                    flexDirection: 'column', // This will stack children divs on top of each other
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    flexGrow: 1, 
                    }}
                >
                {/* First inner div for the title "Stats" and a gray horizontal line */}
                    <div
                        className={showCalibrationPopup ? 'blur-effect' : ''}
                        style={{
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

                    {/* Second inner div */}
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
                        <div style={{ display: 'flex', alignItems: 'center'}} className={showCalibrationPopup ? 'blur-effect' : ''}>
                            <label style={{ fontSize: '15px', color: 'rgb(90, 90, 90)', marginRight: '10px' }}>
                                Level:
                            </label>
                            <select
                                value={difficultyLevel}
                                onChange={(e) => setDifficultyLevel(e.target.value)}
                                style={{ fontSize: '15px', padding: '5px 10px', color: 'rgb(50, 50, 50)', outline: 'none' }}
                                disabled={showCompletionPopup}
                                className="bg-orange-100 rounded-xl shadow"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '15px', color: 'rgb(90, 90, 90)' }} className={showCalibrationPopup ? 'blur-effect' : ''}>
                                <input
                                    type="checkbox"
                                    checked={integrateComplexity}
                                    onChange={e => setIntegrateComplexity(e.target.checked)}
                                    style={{ marginRight: '10px', outline: 'none',
                                             accentColor: integrateComplexity ? 'orange' : 'initial' 
                                            }}
                                    disabled={showCompletionPopup}
                                />
                                Add smarter WPM adjustments based on lexical complexity
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Chart display on completion */}
        <div
            className={`flex justify-center items-start w-full rounded-xl mt-2 py-2 ${
                showCompletionPopup && WPMValues.current.length > 0 ? 'bg-green-800' : 'bg-transparent'
            }`}
            style={{height: plotHeight }}
        >
            {showCompletionPopup && WPMValues.current.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg mx-2 h-full" style={{
                    width: '100%',
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

export default Mode2Display;
