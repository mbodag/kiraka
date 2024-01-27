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
    .filter((paragraph: string) => paragraph.trim() !== "");
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setWordIndex((prevIndex) => {
        const currentParagraph = paragraphs[paragraphIndex].split(" ");
        if (prevIndex + 1 < currentParagraph.length) {
          return prevIndex + 1;
        } else {
          // Move to the next paragraph or start over if the last paragraph is reached
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
      {paragraphs.map((paragraph: string, index: number) => (
        <p
          key={index}
          style={{ margin: "5px 0", padding: "0", fontSize: fontSize }}
        >
          {paragraph.split(" ").map((word, wordIndexInParagraph) => (
            <span
              key={wordIndexInParagraph}
              className={
                paragraphIndex === index && wordIndexInParagraph === wordIndex
                  ? "highlighted"
                  : ""
              }
            >
              {word}{" "}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
};

export default HighlightableText;
