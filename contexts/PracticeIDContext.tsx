"use client";

import React, { createContext, useContext, useState } from 'react';

interface PracticeIDContextType {
  practiceId: number | null;
  updatePracticeId: (id: number | null) => void;
}

const PracticeIDContext = createContext<PracticeIDContextType | undefined>(undefined);

export const usePracticeID = () => {
  const context = useContext(PracticeIDContext);
  if (!context) {
    throw new Error('usePracticeID must be used within a PracticeIDProvider');
  }
  return context;
};

interface PracticeIDProviderProps {
  children: React.ReactNode;
}

export const PracticeIDProvider: React.FC<PracticeIDProviderProps> = ({ children }) => {
  const [practiceId, setPracticeId] = useState<number | null>(null);

  const updatePracticeId = (id: number | null) => {
    setPracticeId(id);
  };

  return (
    <PracticeIDContext.Provider value={{ practiceId, updatePracticeId }}>
      {children}
    </PracticeIDContext.Provider>
  );
};
