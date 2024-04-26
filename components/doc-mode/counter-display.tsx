import React, { useState, useEffect } from "react";
import { ArrowLeftSquare, ArrowRightSquare } from 'lucide-react';

interface CounterDisplayProps {
  count: number;
  fontSize?: string;
  className?: string;
}

const CounterDisplay: React.FC<CounterDisplayProps> = ({
  count,
  fontSize = "14px",
  className = "",
}) => {
  const [leftArrowActive, setLeftArrowActive] = useState(false);
  const [rightArrowActive, setRightArrowActive] = useState(false);

  // Handle keydown event
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      setLeftArrowActive(true);
    } else if (event.key === 'ArrowRight') {
      setRightArrowActive(true);
    }
  };

  // Handle keyup event
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      setLeftArrowActive(false);
    } else if (event.key === 'ArrowRight') {
      setRightArrowActive(false);
    }
  };

  // Add event listeners for keydown and keyup
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    // Outer container with white background and shadow
    <div className={className} style={{ 
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)', 
        padding: '10px 50px', 
        borderRadius: '10px', 
        marginBottom: '5px',
        textAlign: 'center' 
      }}>

      {/* Counter display */}
      <div>
        <p style={{ fontSize: fontSize, fontWeight: 'bold', color: 'rgb(90, 90, 90)' }}>
          Counter WPM (Words Per Minute): {count}
        </p>
      </div>

      {/* Arrows display */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <div style={{ marginRight: '5px', display: 'flex', alignItems: 'center' }}>
          <ArrowLeftSquare color={leftArrowActive ? "rgb(200, 0, 0)" : "rgb(90, 90, 90)"} />
        </div>
        <div style={{ marginLeft: '5px', display: 'flex', alignItems: 'center' }}>
          <ArrowRightSquare color={rightArrowActive ? "rgb(200, 0, 0)" : "rgb(90, 90, 90)"} />
        </div>
      </div>
    </div>
  );
};

export default CounterDisplay;
