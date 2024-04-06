"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SelectedTextContextType {
  selectedText: string;
  setSelectedText: React.Dispatch<React.SetStateAction<string>>;
  selectedTextId: number | null;
  setSelectedTextId: React.Dispatch<React.SetStateAction<number | null>>;
}

const SelectedTextContext = createContext<SelectedTextContextType | undefined>(undefined);

export const useSelectedText = () => {
  const context = useContext(SelectedTextContext);
  if (!context) {
    throw new Error('useSelectedText must be used within a SelectedTextProvider');
  }
  return context;
};

interface SelectedTextProviderProps {
  children: ReactNode;
}

export const SelectedTextProvider: React.FC<SelectedTextProviderProps> = ({ children }) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null);

  return (
    <SelectedTextContext.Provider value={{ selectedText, setSelectedText, selectedTextId, setSelectedTextId }}>
      {children}
    </SelectedTextContext.Provider>
  );
};
