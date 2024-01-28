import React, { useState, useEffect } from "react";

interface HighlightableTextProps {
  text: string;
  highlightInterval?: number;
  fontSize?: string;
}

const HighlightableText: React.FC<HighlightableTextProps> = ({
  text,
  highlightInterval = 1000,
  fontSize = "16px",
}) => {
  // Splitting the text into paragraphs and filtering out empty ones
  const paragraphs = text
    .split("\n")
    .filter((paragraph) => paragraph.trim() !== "");

  // State to track the current paragraph and word indices
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  // Keywords to be highlighted in a different color
  const keywords = ["Deep Reinforcement Learning", "DRL", "Evolutionary Algorithms", "EAs", "PGA-MAP Elites"];

  // Function to check if a word is a keyword
  const isKeyword = (word: string) => keywords.includes(word);
  

  // Setting an interval to move the highlight through the text
  useEffect(() => {
    const intervalId = setInterval(() => {
      setWordIndex((prevIndex) => {
        const currentParagraph = paragraphs[paragraphIndex].split(" ");
        if (prevIndex + 1 < currentParagraph.length) {
          return prevIndex + 1;
        } else {
          setParagraphIndex((prevParagraphIndex) =>
            prevParagraphIndex + 1 < paragraphs.length
              ? prevParagraphIndex + 1
              : 0
          );
          return 0;
        }
      });
    }, highlightInterval);

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [paragraphs, paragraphIndex, highlightInterval]);

  return (
    <div className="highlightable-text-container">
      {paragraphs.map((paragraph, index) => (
        <p key={index} style={{ margin: "5px 0", padding: "0", fontSize: fontSize }}>
          {paragraph.split(" ").map((word, wordIndexInParagraph) => {
            const isHighlighted = paragraphIndex === index && wordIndexInParagraph === wordIndex;
            const isKey = isKeyword(word);
            return (
              <span
                key={wordIndexInParagraph}
                className={
                  isHighlighted && isKey
                    ? "highlighted keyword-highlighted"
                    : isHighlighted
                    ? "highlighted"
                    : isKey
                    ? "keyword-highlighted"
                    : ""
                }
              >
                {word}{" "}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
};

export default HighlightableText;