"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useWebGazer } from '@/contexts/WebGazerContext';
import Routes from '@/config/routes';

const ModeToggle = () => {
  const { setWebGazerActive } = useWebGazer();
  
  const handleFlashModeClick = () => {
    setWebGazerActive(false); // Deactivate WebGazer
    window.location.href = Routes.DEFAULT_MODE; // Redirect to FlashMode
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
    </div>
  );
};

export default ModeToggle;
