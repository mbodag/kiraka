"use client"; 
import { useEffect, useState, useRef } from "react";
import CounterDisplay from "../mode-1/counter-display";
import '@/app/globals.css';

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
    const [wordsPerMinute, setWordsPerMinute] = useState(300); // Words per minute, adjustable
    const [isPaused, setIsPaused] = useState(true); // Add a state to track whether the flashing is paused
    const [maxCharsPerChunk, setMaxCharsPerChunk] = useState(60); // Initial value, will be updated

    const [webgazerActive, setWebgazerActive] = useState<false>(false); // Track if WebGazer is active
    
    //   // Ref for managing interval cleanly
    //   const intervalRef = useRef(null);

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

    const wordChunks = shortStory.match(new RegExp('.{1,' + maxCharsPerChunk + '}(\\s|$)', 'g')) || [];

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "ArrowRight") {
            setWordsPerMinute((prevWPM) => Math.min(prevWPM + 20, 1000)); // Increase WPM, max 1000
        } else if (event.key === "ArrowLeft") {
            setWordsPerMinute((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease WPM, min 100
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

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (!isPaused && currentChunkIndex < wordChunks.length) {
        const interval = (60000 / wordsPerMinute) * (maxCharsPerChunk / 5); // Assuming an average of 5 characters per word for timing
        timer = setInterval(() => {
            setCurrentChunkIndex((prevIndex) => {
            if (prevIndex >= wordChunks.length - 1) {
                clearInterval(timer);
                return prevIndex;
            }
            return prevIndex + 1;
            });
        }, interval);
        }

        return () => {
        if (timer) clearInterval(timer);
        };
    }, [wordsPerMinute, wordChunks.length, isPaused, currentChunkIndex]);


    return (
        <div className="centerContainer" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
        }}>
        <CounterDisplay count={wordsPerMinute} fontSize="16px" />
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
