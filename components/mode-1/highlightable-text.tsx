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
  const [isPaused, setIsPaused] = useState(true); // Highlighting deactivated by default

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "R" || event.key === "r") {
        setCurrentIndex(0);
        setHighlightedKeywordIndices(new Set());
      } else if (event.key === " ") { // Listen for the spacebar
      event.preventDefault(); // Prevent the default spacebar action (e.g., page scrolling)
      setIsPaused(prevIsPaused => !prevIsPaused); // Toggle pause/start
    }
  };

    window.addEventListener("keydown", handleKeyPress);

    let intervalId: NodeJS.Timeout | null = null;

  if (!isPaused) {
    intervalId = setInterval(() => {
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
  } else if (intervalId) {
    clearInterval(intervalId);
  }

  return () => {
    if (intervalId) clearInterval(intervalId);
    window.removeEventListener("keydown", handleKeyPress);
  };
}, [highlightInterval, isPaused]); // Add isPaused to the dependency array

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





// import React, { useState, useEffect } from "react";

// interface HighlightableTextProps {
//   text: string;
//   highlightInterval?: number; // Base interval in milliseconds
//   fontSize?: string;
// }

// const HighlightableText: React.FC<HighlightableTextProps> = ({
//   text,
//   highlightInterval = 1000, // Default to 1000 milliseconds
//   fontSize = "16px",
// }) => {
//   const paragraphs = text.split("\n").filter(paragraph => paragraph.trim() !== "");

//   const keywords = [
//     "work-life balance",
//     "personal well-being",
//     "professional success",
//     "stress and burnout",
//     "time management",
//     "fulfilling life",
//     "hobbies",
//     "quality time",
//     "relaxation",
//     "flexible working conditions",
//     "mental health",
//     "productive work environment",
//     "job satisfaction",
//     "career progression",
//     "long-term happiness",
//   ];

//   const breakIntoWordsAndKeywords = (paragraph: string) => {
//     const regex = new RegExp(
//       `(${keywords.join('|')})(?=[.,;!?()\\[\\]{}\"'”“’‘\\s]|$)|\\S+`, 'g'
//     );
//     return paragraph.match(regex) || [];
//   };

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [highlightedKeywordIndices, setHighlightedKeywordIndices] = useState(new Set<number>());
//   const [isPaused, setIsPaused] = useState(true); // Start with highlighting paused

//   useEffect(() => {
//     const handleKeyPress = (event: KeyboardEvent) => {
//       if (event.key === "R" || event.key === "r") {
//         setCurrentIndex(0);
//         setHighlightedKeywordIndices(new Set());
//       } else if (event.key === " ") {
//         event.preventDefault(); // Prevent the default spacebar action (e.g., page scrolling)
//         setIsPaused(prevIsPaused => !prevIsPaused); // Toggle pause/start
//       }
//     };

//     window.addEventListener("keydown", handleKeyPress);

//     return () => window.removeEventListener("keydown", handleKeyPress);
//   }, []);

//   useEffect(() => {
//     if (isPaused) return;

//     const allWords = paragraphs.flatMap(p => breakIntoWordsAndKeywords(p));
//     if (currentIndex >= allWords.length) return; // Stop if at the end of text

//     const currentWord = allWords[currentIndex];
//     const wordLength = currentWord.length;
//     const averageWordLength = 5; // Assume average English word length is 5 characters
//     const delay = highlightInterval * (wordLength / averageWordLength); // Adjust delay based on word length

//     const timeoutId = setTimeout(() => {
//       setCurrentIndex(prevIndex => prevIndex + 1);
//       // Check if the current word is a keyword and highlight it
//       if (keywords.includes(currentWord)) {
//         setHighlightedKeywordIndices(prevSet => new Set(prevSet).add(currentIndex));
//       }
//     }, delay);

//     return () => clearTimeout(timeoutId);
//   }, [currentIndex, isPaused, paragraphs, highlightInterval, keywords]);

//   return (
//     <div className="highlightable-text-container" style={{ fontSize }}>
//       {paragraphs.map((paragraph, pIndex) => {
//         let globalIndex = 0; // Reset for each paragraph
//         const wordsAndKeywords = breakIntoWordsAndKeywords(paragraph);

//         return (
//           <p key={pIndex} style={{ margin: "5px 0", padding: "0" }}>
//             {wordsAndKeywords.map((wordOrKeyword, wIndex) => {
//               // Calculate the global index of the current word across all paragraphs
//               globalIndex = paragraphs.slice(0, pIndex).flatMap(p => breakIntoWordsAndKeywords(p)).length + wIndex;
//               const isHighlighted = currentIndex === globalIndex;
//               const isKeyword = keywords.includes(wordOrKeyword) && highlightedKeywordIndices.has(globalIndex);
//               const className = isHighlighted
//                 ? isKeyword ? "highlighted keyword-highlighted" : "bold highlighted"
//                 : isKeyword ? "keyword-highlighted" : "";

//               return (
//                 <span key={wIndex} className={className}>
//                   {wordOrKeyword}{" "}
//                 </span>
//               );
//             })}
//           </p>
//         );
//       })}
//     </div>
//   );
// };

// export default HighlightableText;

