"use client";

import React, { useState } from 'react';
import Image from "next/image"; // ✅ Import Next.js Image
import { useAuth } from '@/contexts/AuthContext';
import {
    Menu,
    Globe,
    Bell,
    Search,
    LogOut,
    User,
    ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
}

export default function Header({ toggleSidebar }: HeaderProps) {
    const { user, logout } = useAuth();
    const { currentLanguage, setLanguage } = useLanguage();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search Bar */}
                    <div className="relative hidden md:block">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search content..."
                            className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Language Selector */}
                    <div className="relative">
                        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-aws-primary rounded-lg hover:bg-gray-100 transition-colors">
                            <Globe className="w-4 h-4" />
                            <span>{currentLanguage === 'en' ? 'English' : 'Français'}</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50 hidden group-hover:block">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${currentLanguage === 'en' ? 'bg-aws-primary/10 text-aws-primary' : 'text-gray-700'}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLanguage('fr')}
                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${currentLanguage === 'fr' ? 'bg-aws-primary/10 text-aws-primary' : 'text-gray-700'}`}
                            >
                                Français
                            </button>
                        </div>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-aws-secondary rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Image
                                src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=40&h=40&fit=crop'}
                                alt={user?.name || "User Avatar"}
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                            />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <User className="w-4 h-4" />
                                        <span>Profile</span>
                                    </button>
                                    <hr className="my-1" />
                                    <button
                                        onClick={logout}
                                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
