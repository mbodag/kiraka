import React from 'react';
import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import ModeToggle from "./modetoggle";
import { Button } from "./ui/button";
import { useWebGazer } from '@/contexts/WebGazerContext';


const NavbarWebGazer: React.FC = () => {
    const { isWebGazerActive } = useWebGazer(); // Accessing the current state of WebGazer

    // Conditional border class names based on WebGazer's active state
    const webGazerButtonBorderClass = isWebGazerActive
        ? "border-2 flash-green-border" // Active state: Flickering green border
        : "border-2 border-red-500 hover:border-red-600"; // Inactive state: Red border

    // Combine base button classes with conditional border classes
    const webGazerButtonClass = `bg-green-200/30 hover:bg-green-200/50 text-white mr-2 text-sm ${webGazerButtonBorderClass}`;
    
    // Handle click event based on WebGazer state
    const handleWebGazerButtonClick = () => {
        if (isWebGazerActive) {
            // Refresh the page if WebGazer is active
            window.location.reload();
        } else {
            // Navigate to the calibration page if WebGazer is not active
            window.location.href = '/calibration'; // Navigate and reload page
        }
    };

    return (
        <div className="flex justify-between items-center py-4 px-8 w-full"
        style={{
            background: 'linear-gradient(to bottom, rgba(7, 107, 52, 0.88), rgba(7, 107, 52, 0.8))',
            zIndex: 1000, // High z-index to ensure it's above other content
            position: 'relative' // Add this if the z-index doesn't work by itself'
        }}>
            <div className="flex-1 flex items-center"> {/* Container for left side */}
                <MobileSidebar />
                <Link href="/analytics" passHref>
                    <Button className="ml-4 bg-green-200/30 hover:bg-green-200/50 text-white navbar-dashboard-font">Analytics</Button>
                </Link>
            </div>
            <div className="flex-1 flex justify-center"> {/* Centered mode buttons */}
                <ModeToggle />
            </div>
            <div className="flex-1 flex justify-end items-center"> {/* Container for right side */}
                <Button className={webGazerButtonClass} onClick={handleWebGazerButtonClick}>WebGazer</Button>
            </div>
        </div>
    );
};

export default NavbarWebGazer;
