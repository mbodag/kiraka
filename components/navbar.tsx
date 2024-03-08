import React from 'react';
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import ModeToggle from "./modetoggle";
import { Button } from "./ui/button";
import { FaPause } from "react-icons/fa6";

const Navbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center py-4 px-8 w-full"
      style={{
        background: 'linear-gradient(to bottom, rgba(7, 107, 52, 0.88), rgba(7, 107, 52, 0.8))',
        zIndex: 1000, // High z-index to ensure it's above other content
        position: 'relative' // Add this if the z-index doesn't work by itself'
      }}>
      <div className="flex-1 flex items-center"> {/* Container for left side */}
        <MobileSidebar />
        <Link href="/quiz" passHref>
          <Button className="ml-4 bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Quiz</Button>
        </Link>
        <Link href="/analytics" passHref>
          <Button className="ml-4 bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Analytics</Button>
        </Link>
      </div>
      <div className="flex-1 flex justify-center"> {/* Centered mode buttons */}
        <ModeToggle />
      </div>
      <div className="flex-1 flex justify-end items-center"> {/* Container for right side */}
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white mr-2 text-sm">▶</Button> {/* Start button */}
        <Button className="bg-green-200/30 hover:bg-green-200/50 text-white text-sm"><FaPause /></Button> {/* Pause button */}
      </div>
    </div>
  );
};

export default Navbar;
