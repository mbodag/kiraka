import React, { createContext, useContext, useEffect, useState } from 'react';

// Reset WebGazerActive state in localStorage on page load
const resetWebGazerActiveOnReload = () => {
  const navigationEntries = performance.getEntriesByType("navigation");
  if (navigationEntries.length > 0 && 'type' in navigationEntries[0] && navigationEntries[0].type === 'reload') {
    localStorage.setItem('webGazerActive', 'false');
  }
};

// Immediately invoke the above function to ensure it runs once on page load
resetWebGazerActiveOnReload();


interface WebGazerContextType {
  isWebGazerActive: boolean;
  setWebGazerActive: (isActive: boolean) => void;
}

const WebGazerContext = createContext<WebGazerContextType | undefined>(undefined);

export const WebGazerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWebGazerActive, setIsWebGazerActive] = useState(false);

  useEffect(() => {
    // Once the component mounts, check localStorage and update state accordingly
    const isActive = localStorage.getItem('webGazerActive') === 'true';
    setIsWebGazerActive(isActive);
  }, []);

  const setWebGazerActive = (isActive: boolean) => {
    setIsWebGazerActive(isActive);
    // Ensure this runs only on client side
    if (typeof window !== 'undefined') {
      localStorage.setItem('webGazerActive', isActive.toString());
    }
  };

  return (
    <WebGazerContext.Provider value={{ isWebGazerActive, setWebGazerActive }}>
      {children}
    </WebGazerContext.Provider>
  );
};

export const useWebGazer = (): WebGazerContextType => {
  const context = useContext(WebGazerContext);
  if (!context) {
    throw new Error('useWebGazer must be used within a WebGazerProvider');
  }
  return context;
};
