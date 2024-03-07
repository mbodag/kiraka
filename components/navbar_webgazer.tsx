import React from 'react';
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import ModeToggle from "./modetoggle";
import { Button } from "./ui/button";
import { useWebGazer } from '@/contexts/WebGazerContext';
import { FaPause } from "react-icons/fa6";

const NavbarWebGazer: React.FC = () => {
    const { isWebGazerActive } = useWebGazer(); // Accessing the current state of WebGazer

    // Conditional border class names based on WebGazer's active state
    const webGazerButtonBorderClass = isWebGazerActive
        ? "border-2 flash-green-border" // Active state: Flickering green border
        : "border-2 border-red-500 hover:border-red-600"; // Inactive state: Red border

    // Combine base button classes with conditional border classes
    const webGazerButtonClass = `bg-green-200/30 hover:bg-green-200/50 text-white mr-2 text-sm ${webGazerButtonBorderClass}`;
    

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
            </div>
        <div className="flex-1 flex justify-center"> {/* Centered mode buttons */}
            <ModeToggle />
        </div>
            <div className="flex-1 flex justify-end items-center"> {/* Container for right side */}
                <Link href="/calibration" passHref>
                    <Button className={webGazerButtonClass}>WebGazer</Button> {/* Button's class updated based on WebGazer state */}
                </Link>
                <Button className="bg-green-200/30 hover:bg-green-200/50 text-white mr-2 text-sm">▶</Button> {/* Start button */}
                <Button className="bg-green-200/30 hover:bg-green-200/50 text-white text-sm"><FaPause /></Button> {/* Pause button */}
            </div>
        </div>
    );
};

export default NavbarWebGazer;
