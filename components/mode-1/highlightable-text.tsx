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
  const paragraphs = text.split("\n").filter(paragraph => paragraph.trim() !== "");

  const keywords = [
    "work-life balance",
    "personal well-being",
    "professional success",
    "stress and burnout",
    "time management",
    "fulfilling life",
    "hobbies",
    "quality time",
    "relaxation",
    "flexible working conditions",
    "mental health",
    "productive work environment",
    "job satisfaction",
    "career progression",
    "long-term happiness"
  ];

  // Function to break text into words and keywords, considering punctuation
  const breakIntoWordsAndKeywords = (paragraph: string) => {
    // Extended regex (regular expression) to include common punctuation and brackets
    const regex = new RegExp(
      `(${keywords.join('|')})(?=[.,;!?()\\[\\]{}\"'”“’‘\\s]|$)|\\S+`, 'g'
    );
    return paragraph.match(regex) || [];
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedKeywordIndices, setHighlightedKeywordIndices] = useState(new Set<number>());

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "R" || event.key === "r") {
        setCurrentIndex(0);
        setHighlightedKeywordIndices(new Set());
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => {
        let wordCounter = 0;
        paragraphs.forEach(paragraph => {
          const words = breakIntoWordsAndKeywords(paragraph);
          words.forEach((word, idx) => {
            if (keywords.includes(word) && wordCounter + idx === prevIndex) {
              setHighlightedKeywordIndices(prevSet => new Set(prevSet.add(prevIndex)));
            }
          });
          wordCounter += words.length;
        });
        return prevIndex + 1;
      });
    }, highlightInterval);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [highlightInterval]);

  return (
    <div className="highlightable-text-container">
      {paragraphs.map((paragraph, pIndex) => {
        const wordsAndKeywords = breakIntoWordsAndKeywords(paragraph);
        let globalIndex = paragraphs.slice(0, pIndex).flatMap(p => breakIntoWordsAndKeywords(p)).length;

        return (
          <p key={pIndex} style={{ margin: "5px 0", padding: "0", fontSize: fontSize }}>
            {wordsAndKeywords.map((wordOrKeyword, wIndex) => {
              const isHighlighted = globalIndex === currentIndex;
              const isKeyword = keywords.includes(wordOrKeyword);
              const className = isHighlighted
                ? isKeyword ? "highlighted keyword-highlighted" : "bold highlighted"
                : highlightedKeywordIndices.has(globalIndex) && isKeyword ? "keyword-highlighted" : "";
              globalIndex++;

              return (
                <span key={wIndex} className={className}>
                  {wordOrKeyword}{" "}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
};

export default HighlightableText;
