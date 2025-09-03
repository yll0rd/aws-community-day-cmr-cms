"use client";

import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 border-4 border-aws-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-aws-primary font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    return <LoginForm />;
}
