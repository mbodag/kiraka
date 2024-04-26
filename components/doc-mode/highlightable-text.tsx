import React, { useState, useEffect, useCallback, useMemo } from "react";

interface HighlightableTextProps {
  text: string;
  highlightInterval?: number;
  fontSize?: string;
  onFinish?: () => void;
  className?: string;
  onRestartTimeChange: (newRestartTime: number) => void;
  onReadingTimeChange: (newReadingTime: number) => void;
  fontFamily?: string;
  hyperBold?: boolean;
  pointer? : boolean;
  restartText?: boolean;
  pointerSize?: number;

}

const HighlightableText: React.FC<HighlightableTextProps> = ({
  text,
  highlightInterval = 1000,
  fontSize = "16px",
  onFinish = () => {},
  className = "",
  onRestartTimeChange,
  onReadingTimeChange,
  fontFamily = "monospace-jetbrains-mono",
  hyperBold = false,
  pointer = false,
  restartText = false,
  pointerSize = 1,
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
  const [isPaused, setIsPaused] = useState(true); // Highlighting deactivated by default
  const [isPausePlayActive, setIsPausePlayActive] = useState(false);

  const [submittedWPM, setSubmittedWPM] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [restartTime, setRestartTime] = useState<number>(0);

  const restartAction = () => {
    setIsPaused(true); // Pause the display
    setRestartTime(0); // Reset the restart time
    setReadingTime(0); // Reset the reading time
    setCurrentIndex(0); // Reset the current index
    setCountdown(null); // Reset the countdown


};

useEffect(() => {
    if (restartText){
        restartAction();
        console.log('RESTARTING HERE')}  // Then call the restart action
  }, [text, restartText]);

  const togglePausePlayAction = () => {
    if (isPaused) {
        setCountdown(3); // Start a 3-second countdown
    } else {
        setIsPaused(true);
        const currentTime = performance.now();
        const deltaTime = currentTime - restartTime;
        setReadingTime(readingTime + deltaTime);
        onReadingTimeChange(readingTime + deltaTime);
         // Pause immediately without a countdown
    }
    setIsPausePlayActive(true); // Set active to true
    setTimeout(() => setIsPausePlayActive(false), 100); // Reset after 100ms
};
  useEffect(() => {
    let timerId: NodeJS.Timeout;
      if (countdown !== null && countdown > 0) {
        // Set a timer to decrement the countdown every second
        timerId = setTimeout(() => {
            setCountdown(countdown - 1);
          }, 1000);
        } else if (countdown === 0) {
            // Display "Go!" for a brief moment before resetting
            timerId = setTimeout(() => {
                setIsPaused(false);  // Ensure the display starts if it was paused
                setCountdown(null);  // Reset countdown to not counting down state
            }, 500);  // Allow 1 second for "Go!" to be visible
              setRestartTime(performance.now());
              onRestartTimeChange(performance.now());
        }

        return () => {
          clearTimeout(timerId); // Clean up the timer
        };
      }, [countdown]);

  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "R" || event.key === "r") {
        setCurrentIndex(0);
      } else if (event.key === " ") {
        // Listen for the spacebar
        if (countdown !== null) {}
        event.preventDefault(); // Prevent the default spacebar action (e.g., page scrolling)
        togglePausePlayAction(); // Call the toggle function
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
              }
            });
            wordCounter += words.length;
          });
          if (prevIndex === wordCounter - 1) {
            setCurrentIndex(0);
          }
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
      {/* Countdown Display */}
      {countdown !== null && (
                    <div className='modal-content' style={{
                    fontSize: '100px',
                    width: '15%',
                    height: '15%',
                    color: 'rgb(200, 0, 0)',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '0px 10px',
                    borderRadius: '10px',
                    }}>
                    {countdown > 0 ? countdown : 'Go!'}
                    </div>
                )}
      {paragraphs.map((paragraph, pIndex) => {
        const wordsAndKeywords = breakIntoWordsAndKeywords(paragraph);
        let globalIndex = paragraphs
          .slice(0, pIndex)
          .flatMap((p) => breakIntoWordsAndKeywords(p)).length;

        return (
          <p
            key={pIndex}
            style={{ margin: "5px 0", padding: "0", fontSize: fontSize, fontFamily: "arial"}}
            // className= "monospace-roboto-mono"
          >
            {wordsAndKeywords.map((wordOrKeyword: string, wIndex: number) => {
                const isHighlighted = Math.abs(globalIndex - currentIndex) < pointerSize;
              const className = isHighlighted && pointer
                ? isPaused ? "highlighted blur" : "highlighted"
                : isPaused ? "blur" :"";
              globalIndex++;
              const cleanWord = wordOrKeyword.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
              return (
                <span key={`${pIndex}-${wIndex}`}>
                  <span className={className}>
                    {hyperBold ? (
                      <>
                        <span style={{ fontWeight: "bold" }}>
                          {wordOrKeyword.slice(0, Math.floor(( cleanWord.length) / 2))}
                        </span>
                        <span>{wordOrKeyword.slice(Math.floor(( cleanWord.length) / 2))}</span>
                      </>
                    ): <span>{wordOrKeyword}</span>}
                  </span>
                  <span className={pointerSize > 1 ? className: ""}> </span>
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
