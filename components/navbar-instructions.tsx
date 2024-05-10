import React from 'react';
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import { Button } from "./ui/button";
import Routes from '@/config/routes';

const InstructionsNavbar: React.FC = () => {
  return (
    <div className="monospace-jetbrains-mono flex justify-between items-center py-4 px-5 w-full"
      style={{
        background: 'linear-gradient(to bottom, var(--gradient-top-color), var(--gradient-bottom-color))',
        zIndex: 1000,
        position: 'relative'
      }}>
      {/* Left side - only MobileSidebar */}
      <div>
        <MobileSidebar />
      </div>
      {/* Centered Button */}
      <div>
        {/* <Link href={Routes.DEFAULT_MODE} passHref>
          <Button className="border-2 flash-orange-border rounded-xl bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Start Your Speed Reading Session!</Button>
        </Link> */}
      </div>
      {/* Right side - empty for alignment */}
      <div>
      </div>
    </div>
  );
};

export default InstructionsNavbar;
