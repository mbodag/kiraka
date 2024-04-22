"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useWebGazer } from '@/contexts/WebGazerContext';

const ModeToggle = () => {
  const { setWebGazerActive } = useWebGazer();
  
  const handleFlashModeClick = () => {
    setWebGazerActive(false); // Deactivate WebGazer
    window.location.href = '/webgazer-mode-2'; // Redirect to FlashMode
  };

  return (
    <div className="flex flex-row justify-center space-x-2">
      <Link href="/instructions">
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">
          Instructions
        </Button>{" "}
      </Link>
      {/* Semi-transparent green buttons */}
      <Button onClick={handleFlashModeClick} className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">
        FlashMode
      </Button>
      {/* <Button className="bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">
        Mode 3
      </Button> */}
    </div>
  );
};

export default ModeToggle;
