"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Defined the type for the context state
interface SelectedTextContextType {
  selectedText: string;
  setSelectedText: React.Dispatch<React.SetStateAction<string>>;
  selectedTextId: number | null;
  setSelectedTextId: React.Dispatch<React.SetStateAction<number | null>>;
}

// Created the context with an initial undefined value but specified the correct type
const SelectedTextContext = createContext<SelectedTextContextType | undefined>(undefined);

// Custom hook to use the context
export const useSelectedText = () => {
  const context = useContext(SelectedTextContext);
  if (!context) {
    throw new Error('useSelectedText must be used within a SelectedTextProvider');
  }
  return context;
};

// Defined the type for the props of the provider component
interface SelectedTextProviderProps {
  children: ReactNode;
}

// Function component with TypeScript: Use React.FC for functional components
export const SelectedTextProvider: React.FC<SelectedTextProviderProps> = ({ children }) => {
  // State initialisation with function to load from localStorage
  const [selectedText, setSelectedText] = useState<string>(() => {
    // Ensure localStorage is accessed only on the client-side
    if (typeof window !== 'undefined') {
      const storedSelectedText = localStorage.getItem('selectedText');
      return storedSelectedText !== null ? storedSelectedText : '';
    }
    return '';
  });

  const [selectedTextId, setSelectedTextId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const storedSelectedTextId = localStorage.getItem('selectedTextId');
      try {
        return storedSelectedTextId !== null ? JSON.parse(storedSelectedTextId) : null;
      }
      catch (error) {
        return null;
      }
    }
    return null;
  });

  // Effect hook to update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('selectedText', selectedText);
  }, [selectedText]);

  useEffect(() => {
    if (selectedTextId === null) {
      localStorage.removeItem('selectedTextId');
    } else {
      localStorage.setItem('selectedTextId', JSON.stringify(selectedTextId));
    }
  }, [selectedTextId]);

  return (
    <SelectedTextContext.Provider value={{ selectedText, setSelectedText, selectedTextId, setSelectedTextId }}>
      {children}
    </SelectedTextContext.Provider>
  );
};

