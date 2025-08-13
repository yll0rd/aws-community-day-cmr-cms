"use client";

import Dashboard from "@/components/Dashboard";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading } = useAuth();

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

  return user ? <Dashboard /> : <LoginForm />;
}
