import React from 'react';
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import ModeToggle from "./modetoggle";
import { Button } from "./ui/button";

const Navbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center py-4 px-8 w-full"
      style={{
        background: 'linear-gradient(to bottom, rgba(0, 77, 35, 0.82), rgba(0, 77, 35, 0.8))'
      }}>
      <div className="flex-1 flex items-center"> {/* Container for left side */}
        <MobileSidebar />
        <Link href="/quiz" passHref>
          <Button className="ml-4 bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Quiz</Button>
        </Link>
      </div>
      <div className="flex-1 flex justify-center"> {/* Centered mode buttons */}
        <ModeToggle />
      </div>
      <div className="flex-1 flex justify-end items-center"> {/* Container for right side */}
        <Link href="/calibration" passHref>
            <Button className="bg-green-200/30 hover:bg-green-200/50 text-white mr-2 text-sm">WebGazer</Button> {/* Start button */}
        </Link>
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white mr-2 text-sm">▶</Button> {/* Start button */}
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white text-lg">⏸</Button> {/* Pause button */}
      </div>
    </div>
  );
};

export default Navbar;
