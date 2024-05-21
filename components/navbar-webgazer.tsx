import React, { useState, useEffect } from 'react';
import MobileSidebar from "./mobile-sidebar";
import { Button } from "./ui/button";
import { useWebGazer } from '@/contexts/WebGazerContext';
import { usePathname, useRouter } from 'next/navigation';
import { Switch } from "@/components/ui/switch"
import { TiFlash } from "react-icons/ti";
import { HiMiniDocumentText } from "react-icons/hi2";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"


const NavbarWebGazer: React.FC = () => {
    const { isWebGazerActive } = useWebGazer(); // Accessing the current state of WebGazer
    const pathname = usePathname();
    const router = useRouter();
    const [config, setConfig] = useState(pathname.includes('adaptive') ? 'adaptive' : 'static');
    const [selectedMode, setSelectedMode] = useState(pathname.includes('doc-mode') ? 'doc-mode' : 'flash-mode/adaptive');
    
    useEffect(() => {
        setConfig(pathname.includes('adaptive') ? 'adaptive' : 'static');
    }, [pathname]);
    
    const handleConfigChange = (newConfig: 'static' | 'adaptive') => {
        console.log(`Changing config to: ${newConfig}`);
        setConfig(newConfig);
        window.location.assign(`/flash-mode/${newConfig}`);
        // router.push(`/flash-mode/${newConfig}`);
    };

    const handleModeChange = (mode: string) => {
        console.log(`Mode changed to: ${mode}`);
        setSelectedMode(mode);
        window.location.assign(`/${mode}`);
        // router.push(`/${mode}`);
    };

    // Conditional border class names based on WebGazer's active state
    const webGazerButtonBorderClass = isWebGazerActive
        ? "border-2 flash-green-border" // Active state: Flickering green border
        : "border-2 border-red-500 hover:border-red-600"; // Inactive state: Red border

    // Combine base button classes with conditional border classes
    const webGazerButtonClass = `bg-green-200/20 hover:bg-green-200/40 text-white navbar-dashboard-font rounded-xl ${webGazerButtonBorderClass}`;
    
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
        <div className="monospace-jetbrains-mono fixed flex justify-between items-center py-4 px-5 w-full"
        style={{
            background: 'linear-gradient(to bottom, var(--gradient-top-color), var(--gradient-bottom-color))',
            zIndex: 1000, // High z-index to ensure it's above other content
            position: 'relative',
            height: '70px'
        }}>
            <div className="inline-flex text-white items-center justify-center cursor-pointer mr-8">
            <MobileSidebar />
                <Select onValueChange={handleModeChange} value={selectedMode}>
                    <SelectTrigger aria-label="Select reading mode">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="flash-mode/adaptive">
                            <div className="flex items-center">
                                <TiFlash className="mr-1 text-lg"/>
                                FlashMode
                            </div>
                        </SelectItem>
                        <SelectItem value="doc-mode">
                            <div className="flex items-center">
                                <HiMiniDocumentText className="mr-2 text-md"/>
                                DocMode
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {pathname.includes('/flash-mode') && (
                <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-6">
                    <Switch
                        checked={pathname.includes('static')} 
                        onCheckedChange={(checked) => handleConfigChange(checked ? 'static' : 'adaptive')}
                    />
                </div>
            )}

            {pathname.includes('/flash-mode/adaptive') && (
                <div className="webgazer-button-container pr-2">
                    <Button className={webGazerButtonClass} onClick={handleWebGazerButtonClick}>
                        WebGazer
                    </Button>
                </div>
            )}
        </div>
    );
};

export default NavbarWebGazer;
