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
  const paragraphs = text
    .split("\n")
    .filter(paragraph => paragraph.trim() !== "");

  const keywords = ["Deep Reinforcement Learning", "Evolutionary Algorithms", "EAs", "PGA-MAP Elites"];

  // Function to break text into words and keywords
  const breakIntoWordsAndKeywords = (paragraph: string) => {
    const regex = new RegExp(`(${keywords.join('|')})|\\S+`, 'g');
    return paragraph.match(regex) || [];
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [keywordsHighlighted, setKeywordsHighlighted] = useState(new Set<string>());

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "R" || event.key === "r") {
        setCurrentIndex(0);
        setKeywordsHighlighted(new Set());
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => {
        // Check if the current index corresponds to the end of a keyword
        let currentText = '';
        let wordCounter = 0;
        for (const paragraph of paragraphs) {
          const words = breakIntoWordsAndKeywords(paragraph);
          for (const word of words) {
            if (wordCounter === prevIndex && keywords.includes(word)) {
              setKeywordsHighlighted(prevSet => new Set(prevSet.add(word)));
            }
            wordCounter++;
          }
        }

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
        return (
          <p key={pIndex} style={{ margin: "5px 0", padding: "0", fontSize: fontSize }}>
            {wordsAndKeywords.map((wordOrKeyword, wIndex) => {
              const globalIndex = paragraphs
                .slice(0, pIndex)
                .flatMap(paragraph => breakIntoWordsAndKeywords(paragraph))
                .concat(wordsAndKeywords.slice(0, wIndex)).length;

              const isHighlighted = currentIndex === globalIndex;
              const isKeyword = keywords.includes(wordOrKeyword);
              const className = isHighlighted
                ? isKeyword ? "highlighted keyword-highlighted" : "highlighted"
                : keywordsHighlighted.has(wordOrKeyword) ? "keyword-highlighted" : "";

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
