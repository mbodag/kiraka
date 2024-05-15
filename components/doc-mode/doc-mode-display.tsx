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
import { TbSquareLetterT } from 'react-icons/tb';
import { TbSquareLetterB } from 'react-icons/tb';
import { TbSquareLetterH } from 'react-icons/tb';
import { TbSquareLetterP } from 'react-icons/tb';
import { TbSquareLetterM } from 'react-icons/tb';
import Routes from '@/config/routes';


const Mode1Display = () => {
  const [wordsPerMinute, setWordsPerMinute] = useState(300);
  const [backgroundClass, setBackgroundClass] = useState("flash-mode-display-bg-color");
  const [textColorClass, setTextColorClass] = useState("text-color-black");
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
  const [fixationDegree, setFixationDegree] = useState(3);
  const [pointerColour, setPointerColour] = useState("cyan");

  const { practiceId, setPracticeId } = usePracticeID(); // Accessing the setPracticeId method from the global context


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
        const response = await fetch(`/api/texts/${textId}?user_id=${userId}`);
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
    setBackgroundClass((prevClass) => (prevClass === "flash-mode-display-bg-color" ? "bg-color-black" : "flash-mode-display-bg-color"));
  };

  const toggleTextColor = () => {
    setTextColorClass((prevClass) => (prevClass === "text-color-black" ? "flash-mode-display-text-color" : "text-color-black"));
  };

  const togglehyperBold = () => {
    sethyperBold((prevValue) => !prevValue);
  };

  const togglePointer = () => {
    setPointer((prevValue) => !prevValue);
  };


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
                  chunks_data: [],
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
      setWordsPerMinute((prevWPM) => Math.min(prevWPM + 50, 1500)); // Increase WPM with upper bound
    } else if (event.key === "ArrowLeft") {
      setWordsPerMinute((prevWPM) => Math.max(prevWPM - 50, 50)); // Decrease WPM with lower bound
    } else if (event.key === "p" || event.key === "P") {
      togglePointer();
    } else if (event.key === "h" || event.key === "H") {
      togglehyperBold();
    } else if (event.key === "b" || event.key === "B") {
      toggleBackgroundColor();
    } else if (event.key === "t" || event.key === "T") {
      toggleTextColor();
    } else if (event.key === "m" || event.key === "M") {
      toggleTextColor();
      toggleBackgroundColor();
    } else if (event.key === "1") {
      setFixationDegree(1);
    } else if (event.key === "2") {
      setFixationDegree(2);
    } else if (event.key === "3") {
      setFixationDegree(3);
    } else if (event.key === "4") {
      setFixationDegree(4);
    } else if (event.key === "c" || event.key === "C") {
      setPointerColour("cyan");
    } else if (event.key === "y" || event.key === "Y") {
      setPointerColour("yellow");
    } else if (event.key === "o" || event.key === "O") {
      setPointerColour("orange");
    } else if (event.key === "g" || event.key === "G") {
      setPointerColour("green");
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
  };

  const handleCloseStartPopup = () => {
    setShowStartPopup(false);
  };

  const handleCloseFinishPopupSendToQuiz = () => {
    submitReadingSpeed(averageWPM);
    window.location.href = Routes.QUIZ;
  };

  const handleCloseFinishPopupRestart = () => {
    setShowFinishPopup(false);
    restartAction();
  };


  const gapBetweenSize = '8px';
  const gapBetweenSize2 = '10px';


  // Component return
  return (
    <div className="justify-center items-start rounded-xl"
    style={{ minWidth: "800px", width: "80%", maxWidth: "1100px", }}>
      {/* Smaller divs on the right */}
      {
          showStartPopup && (
              <>
              <div className="modal-backdrop" style={{ zIndex: -1}}></div>
                  <div className="modal-content" style={{ 
                      width: '600px', 
                      display: 'flex', 
                      borderRadius: '20px' ,
                      flexDirection: 'column', // Stack children vertically
                      alignItems: 'center', // Center children horizontally
                      justifyContent: 'center', // Center children vertically
                      textAlign: 'center', // Ensures that text inside children elements is centered, if needed
                  }}>
                    <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}>
                        Welcome to <strong>DocMode!</strong>
                    </p>
                    <p>Here, you have the freedom to see the whole text and read it at your own pace. However, we have some <span className="text-pink-800"><strong>extra features</strong></span> you may find useful. These are controlled via the above control panel.</p>
                    <br></br>
                    <p>Features include:</p>
                    <div className='mx-4 mt-2 bg-red-50 shadow-lg rounded-xl p-4 w-full'>
                      <p><strong style={{ fontStyle: 'italic'}} className="text-pink-800">Pointer:</strong> Highlighting words karaoke-style. Width and pace adjustable.</p>
                    </div>
                    <div className='mx-4 my-2 bg-red-50 shadow-lg rounded-xl p-4 w-full'>
                      <p><strong style={{ fontStyle: 'italic'}} className="text-pink-800">Font Size:</strong> Adjusted via slider.</p>
                    </div>
                    <div className='mx-4 mb-6 bg-red-50 shadow-lg rounded-xl p-4 w-full'>
                      <p><strong style={{ fontStyle: 'italic'}} className="text-pink-800">Hyperbold:</strong> <b>Bol</b>ds the <b>beg</b>inning of <b>wor</b>ds to <b>cre</b>ate <b>art</b>ificial <b>fix</b>ation <b>poin</b>ts.</p>
                    </div>
                    <p style={{ color: '', fontWeight: '' }}>Press the spacebar to start reading in DocMode!</p>
                    <br></br>
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
                    width: '600px', 
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
      <div className="justify-center items-start rounded-xl bg-pink-900" style={{padding: gapBetweenSize}}>
        <div className="" style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "stretch",
                      justifyContent: "space-between", // This will evenly space the children vertically
                      // height: '350px',
                      gap: gapBetweenSize2,
                      // margin: gapBetweenSize,
              }}>

                  {/* div 1 */}
                  <div
                  className="flash-mode-display-bg-color rounded-lg shadow-lg p-6 pt-2"
                  style={{
                  display: 'flex',
                  flexDirection: 'column', // This will stack children divs on top of each other
                  alignItems: 'center',
                  justifyContent: 'space-evenly', // Adjust spacing between inner divs
                  // width: "350px",
                  }}
                  >
                      <div 
                          style={{
                          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                          padding: '1px',
                          borderRadius: '10px',
                          margin: '5px',
                          width: '100%', // Adjust width as necessary
                          textAlign: 'center',
                          marginBottom: '15px'
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
                          
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                              <TbSquareLetterR style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                              <p style={{ margin: '0'}}>to Restart Pointer</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)' , marginBottom: '5px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                              <RiSpace style={{ marginRight: '5px', color: '#606060', fontSize: '26px' }} />
                              <p style={{ margin: '0' }}>to Pause/Play</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                              <ArrowLeftSquare color={"rgb(90, 90, 90)"} /><ArrowRightSquare color={"rgb(90, 90, 90)"} />
                              <p style={{ marginLeft: '5px'}}>to Adjust your WPM</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                              <TbSquareLetterH style={{ marginRight: '', color: '#606060', fontSize: '24px' }} />
                              <p style={{ margin: '0'}}>/</p>
                              <TbSquareLetterP style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                              <p style={{ margin: '0'}}>to Use HyperBold/Pointer</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                              <TbSquareLetterT style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                              <p style={{ margin: '0'}}>to Change Text Colour</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                              <TbSquareLetterB style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                              <p style={{ margin: '0'}}>to Change Background Colour</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', color: 'rgb(90, 90, 90)', marginBottom: '5px', marginTop: '5px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: '0', marginRight: '5px' }}>Press</p>
                              <TbSquareLetterM style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                              <p style={{ margin: '0', marginRight: '5px'}}>for Mode Combined</p>
                              <TbSquareLetterT style={{ marginRight: '', color: '#606060', fontSize: '24px' }} />
                              <p style={{ marginRight: '3px', marginLeft: '3px'}}>&</p>
                              <TbSquareLetterB style={{ marginRight: '5px', color: '#606060', fontSize: '24px' }} />
                          </div>
                      </div>
                  </div>

                  {/* div 2 */}
                  <div
                  className="rounded-lg shadow-lg"
                  style={{
                    display: 'flex',
                    flexDirection: 'column', // This will stack children divs on top of each other
                    alignItems: 'center',
                    justifyContent: 'space-evenly', // Adjust spacing between inner divs
                    flexGrow: 1, 
                  }}
                  >
                    <div
                      className="flash-mode-display-bg-color rounded-lg w-full shadow-lg px-6 py-2"
                      style={{
                        display: 'flex',
                        flexDirection: 'column', // This will stack children divs on top of each other
                        alignItems: 'center',
                        justifyContent: 'space-evenly', // Adjust spacing between inner divs
                        flexGrow: 1, 
                        marginBottom: gapBetweenSize2,
                      }}
                      >
                    {/* First inner div for the title "Stats" and a gray horizontal line */}
                        <div className="my-1"
                            style={{
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                            borderRadius: '10px',
                            margin: '5px',
                            width: '100%', // Adjust width as necessary
                            textAlign: 'center',
                            }}
                        >
                            <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Stats</h3>
                        </div>

                        {/* Second inner div for the text "Average WPM:" centered */}
                        <div className="mt-1"
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
                      </div>
                    <div
                      className="flash-mode-display-bg-color rounded-lg w-full px-6 py-2"
                      style={{
                        display: 'flex',
                        flexDirection: 'column', // This will stack children divs on top of each other
                        alignItems: 'center',
                        justifyContent: 'space-evenly', // Adjust spacing between inner divs
                        flexGrow: 1, 
                      }}
                      >
                    {/* First inner div for the title "Stats" and a gray horizontal line */}
                        <div className="my-1 mb-3"
                            style={{
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                            padding: '1px',
                            borderRadius: '10px',
                            width: '100%', // Adjust width as necessary
                            textAlign: 'center',
                            }}
                        >
                            <h3 className="text-lg font-semibold" style={{ fontSize: '16px', fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>Features</h3>
                        </div>
                        <div className="justify-center" style={{
                            width: '80%',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr', // Two columns
                            gridGap: '20px', // Space between grid items
                            maxWidth: '800px', // Maximum width of the grid
                            margin: 'auto'
                          }}>
                            <div className="rounded-2xl p-2" style={{
                              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
                              width: '100%', // Adjust width as necessary
                              textAlign: 'center',
                            }}>
                              {/* Wrapper for HyperBold button and fixation degree option */}
                              <div style={{ width: '100%' }}> {/* Wrapper to maintain button size */}
                                <button
                                  className="rounded-xl"
                                  onClick={() => sethyperBold(!hyperBold)}
                                  style={{
                                    backgroundColor: hyperBold ? 'rgb(250, 212, 212)' : 'rgb(245, 245, 245)',
                                    color: 'rgb(90, 90, 90)',
                                    padding: '5px 15px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                    transition: 'background-color 0.3s, box-shadow 0.3s',
                                    width: '100%', // Ensures the button fills the container
                                    textAlign: 'center', // Center text
                                    minWidth: '170px' // Minimum width to accommodate the largest text
                                  }}
                                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgb(250, 205, 212)'}
                                  onMouseOut={e => e.currentTarget.style.backgroundColor = hyperBold ? 'rgb(250, 212, 212)' : 'rgb(245, 245, 245)'}
                                >
                                  {hyperBold ? 'Disable HyperBold' : 'Enable HyperBold'}
                                </button>
                              </div>
                              {/* Fixation degree options */}
                              <div style={{ width: '100%', marginTop: '15px', color: 'rgb(90, 90, 90)', textAlign: 'center' }}>
                                <p>Fixation Degree</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                  {[1, 2, 3, 4].map(value => (
                                    <div
                                      key={value}
                                      onClick={() => setFixationDegree(value)}
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        border: '1px solid rgb(200, 200, 200)',
                                        backgroundColor: fixationDegree === value ? 'rgb(250, 212, 212)' : 'rgb(245, 245, 245)',
                                        color: 'rgb(90, 90, 90)',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                      }}
                                    >
                                      {value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl p-2" style={{
                              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
                              width: '100%', // Adjust width as necessary
                              textAlign: 'center',
                            }}>
                              {/* Wrapper for Pointer button and color options */}
                              <div style={{ width: '100%' }}> {/* Wrapper to maintain button size */}
                                <button
                                  className="rounded-xl"
                                  onClick={() => setPointer(!pointer)}
                                  style={{
                                    backgroundColor: pointer ? 'rgb(250, 212, 212)' : 'rgb(245, 245, 245)',
                                    color: 'rgb(90, 90, 90)',
                                    padding: '5px 15px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                    transition: 'background-color 0.3s, box-shadow 0.3s',
                                    width: '100%', // Ensures the button fills the container
                                    textAlign: 'center', // Center text
                                    minWidth: '170px' // Minimum width to accommodate the largest text
                                  }}
                                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgb(250, 205, 212)'}
                                  onMouseOut={e => e.currentTarget.style.backgroundColor = pointer ? 'rgb(250, 212, 212)' : 'rgb(245, 245, 245)'}
                                >
                                  {pointer ? 'Hide Pointer' : 'Show Pointer'}
                                </button>
                              </div>
                              {/* Pointer colour options */}
                              <div style={{ width: '100%', marginTop: '15px', color: 'rgb(90, 90, 90)', textAlign: 'center' }}>
                                <p>Pointer Colour</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                  {['cyan', 'yellow', 'orange', 'green'].map(color => (
                                    <div
                                      key={color}
                                      onClick={() => setPointerColour(color)}
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        border: '1px solid rgb(200, 200, 200)',
                                        backgroundColor: pointerColour === color ? color : 'rgb(245, 245, 245)',
                                        color: pointerColour === color ? (color === 'yellow' ? 'black' : 'white') : color,
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s',
                                        WebkitTextStroke: color === 'yellow' ? '0.25px black' : 'none',
                                      }}
                                    >
                                      {color.charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div style={{ width: '100%', color: 'rgb(90, 90, 90)' }}>
                              <p style={{ textAlign: 'center' }}>Change text size</p>
                              <input
                                type="range"
                                min="8"
                                max="40"
                                defaultValue="16"
                                className="slider"
                                onChange={(event) => {
                                  const newValue = event.target.value + "px";
                                  setFontSize(newValue);
                                }}
                                style={{ width: '100%',  accentColor: 'pink' }}
                              />
                            </div>
                            <div style={{ width: '100%', color: 'rgb(90, 90, 90)', }}>
                              <p style={{ textAlign: 'center' }}>Change pointer size</p>
                              <input
                                type="range"
                                min="1"
                                max="15"
                                defaultValue="1"
                                className="slider"
                                onChange={(event) => {
                                  const newValue = Number(event.target.value);
                                  setPointerSize(newValue);
                                }}
                                style={{ width: '100%',  accentColor: 'pink' }}
                              />
                            </div>
                          </div>

                        </div> 
                  </div>
              </div>
    </div>
    <div className="justify-center items-start rounded-xl bg-pink-900" style={{padding: gapBetweenSize, marginTop: gapBetweenSize2}}>
      <div className="flash-mode-display-bg-color rounded-lg shadow-lg px-6 pt-2"
          style={{ minWidth: "", width: ""}}>
        <div className="centerContainer">
          <CounterDisplay count={wordsPerMinute} fontSize="16px" />
          <div className="textAndButtonContainer">
            <div
              className={`${backgroundClass} ${textColorClass}`}
              style={{
                // color: textColor,r
                // backgroundColor: backgroundColor,
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
                padding: "25px",
                borderRadius: "10px",
                margin: "10px", 
                marginBottom: "20px", 
              }}
            >
              <HighlightableText
                text={shortStory}
                highlightInterval={60000 / wordsPerMinute}
                onFinish={() => {}}
                onRestartTimeChange={handleRestartTimeChange} 
                onReadingTimeChange={handleReadingTimeChange}
                hyperBold={hyperBold}
                fontFamily = "monospace-jetbrains-mono"
                pointer={pointer}
                restartText={restartText}
                pointerSize={pointerSize}
                fontSize={fontSize}
                fixationDegree={fixationDegree} // Pass fixationDegree
                pointerColour={pointerColour} // Pass pointerColour
                backgroundClass={backgroundClass} // Pass backgroundClass
                textColorClass={textColorClass} // Pass textColorClass
                // className= {showStartPopup||showFinishPopup ? 'blur-effect' : ''}
              />
            </div>
            <button className="GreenButton" onClick={handleFinishText}>
              I have finished reading the text
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Mode1Display;