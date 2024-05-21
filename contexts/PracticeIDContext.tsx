"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Defined the type for the context state
interface PracticeIDContextType {
  practiceId: number | null;
  setPracticeId: React.Dispatch<React.SetStateAction<number | null>>;
}

// Created the context with an initial undefined value but specified the correct type
const PracticeIDContext = createContext<PracticeIDContextType | undefined>(undefined);

// Custom hook to use the context
export const usePracticeID = () => {
  const context = useContext(PracticeIDContext);
  if (!context) {
    throw new Error('usePracticeID must be used within a PracticeIDProvider');
  }
  return context;
};

// Defined the type for the props of the provider component
interface PracticeIDProviderProps {
  children: ReactNode;
}

// Function component with TypeScript: Use React.FC for functional components
export const PracticeIDProvider: React.FC<PracticeIDProviderProps> = ({ children }) => {
  // State initialisation with function to load from localStorage
  const [practiceId, setPracticeId] = useState<number | null>(() => {
    // Ensure localStorage is accessed only on the client-side
    if (typeof window !== 'undefined') {
      const storedPracticeId = localStorage.getItem('practiceId');
      return storedPracticeId !== null ? JSON.parse(storedPracticeId) : null;
    }
    return null;
  });

  // Effect hook to update localStorage when state changes
  useEffect(() => {
    if (practiceId === null) {
      localStorage.removeItem('practiceId');
    } else {
      localStorage.setItem('practiceId', JSON.stringify(practiceId));
    }
  }, [practiceId]);

  return (
    <PracticeIDContext.Provider value={{ practiceId, setPracticeId }}>
      {children}
    </PracticeIDContext.Provider>
  );
};