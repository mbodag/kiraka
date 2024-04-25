"use client";
import React, { useEffect, useState } from "react";
import { useSelectedText } from "../../contexts/SelectedTextContext"; // Adjust path if necessary
import HighlightableText from "./highlightable-text";
import CounterDisplay from "./counter-display";
import "@/app/globals.css";
import  { usePracticeID } from '@/contexts/PracticeIDContext';
import { useAuth } from "@clerk/nextjs";

const Mode1Display = () => {
  const [wordsPerMinute, setWordsPerMinute] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [textColor, setTextColor] = useState("black");
  const [shortStory, setShortStory] = useState("");
  const [summary, setSummary] = useState("");
  const { selectedTextId } = useSelectedText(); // Use the ID from context
  const { userId } = useAuth();
  const [pastWPM, setPastWPM] = useState<number[]>([300]);
  
  useEffect(() => {
    const fetchTextById = async (textId: number) => {
      try {
        const response = await fetch(`/api/texts/${textId}?user_id=${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setShortStory(data.text_content);
      } catch (error) {
        console.error('Error fetching text:', error);
      }
    };

    if (selectedTextId) {
      fetchTextById(selectedTextId);
    }
  }, [selectedTextId]);

  useEffect(() => {
    const fetchPastWPM = async () => {
      try {
        const response = await fetch(`/api/avgWPM?user_id=${userId}&mode=0`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPastWPM(data.avgWPMs);
      } catch (error) {
        console.error('Error fetching text:', error);
      }
    };
      fetchPastWPM();

  }, []);


  // Example toggle functions for background and text colors
  const toggleBackgroundColor = () => {
    setBackgroundColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };

  const toggleTextColor = () => {
    setTextColor((prevColor) => (prevColor === "white" ? "black" : "white"));
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
                  mode: 0,
                  chunks_data: [],
              }),
          });
          if (response.status === 207) {
              console.log(response);
          }
          if (response.ok) {
              const data = await response.json();
              setPracticeId(data.practice_id);
              window.location.href = "/quiz";

          } else {
              // Handle non-OK responses
              console.error('Error submitting reading speed');
          }
      } catch (error) {
          console.error('Error in submitReadingSpeed:', error);
      }
  };
  
  // Other effect hooks...
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setWordsPerMinute((prevWPM) => Math.min(prevWPM + 20, 1500)); // Increase WPM with upper bound
      } else if (event.key === "ArrowLeft") {
        setWordsPerMinute((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease WPM with lower bound
      } else if (event.key === "b" || event.key === "B") {
        // When the "B" or "b" key is pressed, toggle the background color
        toggleBackgroundColor();
      } else if (event.key === "t" || event.key === "T") {
        // When the "H" or "h" key is pressed, toggle the text color
        toggleTextColor();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);


  // Example handleGetSummary function (adjust as needed)
  const handleGetSummary = async () => {
    const inputText = shortStory;

    try {
      const response = await fetch("api/texts/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error getting summary:", error);
    }
  }

  // Component return
  return (
    <div className="centerContainer">
      <CounterDisplay count={wordsPerMinute} fontSize="16px" />
      <div className="textAndButtonContainer">
        <div
          className="monospaced"
          style={{
            color: textColor,
            backgroundColor,
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            borderRadius: "10px",
            margin: "10px",
          }}
        >
          <HighlightableText
            text={shortStory}
            highlightInterval={60000 / wordsPerMinute}
            onFinish={() => {submitReadingSpeed(wordsPerMinute)}}
          />
        </div>
        {/* <button className="GreenButton" onClick={handleGetSummary}>
          Get Summary
        </button>
        {summary && <p>Summary: {summary}</p>} */}
      </div>
    </div>
  );
};

export default Mode1Display;