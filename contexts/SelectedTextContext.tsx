"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SelectedTextContextType {
  selectedText: string;
  setSelectedText: React.Dispatch<React.SetStateAction<string>>;
}

const SelectedTextContext = createContext<SelectedTextContextType | undefined>(undefined);

export const useSelectedText = () => {
  const context = useContext(SelectedTextContext);
  if (!context) {
    throw new Error('useSelectedText must be used within a SelectedTextProvider');
  }
  return context;
};

// Define a type for the props
interface SelectedTextProviderProps {
  children: ReactNode;
}

export const SelectedTextProvider: React.FC<SelectedTextProviderProps> = ({ children }) => {
  const [selectedText, setSelectedText] = useState('');

  return (
    <SelectedTextContext.Provider value={{ selectedText, setSelectedText }}>
      {children}
    </SelectedTextContext.Provider>
  );
};
