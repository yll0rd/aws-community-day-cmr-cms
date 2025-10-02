"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface Year {
    id: string;
    name: string;
    createdAt: string;
}

interface YearContextType {
    currentYear: number;
    currentYearData: Year | null;
    setYear: (yearId: string) => void;
    availableYears: Year[];
    loading: boolean;
    refreshYears: () => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: ReactNode }) {
    const [currentYearData, setCurrentYearData] = useState<Year | null>(null);
    const [availableYears, setAvailableYears] = useState<Year[]>([]);
    const [loading, setLoading] = useState(true);

    // For backward compatibility - derive the number from the year name
    const currentYear = currentYearData ? parseInt(currentYearData.name) : 2025;

    const fetchYears = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching years...');
            const response = await api.getYears();

            console.log('📊 Years response:', response);

            // Handle different response formats
            let years: Year[] = [];

            if (Array.isArray(response)) {
                // Direct array response
                years = response;
            } else if (response.data && Array.isArray(response.data)) {
                // Response with { data: array } format
                years = response.data;
            } else if (response.data && response.data.years && Array.isArray(response.data.years)) {
                // Response with { data: { years: array } } format
                years = response.data.years;
            }

            console.log('📅 Processed years:', years);

            if (years.length > 0) {
                setAvailableYears(years);

                // Try to get saved year from localStorage, or use the most recent
                const savedYearId = localStorage.getItem('aws-cms-year-id');
                const savedYear = years.find(year => year.id === savedYearId);

                if (savedYear) {
                    setCurrentYearData(savedYear);
                    console.log('✅ Using saved year:', savedYear.name);
                } else {
                    // Use the most recent year (first in sorted list)
                    setCurrentYearData(years[0]);
                    localStorage.setItem('aws-cms-year-id', years[0].id);
                    console.log('✅ Using most recent year:', years[0].name);
                }
            } else {
                console.warn('❌ No years found in database');
                setAvailableYears([]);
                setCurrentYearData(null);
            }
        } catch (error) {
            console.error('❌ Error fetching years:', error);
            setAvailableYears([]);
            setCurrentYearData(null);
        } finally {
            setLoading(false);
        }
    };

    const setYear = (yearId: string) => {
        const year = availableYears.find(y => y.id === yearId);
        if (year) {
            setCurrentYearData(year);
            localStorage.setItem('aws-cms-year-id', yearId);
            console.log('🎯 Year changed to:', year.name);
        }
    };

    const refreshYears = () => {
        fetchYears();
    };

    useEffect(() => {
        fetchYears();
    }, []);

    return (
        <YearContext.Provider value={{
            currentYear,
            currentYearData,
            setYear,
            availableYears,
            loading,
            refreshYears
        }}>
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