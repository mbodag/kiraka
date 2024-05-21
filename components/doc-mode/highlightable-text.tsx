import React, { useState, useEffect, useCallback, useMemo } from "react";

interface HighlightableTextProps {
  text: string;
  highlightInterval?: number;
  fontSize?: string;
  className?: string;
  onStartTimeChange: (newRestartTime: number) => void;
  fontFamily?: string;
  hyperBold?: boolean;
  pointer? : boolean;
  restartText?: boolean;
  pointerSize?: number;
  fixationDegree?: number;
  pointerColour?: string;
  backgroundClass?: string;
  textColorClass?: string;
  currentIndex: number;
  setCurrentIndex: (index: number | ((prevIndex: number) => number)) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  countdown: number | null;
  setCountdown: (countdown: number | null) => void;
  restartAction: () => void;
}

const HighlightableText: React.FC<HighlightableTextProps> = ({
  text,
  highlightInterval = 1000,
  fontSize = "16px",
  onStartTimeChange,
  hyperBold = false,
  pointer = false,
  restartText = false,
  pointerSize = 1,
  fixationDegree = 1,
  pointerColour = "cyan",
  backgroundClass = "flash-mode-display-bg-color",
  textColorClass = "text-color-black",
  currentIndex,
  setCurrentIndex,
  isPaused,
  setIsPaused,
  countdown,
  setCountdown,
  restartAction,
}) => {
  const paragraphs = text
    .split("\n")
    .filter((paragraph) => paragraph.trim() !== "");

  const keywords = useMemo(
    () => [
      "wordthatdoesnotexisttonottriggerhighlight",
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

  const [submittedWPM, setSubmittedWPM] = useState<boolean>(false);


  useEffect(() => {
    if (restartText){
        restartAction();
        console.log('RESTARTING HERE')}
  }, [text, restartText]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      // Set a timer to decrement the countdown every 500ms
      timerId = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 500);
      } else if (countdown === 0) {
          // Display "Go!" for a brief moment before resetting
          timerId = setTimeout(() => {
              setIsPaused(false);  // Ensure the display starts if it was paused
              setCountdown(null);  // Reset countdown to not counting down state
          }, 300);  // Allow 300ms for "Go!" to be visible
          onStartTimeChange(performance.now());
      }

    return () => {
      clearTimeout(timerId); // Clean up the timer
    };
  }, [countdown]);

  
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (!isPaused) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex: number) => {
          let wordCounter = 0;
          paragraphs.forEach((paragraph) => {
            const words = breakIntoWordsAndKeywords(paragraph);
            words.forEach((word: string, idx: number) => {
              if (keywords.includes(word) && wordCounter + idx === prevIndex) {
              }
            });
            wordCounter += words.length;
          });
          // Ensure the index keeps updating
          if (prevIndex >= wordCounter - 1) {
            console.log('Reached the end of text');
            return prevIndex; // Stay on the last word
          }
          return prevIndex + 1;
        });
      }, highlightInterval);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    highlightInterval,
    isPaused,
    breakIntoWordsAndKeywords,
    keywords,
    paragraphs,
  ]); // Add isPaused to the dependency array

  const renderWithHyperBold = (wordOrKeyword: any, isHighlighted: boolean) => {
    if (!hyperBold) {
        return <span>{wordOrKeyword}</span>;
    }

    // Split the word by hyphens to handle composite words
    const parts = wordOrKeyword.split(/(\-)/g); // Include hyphens in the result to keep them in the text

    return (
        <>
            {parts.map((part: any, index: any) => {
                // Apply hyperbold to each part separately
                if (part !== '-') {
                    const midIndex = Math.floor(part.length / 2) + (fixationDegree - 2);
                    if (isHighlighted && pointer) {
                      return (
                        <React.Fragment key={index}>
                            <span style={{ fontWeight: 'bold', color: 'black' }}>{part.slice(0, midIndex)}</span>
                            <span style={{ color: 'rgb(120, 120, 120)' }}>{part.slice(midIndex)}</span>
                        </React.Fragment>
                      );
                    } else {
                        if (backgroundClass === "bg-color-black") {
                            if (textColorClass === "text-color-black") {
                                return (
                                    <React.Fragment key={index}>
                                        <span style={{ fontWeight: 'bold', color: 'black' }}>{part.slice(0, midIndex)}</span>
                                        <span style={{ color: 'black' }}>{part.slice(midIndex)}</span>
                                    </React.Fragment>
                                );
                            } else {
                                return (
                                    <React.Fragment key={index}>
                                        <span style={{ fontWeight: 'bold' }} className="flash-mode-display-text-color">{part.slice(0, midIndex)}</span>
                                        <span style={{ color: 'rgb(150, 150, 150)' }}>{part.slice(midIndex)}</span>
                                    </React.Fragment>
                                );
                            }
                        } else {
                            if (textColorClass === "flash-mode-display-text-color") {
                                return (
                                    <React.Fragment key={index}>
                                        <span style={{ fontWeight: 'bold' }} className="flash-mode-display-text-color">{part.slice(0, midIndex)}</span>
                                        <span className="flash-mode-display-text-color">{part.slice(midIndex)}</span>
                                    </React.Fragment>
                                );
                            } else {
                                return (
                                    <React.Fragment key={index}>
                                        <span style={{ fontWeight: 'bold', color: 'black' }}>{part.slice(0, midIndex)}</span>
                                        <span style={{ color: 'rgb(120, 120, 120)' }}>{part.slice(midIndex)}</span>
                                    </React.Fragment>
                                );
                            }
                        }
                    }
                }
                return <span key={index}>{part}</span>; // Return hyphens as normal
            })}
        </>
    );
};

  const colorToRgba = (colour:string, opacity:number) => {
    const colours:any = {
      cyan: '150, 255, 255',
      yellow: '255, 255, 120',
      orange: '255, 185, 120',
      green: '160, 255, 160'
    };
    return `rgba(${colours[colour] || '0, 0, 0'}, ${opacity})`;
  }

  return (
    <div className="highlightable-text-container" style={{fontWeight: '200'}}>
      {/* Countdown Display */}
      {countdown !== null && (
          <div className='modal-content p-2' style={{
          fontSize: '80px',
          fontWeight: '300',
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
          <p key={pIndex} className="monospace-jetbrains-mono" style={{ margin: "5px 0", padding: "0", fontSize: fontSize }}>
            {wordsAndKeywords.map((wordOrKeyword, wIndex) => {
                const isHighlighted = Math.abs(globalIndex - currentIndex) < pointerSize;
                // const getTextClassName = (isHighlighted: boolean, pointer: boolean, isPaused: boolean) => {
                //   if (isHighlighted && pointer) {
                //     return isPaused ? `${backgroundClass === "bg-color-black" ? "flash-mode-display-text-color" : "text-black"} blur` : `${backgroundClass === "bg-color-black" ? "flash-mode-display-text-color" : "text-black"}`;
                //   }
                //   return isPaused ? "blur" : "";
                // };
                // const className = getTextClassName(isHighlighted, pointer, isPaused);

                const className = isHighlighted && pointer
                    ? isPaused ? "text-black blur" : "text-black"
                    : isPaused ? "blur" : "";
                const style = isHighlighted && pointer
                    ? { backgroundColor: colorToRgba(pointerColour, 0.9) } // Adjust the 0.5 to your desired opacity
                    : {};
                globalIndex++;

                // Check if it is the last word in the highlighted segment
                const nextIsHighlighted = Math.abs(globalIndex - currentIndex) < pointerSize;
                const isLastInSegment = isHighlighted && !nextIsHighlighted;

                return ( 
                    <span key={`${pIndex}-${wIndex}`} className={className}>
                        <span style={style}>
                          {renderWithHyperBold(wordOrKeyword, isHighlighted)}
                        </span>
                        {(!isLastInSegment || !isHighlighted) && (
                          <span className={pointerSize > 1 ? className : " "} style={style}> </span>
                        )}
                        {/* Ensure a non-highlighted space is added */}
                        <span className={pointerSize > 1 ? className : " "} style={{}}> </span>
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
