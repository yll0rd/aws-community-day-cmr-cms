"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { redirect } from "react-router";

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor';
    avatar?: string;
}

export interface Year {
    id: string;
    name: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    currentYear: Year | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    refreshYear: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [currentYear, setCurrentYear] = useState<Year | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.getMe();
            if (response.data?.user) {
                setUser({
                    ...response.data.user,
                    role: response.data.user.role.toLowerCase() as 'admin' | 'editor'
                });

                // Set current year if available in response
                if (response.data.currentYear) {
                    setCurrentYear(response.data.currentYear);
                } else {
                    // Fallback: fetch latest year if not in response
                    await fetchLatestYear();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestYear = async () => {
        try {
            const yearsResponse = await api.getYears();
            if (yearsResponse.data && yearsResponse.data.length > 0) {
                // Get the latest year (assuming they're ordered by creation date)
                const latestYear = yearsResponse.data[0];
                setCurrentYear(latestYear);
            }
        } catch (error) {
            console.error('Failed to fetch years:', error);
        }
    };

    const refreshYear = async () => {
        await fetchLatestYear();
    };

    const login = async (email: string, password: string): Promise<void> => {
        const response = await api.login(email, password);

        if (response.error) {
            throw new Error(response.error);
        }

        if (response.data?.user) {
            setUser({
                ...response.data.user,
                role: response.data.user.role.toLowerCase() as 'admin' | 'editor'
            });

            // Set current year from login response
            if (response.data.currentYear) {
                setCurrentYear(response.data.currentYear);
            } else {
                // Fallback: fetch latest year if not in response
                await fetchLatestYear();
            }

            toast.success('Login successful');
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setCurrentYear(null);
            toast.success('Logged out successfully');
            redirect('/');
            window.location.reload();
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            currentYear,
            login,
            logout,
            loading,
            refreshYear
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}