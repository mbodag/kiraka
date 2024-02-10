import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WebGazerContextState {
  webgazerActive: boolean;
  setWebgazerActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebGazerContext = createContext<WebGazerContextState | undefined>(undefined);

interface WebGazerProviderProps {
  children: ReactNode;
}

export const WebGazerProvider: React.FC<WebGazerProviderProps> = ({ children }) => {
  const [webgazerActive, setWebgazerActive] = useState(false);

  return (
    <WebGazerContext.Provider value={{ webgazerActive, setWebgazerActive }}>
      {children}
    </WebGazerContext.Provider>
  );
};

export const useWebGazer = () => {
  const context = useContext(WebGazerContext);
  if (context === undefined) {
    throw new Error('useWebGazer must be used within a WebGazerProvider');
  }
  return context;
};
