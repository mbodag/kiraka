"use client";
import React, { useEffect, useState } from "react";
import { useSelectedText } from "../../contexts/SelectedTextContext"; // Adjust path if necessary
import HighlightableText from "./highlightable-text";
import CounterDisplay from "./counter-display";
import "@/app/globals.css";

const Mode1Display = () => {
  const [wordsPerMinute, setWordsPerMinute] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [textColor, setTextColor] = useState("black");
  const [shortStory, setShortStory] = useState("");
  const [summary, setSummary] = useState("");
  const { selectedTextId } = useSelectedText(); // Use the ID from context

  useEffect(() => {
    const fetchTextById = async (textId: number) => {
      try {
        const response = await fetch(`/api/texts/${textId}`);
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

  // Other functions and event handlers...

  // Example toggle functions for background and text colors
  const toggleBackgroundColor = () => {
    setBackgroundColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };

  const toggleTextColor = () => {
    setTextColor((prevColor) => (prevColor === "white" ? "black" : "white"));
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

  // Example fetch data function (adjust as needed)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/texts/random");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
const data = await response.json();      
setShortStory(data.text_content);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);


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
          />
        </div>
        <button className="fancyButton" onClick={handleGetSummary}>
          Get Summary
        </button>
        {summary && <p>Summary: {summary}</p>}
      </div>
    </div>
  );
};

export default Mode1Display;