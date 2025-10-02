// components/YearSelector.tsx
"use client";

import React, { useState } from 'react';
import { useYear } from '@/contexts/YearContext';
import { Calendar, ChevronDown } from 'lucide-react';
import LoadingSpinner from './ui/LoadingSpinner';

export default function YearSelector() {
    const { currentYearData, availableYears, setYear, loading } = useYear();
    const [isOpen, setIsOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center space-x-2 px-4 py-2 text-gray-600">
                <LoadingSpinner size="sm" />
                <span>Loading years...</span>
            </div>
        );
    }

    if (!currentYearData || availableYears.length === 0) {
        return (
            <div className="flex items-center space-x-2 px-4 py-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>No years available</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-800">
          {currentYearData.name}
        </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">
                                Select Year
                            </div>
                            {availableYears.map((year) => (
                                <button
                                    key={year.id}
                                    onClick={() => {
                                        setYear(year.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                        year.id === currentYearData.id
                                            ? 'bg-aws-primary text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {year.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}