"use client";
import { useEffect, useState } from "react";
import { useSelectedText } from "../../contexts/SelectedTextContext"; // Adjust path if necessary
import HighlightableText from "./highlightable-text";
import CounterDisplay from "./counter-display";
import "@/app/globals.css";

const Mode1Display = () => {
  const [wordsPerMinute, setWordsPerMinute] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [textColor, setTextColor] = useState("white");
  const [shortStory, setShortStory] = useState("");
  const [summary, setSummary] = useState("");
  const { selectedText } = useSelectedText();

  useEffect(() => {
    if (selectedText) {
      setShortStory(selectedText);
    }
  }, [selectedText]);

  // Other functions and event handlers...

  // Example toggle functions for background and text colors
  const toggleBackgroundColor = () => {
    setBackgroundColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };

  const toggleTextColor = () => {
    setTextColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };

  // Other effect hooks...

  // Example handleGetSummary function (adjust as needed)
  const handleGetSummary = async () => {
    // Function implementation...
  };

  // Example fetch data function (adjust as needed)
  useEffect(() => {
    // Function implementation...
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
