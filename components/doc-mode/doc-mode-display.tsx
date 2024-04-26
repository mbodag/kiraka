"use client";
import React, { useEffect, useState } from "react";
import { useSelectedText } from "../../contexts/SelectedTextContext"; // Adjust path if necessary
import HighlightableText from "./highlightable-text";
import CounterDisplay from "./counter-display";
import "@/app/globals.css";
import  { usePracticeID } from '@/contexts/PracticeIDContext';
import { useAuth } from "@clerk/nextjs";
import { RiSpace } from 'react-icons/ri';
import { ArrowLeftSquare, ArrowRightSquare } from 'lucide-react';
import { TbSquareLetterR } from 'react-icons/tb';
import Routes from '@/config/routes';


const Mode1Display = () => {
  const [wordsPerMinute, setWordsPerMinute] = useState(300);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [textColor, setTextColor] = useState("black");
  const [shortStory, setShortStory] = useState("");
  const [summary, setSummary] = useState("");
  const { selectedTextId, setSelectedTextId } = useSelectedText(); // Use the ID from context
  const { userId } = useAuth();
  const [pastWPM, setPastWPM] = useState<number[]>([300]);
  const [averageWPM, setAverageWPM] = useState<number | null>(null);
  const [showStartPopup, setShowStartPopup] = useState(true);
  const [showFinishPopup, setShowFinishPopup] = useState(false);
  const [restartTime, setRestartTime] = useState<number>(0);
  const [readingTime, setReadingTime] = useState<number>(0);
  const [hyperBold, sethyperBold] = useState(false);
  const [pointer, setPointer] = useState<boolean>(true);
  const [restartText, setRestartText] = useState<boolean>(false);
  const [pointerSize, setPointerSize] = useState(1)
  const [fontSize, setFontSize] = useState("16px");



  const gapBetweenSize = '15px';
  const gapEdgeSize = '20px';
  const divHeight = '200px';
  const plotHeight = '350px';

  const handleRestartTimeChange = (newRestartTime: number) => {
    setRestartTime(newRestartTime);
    setRestartText(false);
    console.log('Restart time:', newRestartTime)
  };
  const handleReadingTimeChange = (newRestartTime: number) => {
    setReadingTime(newRestartTime);
    console.log('Reading time:', newRestartTime)
  }; 
  
  useEffect(() => {
    const fetchTextById = async (textId: number) => {
      try {
        const response = await fetch(`/api/texts/${textId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setShortStory(data.text_content);
      } catch (error) {
        console.error('Error fetching text:', error);
      }
    };

    if (selectedTextId) {
      fetchTextById(selectedTextId);
    }
  }, [selectedTextId]);

  useEffect(() => {
    const fetchPastWPM = async () => {
      try {
        const response = await fetch(`/api/avgWPM?user_id=${userId}&mode=0`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPastWPM(data.avgWPMs);
      } catch (error) {
        console.error('Error fetching text:', error);
      }
    };
      fetchPastWPM();

  }, []);

    // Function to handle restart action
    const restartAction = () => {
      setAverageWPM(null); // Reset the averageWPM value
      setWordsPerMinute(300); // Reset the WPM value
      setRestartTime(0); // Reset the restart time
      setReadingTime(0); // Reset the reading time
      setShowFinishPopup(false); // Hide the finish popup
      setRestartText(true);

  };
  
  useEffect(() => {
      if (selectedTextId !== null) {
          restartAction();  // Then call the restart action
      }
  }, [selectedTextId]);
  // Example toggle functions for background and text colors
  const toggleBackgroundColor = () => {
    setBackgroundColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };



  const toggleTextColor = () => {
    setTextColor((prevColor) => (prevColor === "white" ? "black" : "white"));
  };

  const togglehyperBold = () => {
    sethyperBold((prevValue) => !prevValue);
  }
  const togglePointer = () => {
    setPointer((prevValue) => !prevValue);
  }

  const { practiceId, setPracticeId } = usePracticeID(); // Accessing the setPracticeId method from the global context

  // This function takes the average WPM and sends it to the backend.
  const submitReadingSpeed = async (averageWpm: number | null) => {
      if (averageWpm === null) {
          console.error('No average WPM available to submit.');
          return; // Optionally show an error to the user
      }
 
      
      try {
          const response = await fetch("/api/save-reading-speed", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  text_id: selectedTextId, 
                  user_id: userId,
                  wpm: averageWpm,
                  mode: 0,
                  chunks_data:{},
              }),
          });
          if (response.status === 207) {
              console.log(response);
          }
          if (response.ok) {
              const data = await response.json();
              setPracticeId(data.practice_id);
              window.location.href = "/quiz";

          } else {
              // Handle non-OK responses
              console.error('Error submitting reading speed');
          }
      } catch (error) {
          console.error('Error in submitReadingSpeed:', error);
      }
  };
  // Other effect hooks...
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showStartPopup || showFinishPopup) {
        return;
    }

      if (event.key === "ArrowRight") {
        setWordsPerMinute((prevWPM) => Math.min(prevWPM + 20, 1500)); // Increase WPM with upper bound
      } else if (event.key === "ArrowLeft") {
        setWordsPerMinute((prevWPM) => Math.max(prevWPM - 20, 50)); // Decrease WPM with lower bound
      } else if (event.key === "p" || event.key === "P") {
        togglePointer();
      } else if (event.key === "c" || event.key === "C") {
        toggleTextColor();
        toggleBackgroundColor();
      } else if (event.key === "h" || event.key === "H") {
        togglehyperBold();
      } else if (event.key === "b" || event.key === "B") {
        toggleBackgroundColor();
      } else if (event.key === "t" || event.key === "T") {
        toggleTextColor();
      } 
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [showStartPopup, showFinishPopup]);


  // Example handleGetSummary function (adjust as needed)
  const handleFinishText = async () => {
    
    // Calculate WPM
    const currentTime = performance.now();
    const deltaTime = currentTime - restartTime;
    const totalReadingTime = readingTime + deltaTime;
    const totalNumWords = shortStory.split(' ').length;
    const wpm = Math.round((totalNumWords / totalReadingTime) * 60000);
    setAverageWPM(wpm);
    console.log('Average WPM:', wpm);

    // Show the popup
    setShowFinishPopup(true);
    

  }
  const handleCloseStartPopup = () => {
    setShowStartPopup(false);
  }
  const handleCloseFinishPopupSendToQuiz = () => {
    submitReadingSpeed(averageWPM);
    window.location.href = Routes.QUIZ;
    
  }
  const handleCloseFinishPopupRestart = () => {
    setShowFinishPopup(false);
    restartAction();}

  // Component return
  return (
    <div>
      {/* Smaller divs on the right */}
      {
                    showStartPopup && (
                        <>
                        <div className="modal-backdrop" style={{ zIndex: 500}}></div>
                            <div className="modal-content" style={{ 
                                width: '30vw', 
                                display: 'flex', 
                                borderRadius: '20px' ,
                                flexDirection: 'column', // Stack children vertically
                                alignItems: 'center', // Center children horizontally
                                justifyContent: 'center', // Center children vertically
                                textAlign: 'center', // Ensures that text inside children elements is centered, if needed
                                }}> 
                                
                                    <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}>
                                        <p>In this mode, you have the freedom to see the whole text, and read at your own pace.</p>
                                        <p>A pointer is available for your benefit</p>
                                        <p><b>Y</b>ou <b>c</b>an <b>al</b>so <b>ena</b>ble <b>Hyp</b>er<b>Bold</b>ing, <b>whi</b>ch <b>bol</b>ds <b>t</b>he <b>begin</b>ning <b>o</b>f <b>t</b>he <b>wor</b>ds <b>y</b>ou <b>a</b>re <b>read</b>ing.
                                        <b>Th</b>is <b>hel</b>ps <b>so</b>me <b>peo</b>ple <b>foc</b>us <b>bet</b>ter.
                                        </p>
                                        <p style={{ color: 'rgb(0, 125, 0)', fontWeight: 'bold' }}>Press the spacebar to start</p>
                                    </p>
                                    <button className="GreenButton" onClick={handleCloseStartPopup}>
                                        Got it
                                    </button>
                                
                            </div>
                        </>
                    )
        }
        {
                    showFinishPopup && (
                        <>
                        <div className="modal-backdrop" style={{ zIndex: 500}}></div>
                            <div className="modal-content" style={{ 
                                width: '30vw', 
                                display: 'flex', 
                                borderRadius: '20px' ,
                                flexDirection: 'column', // Stack children vertically
                                alignItems: 'center', // Center children horizontally
                                justifyContent: 'center', // Center children vertically
                                textAlign: 'center', // Ensures that text inside children elements is centered, if needed
                                }}> 
                                
                                    <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}>
                                        <p>Congrats on finishing the text!</p>
                                    </p>
                                    <button className="GreenButton" onClick={handleCloseFinishPopupRestart}>
                                        Reread the text
                                    </button>
                                    <button className="GreenButton" onClick={handleCloseFinishPopupSendToQuiz}>
                                        Save and continue to quiz
                                    </button>
                                
                            </div>
                        </>
                    )
        }
      <div className="my-2" style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "stretch",
                    justifyContent: "space-between", // This will evenly space the children vertically
                    height: divHeight,
            }}>

                {/* div 1 */}
                <div
                className="bg-white rounded-lg shadow-lg p-6 pt-2"
                style={{
                width: `calc(var(--sidebar-width) - ${gapBetweenSize})`, // Use template literals to include the gapSize
                display: 'flex',
                flexDirection: 'column', // This will stack children divs on top of each other
                alignItems: 'center',
                justifyContent: 'space-evenly', // Adjust spacing between inner divs
                flexGrow: 1,
                marginBottom: `${gapBetweenSize}`,
                }}
                >
                    <div
                        style={{
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                        padding: '1px',
                        borderRadius: '10px',
                        margin: '5px',
                        width: '100%', // Adjust width as necessary
                        textAlign: 'center',
                        }}
                    >
                        <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Commands</h3>
                    </div>

                    <div
                        style={{
                        width: '100%', // Matches the width of the first inner div for consistency
                        display: 'flex',
                        justifyContent: 'center', // Center-align the text horizontally
                        alignItems: 'center',
                        flexDirection: 'column',
                        flex: 1, // Take up remaining space
                        }}
                    >
                        
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px' }}>
                            <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                            <TbSquareLetterR style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                            <p style={{ margin: '0'}}>to Restart</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)' , marginBottom: '5px' }}>
                            <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                            <RiSpace style={{ marginRight: '5px', color: '#606060', fontSize: '26px' }} />
                            <p style={{ margin: '0' }}>to Pause/Play</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px' }}>
                            <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                            <ArrowLeftSquare color={"rgb(90, 90, 90)"} /><ArrowRightSquare color={"rgb(90, 90, 90)"} />
                            <p style={{ margin: '0'}}>to adjust your speed</p>
                        </div>
                    </div>
                </div>

                {/* div 2 */}
                <div
                className="bg-white rounded-lg shadow-lg p-6 pt-2"
                style={{
                width: `calc(var(--sidebar-width) - ${gapBetweenSize})`, // Use template literals to include the gapSize
                display: 'flex',
                flexDirection: 'column', // This will stack children divs on top of each other
                alignItems: 'center',
                justifyContent: 'space-evenly', // Adjust spacing between inner divs
                flexGrow: 1, 
                marginBottom: `${gapBetweenSize}`,
                }}
                >
                {/* First inner div for the title "Stats" and a gray horizontal line */}
                    <div
                        style={{
                        backgroundColor: 'white',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                        padding: '1px',
                        borderRadius: '10px',
                        margin: '5px',
                        width: '100%', // Adjust width as necessary
                        textAlign: 'center',
                        }}
                    >
                        <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Stats</h3>
                    </div>

                    {/* Second inner div for the text "Average WPM:" centered */}
                    <div
                        style={{
                        width: '100%', // Matches the width of the first inner div for consistency
                        display: 'flex',
                        alignItems: 'center', // Center-align the text vertically
                        justifyContent: 'center',
                        flex: 1, // Take up remaining space
                        }}
                    >
                        <p style={{ fontSize: '15px', color: 'rgb(90, 90, 90)' }}>
                        Average WPM: {averageWPM !== null ? averageWPM : <span style={{ fontStyle: 'italic', color: 'rgb(150, 150, 150)' }}>Pending</span>}
                        </p>
                    </div>
                    <div style={{justifyContent: 'space-between'}}><button
                        onClick={() => sethyperBold(!hyperBold)}
                        style={{
                            backgroundColor: hyperBold ? 'green' : 'grey',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        >
                        {hyperBold ? 'Disable HyperBold' : 'Enable HyperBold'}
                        </button>
                        <button
                        onClick={() => setPointer(!pointer)}
                        style={{
                            backgroundColor: pointer ? 'green' : 'grey',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        >
                        {pointer ? 'Hide Pointer' : 'Show Pointer'}
                        </button>
                      </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', }}>
                        <div>
                          <p>Change pointer size</p>
                          <input
                          type="range"
                          min="1"
                          max="10"
                          defaultValue="1"
                          className="slider"
                          onChange={(event) => {
                            const newValue = Number(event.target.value); // Convert the value to a number
                            setPointerSize(newValue);
                          }}
                          />
                        </div>
                        <div>
                          <p>Change text size</p>
                          <input
                          type="range"
                          min="8"
                          max="32"
                          defaultValue="16"
                          className="slider"
                          onChange={(event) => {
                            const newValue = event.target.value + "px"; // Convert the value to a number
                            setFontSize(newValue);
                          }}
                          />
                        </div>
                      </div>
                      
                </div>
            </div>
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8 pt-2 my-2">
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
            onFinish={() => {

            }}
            onRestartTimeChange={handleRestartTimeChange} 
            onReadingTimeChange={handleReadingTimeChange}
            hyperBold={hyperBold}
            fontFamily = "monospace"
            pointer={pointer}
            restartText={restartText}
            pointerSize={pointerSize}
            fontSize={fontSize}
            // className= {showStartPopup||showFinishPopup ? 'blur-effect' : ''}
          />
        </div>
        <button className="fancyButton" onClick={handleFinishText}>
          I have finished reading the text
        </button>
      </div>
    </div>
    </div>
  </div>
  );
};

export default Mode1Display;