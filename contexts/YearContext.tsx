"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface YearContextType {
  currentYear: number;
  setYear: (year: number) => void;
  availableYears: number[];
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState(2025);
  const availableYears = [2024, 2025, 2026]; // This could be dynamic

  const setYear = (year: number) => {
    setCurrentYear(year);
    localStorage.setItem('aws-cms-year', year.toString());
  };

  return (
    <YearContext.Provider value={{ currentYear, setYear, availableYears }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
}