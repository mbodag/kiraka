"use client";
import { useEffect, useState } from "react";
import HighlightableText from "./highlightable-text";
import CounterDisplay from "./counter-display";
import "@/app/globals.css";

const Mode1Display = () => {
  // const shortStory = `In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. The relentless pursuit of productivity often leads to increased stress and a higher risk of burnout. It's crucial to set clear boundaries between work responsibilities and personal life. Effective time management and task prioritization are keys to reducing work-related pressure. These strategies allow individuals to enjoy a more fulfilling life both inside and outside the workplace.

  // Engaging in hobbies, pursuing personal interests, and spending quality time with family and friends are essential components of a well-rounded life. These activities offer opportunities for relaxation and personal growth, contributing to overall happiness and satisfaction.

  // On the professional front, employers play a significant role in promoting a healthy work environment. This includes offering flexible working conditions, encouraging regular breaks, and recognizing the importance of mental health. Supportive workplace cultures that value employee well-being lead to increased productivity, greater job satisfaction, and lower turnover rates.

  // Ultimately, achieving a balance between work and life leads to improved mental and physical health, heightened job performance, and a richer, more rewarding life experience. It's about finding a rhythm that allows for both career progression and personal contentment, ensuring long-term happiness and success.`

  const [wordsPerMinute, setWordsPerMinute] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState("white"); // Initialise background color to 'white'
  const [textColor, setTextColor] = useState("white"); // Initialise text color to 'white'
  const [summary, setSummary] = useState("");
  const [shortStory, setShortStory] =
    useState(`In today's fast-paced world, striking a healthy work-life balance is not just desirable, but essential for personal well-being and professional success. The relentless pursuit of productivity often leads to increased stress and a higher risk of burnout. It's crucial to set clear boundaries between work responsibilities and personal life. Effective time management and task prioritization are keys to reducing work-related pressure. These strategies allow individuals to enjoy a more fulfilling life both inside and outside the workplace.

  Engaging in hobbies, pursuing personal interests, and spending quality time with family and friends are essential components of a well-rounded life. These activities offer opportunities for relaxation and personal growth, contributing to overall happiness and satisfaction.
  
  On the professional front, employers play a significant role in promoting a healthy work environment. This includes offering flexible working conditions, encouraging regular breaks, and recognizing the importance of mental health. Supportive workplace cultures that value employee well-being lead to increased productivity, greater job satisfaction, and lower turnover rates.
  
  Ultimately, achieving a balance between work and life leads to improved mental and physical health, heightened job performance, and a richer, more rewarding life experience. It's about finding a rhythm that allows for both career progression and personal contentment, ensuring long-term happiness and success.`);

  const toggleBackgroundColor = () => {
    // Toggle the background color between 'white' and 'black'
    setBackgroundColor((prevColor) =>
      prevColor === "white" ? "black" : "white"
    );
  };

  const toggleTextColor = () => {
    // Toggle the text color between 'black' and 'white'
    setTextColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };

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

  const handleGetSummary = async () => {
    const inputText = shortStory;

    try {
      const response = await fetch("https://0231-2a0c-5bc0-88-113-3d99-f3ed-984b-b50f.ngrok-free.app/api/texts/summarize", {
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
  };

  const fetchData = async () => {
    try {
      const response = await fetch("https://0231-2a0c-5bc0-88-113-3d99-f3ed-984b-b50f.ngrok-free.app/api/texts/summarize", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data.text_content);
    } catch (error) {
      console.error("Error getting summary:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://0231-2a0c-5bc0-88-113-3d99-f3ed-984b-b50f.ngrok-free.app/api/texts/random");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
console.log(response);       
const data = await response.json();
console.log(data);        
setShortStory(data.text_content);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="centerContainer">
      <CounterDisplay count={wordsPerMinute} fontSize="16px" />
      <div className="textAndButtonContainer">
        <div
          className="monospaced"
          style={{
            color: textColor, // Apply the textColor state variable here
            backgroundColor, // Use the state variable for background color
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
