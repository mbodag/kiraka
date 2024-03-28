import React, { useState } from "react";

const ReadingTimer: React.FC = () => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(true);

  const handleStartClick = () => {
    const now = Date.now(); // Get current time in milliseconds
    setStartTime(now);
    setIsReading(true); // Change state to show "Done" button
  };

  const handleDoneClick = () => {
    const now = Date.now();
    setEndTime(now);
    setIsReading(false); // Reset to show "Start" button again
    setShowButtons(false); // Hide buttons after the user is done
  };

  // Calculate the time elapsed and render it
  const calculateTimeElapsed = () => {
    if (startTime && endTime) {
      const elapsed = (endTime - startTime) / 1000; // Convert milliseconds to seconds
      return <p>Reading Time: {elapsed} seconds</p>;
    }
    return null;
  };

  return (
    <div>
      {showButtons && renderButton()}
      {calculateTimeElapsed()}
    </div>
  );

  function renderButton() {
    if (isReading) {
      return <button onClick={handleDoneClick}>Done</button>;
    } else {
      return <button onClick={handleStartClick}>Start</button>;
    }
  }
};

export default ReadingTimer;
