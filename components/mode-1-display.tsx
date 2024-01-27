"use client";
import { useEffect, useState } from "react";
import HighlightableText from "./mode-1/highlightable-text";
import CounterDisplay from "./counter-display";

const Mode1Display = () => {
  const shortStory = `In a quaint town nestled between rolling hills, there stood a charming library, surrounded by vibrant gardens. The librarian, Mrs. Jenkins, meticulously organized the shelves, arranging books by genre and author. One day, as the sun cast its warm glow, a curious cat named Whiskers strolled through the open door. Whiskers, known for his fondness for adventure, perused the fiction section, his tail swaying with excitement. Unbeknownst to Whiskers, a little mouse named Squeaky watched from a cozy nook, eager to explore the world beyond the library's walls. As Whiskers meandered through the aisles, he discovered a hidden door leading to a magical realm filled with enchanted books. Little did he know, this discovery would bring together an unexpected friendship between a cat, a mouse, and the captivating world of literature.`;

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

  return (
    <div className="">
      <CounterDisplay count={wordsPerMinute} fontSize="16px" />
      <HighlightableText
        text={shortStory}
        highlightInterval={60000 / wordsPerMinute}
      />
    </div>
  );
};

export default Mode1Display;
