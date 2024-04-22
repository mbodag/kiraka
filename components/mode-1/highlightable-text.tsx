import React, { useState, useEffect, useCallback, useMemo } from "react";

interface HighlightableTextProps {
  text: string;
  highlightInterval?: number;
  fontSize?: string;
  fontFamily?: string;
  bionicReading?: boolean;
}

const HighlightableText: React.FC<HighlightableTextProps> = ({
  text,
  highlightInterval = 1000,
  fontSize = "14px",
  fontFamily = "monospace",
  bionicReading = false,
}) => {
  const paragraphs = text
    .split("\n")
    .filter((paragraph) => paragraph.trim() !== "");

  const keywords = useMemo(
    () => [
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
      "long-term happiness",
    ],
    []
  );

  const breakIntoWordsAndKeywords = useCallback(
    (paragraph: string) => {
      // Function to break text into words and keywords, considering punctuation
      const breakIntoWordsAndKeywordsInner = (paragraph: string): string[] => {
        // Extended regex (regular expression) to include common punctuation and brackets
        const regex = new RegExp(
          `(${keywords.join("|")})(?=[\\s]|$)|\\S+`,
          "g"
        );
        return paragraph.match(regex) || [];
      };

      return breakIntoWordsAndKeywordsInner(paragraph); // Call the inner function and return its result
    },
    [keywords]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedKeywordIndices, setHighlightedKeywordIndices] = useState(
    new Set<number>()
  );
  const [isPaused, setIsPaused] = useState(true); // Highlighting deactivated by default

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "R" || event.key === "r") {
        setCurrentIndex(0);
        setHighlightedKeywordIndices(new Set());
      } else if (event.key === " ") {
        // Listen for the spacebar
        event.preventDefault(); // Prevent the default spacebar action (e.g., page scrolling)
        setIsPaused((prevIsPaused) => !prevIsPaused); // Toggle pause/start
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    let intervalId: NodeJS.Timeout | null = null;

    if (!isPaused) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          let wordCounter = 0;
          paragraphs.forEach((paragraph) => {
            const words = breakIntoWordsAndKeywords(paragraph);
            words.forEach((word: string, idx: number) => {
              if (keywords.includes(word) && wordCounter + idx === prevIndex) {
                setHighlightedKeywordIndices(
                  (prevSet) => new Set(prevSet.add(prevIndex))
                );
              }
            });
            wordCounter += words.length;
          });
          return prevIndex + 1;
        });
      }, highlightInterval);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    highlightInterval,
    isPaused,
    breakIntoWordsAndKeywords,
    keywords,
    paragraphs,
  ]); // Add isPaused to the dependency array

  return (
    <div className="highlightable-text-container">
      {paragraphs.map((paragraph, pIndex) => {
        const wordsAndKeywords = breakIntoWordsAndKeywords(paragraph);
        let globalIndex = paragraphs
          .slice(0, pIndex)
          .flatMap((p) => breakIntoWordsAndKeywords(p)).length;

        return (
          <p
            key={pIndex}
            style={{ margin: "5px 0", padding: "0", fontSize: fontSize, fontFamily: fontFamily}}
          >
            {wordsAndKeywords.map((wordOrKeyword: string, wIndex: number) => {
              const isHighlighted = globalIndex === currentIndex;
              const isKeyword = keywords.includes(wordOrKeyword);
              const className = isHighlighted
                ? isKeyword
                  ? "highlighted keyword-highlighted"
                  : "bold highlighted"
                : highlightedKeywordIndices.has(globalIndex) && isKeyword
                ? "keyword-highlighted"
                : "";
              globalIndex++;
              const cleanWord = wordOrKeyword.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
              return (
                <span key={`${pIndex}-${wIndex}`}>
                  <span className={className}>
                    {bionicReading ? (
                      <>
                        <span style={{ fontWeight: "bold" }}>
                          {wordOrKeyword.slice(0, Math.floor((1 + cleanWord.length) / 2))}
                        </span>
                        <span>{wordOrKeyword.slice(Math.floor((1 + cleanWord.length) / 2))} </span>
                      </>
                    ): <span>{wordOrKeyword} </span>}
                  </span>
                  <span> </span>
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
