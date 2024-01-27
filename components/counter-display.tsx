import React from "react";

interface CounterDisplayProps {
  count: number;
  fontSize?: string; // Optional prop for fontSize
}

const CounterDisplay: React.FC<CounterDisplayProps> = ({
  count,
  fontSize = "14px",
}) => {
  return (
    <div>
      <p style={{ fontSize: fontSize }}>Counter (words per minute): {count}</p>
    </div>
  );
};

export default CounterDisplay;
