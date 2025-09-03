"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
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
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setLoading(false);
        }
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
            toast.success('Login successful');
        }
    };

    const logout = async () => {
        try {
            await api.logout();
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null); // Force logout even if API call fails
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
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