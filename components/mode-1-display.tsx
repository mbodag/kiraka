"use client";
import { useEffect, useState } from "react";
import HighlightableText from "./mode-1/highlightable-text";
import CounterDisplay from "./counter-display";
import '@/app/globals.css';

const Mode1Display = () => {
  const shortStory = `A key challenge in using Deep Reinforcement Learning (DRL) methods lies in their reliance on non-convex objective functions, which often have multiple local optima. Due to the implementation of gradient descent/ascent in neural networks, finding the global optimum is unlikely. This can be seen as a limitation in exploration, as the algorithms may not effectively navigate through all local optima in search of the global optimum. In contrast, Evolutionary Algorithms (EAs) have a proven ability to discover a diverse range of solutions, excelling in exploring potential solutions. Integrating EAs with DRL algorithms could potentially overcome the exploration limitations of DRL methods while maintaining satisfactory convergence rates. There have been attempts to combine these fields, notably with the PGA-MAP Elites algorithm introduced in the 'Policy Gradient Assisted MAP-Elites' paper, being the best performing one. This project aims to further experiment with the integration of these two fields, considering computational expenses as well. In particular, this project hopes to tackle that, by developing an algorithm that is not based on actor-critic methods, and thus limiting the networks used in the DRL part.`;

  const [wordsPerMinute, setNumber] = useState(300);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setNumber((prevNumber) => prevNumber + 20);
      } else if (event.key === "ArrowLeft") {
        setNumber((prevNumber) => prevNumber - 20);
      }
    };


    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const [summary, setSummary] = useState('');

  const handleGetSummary = async () => {
    // Replace 'inputText' with the actual text you want to summarize
    const inputText = shortStory;

    try {
      const response = await fetch('http://127.0.0.1:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error getting summary:', error);
    }
  };





  return (
    <div className='centerContainer'>
      <CounterDisplay count={wordsPerMinute} fontSize="16px" />
      <div className='textAndButtonContainer'>
        <HighlightableText
          text={shortStory}
          highlightInterval={60000 / wordsPerMinute}
        />
        <button className='fancyButton' onClick={handleGetSummary}>
          Get Summary
        </button>
        {summary && <p>Summary: {summary}</p>}
      </div>
    </div>
  );
};

export default Mode1Display;
