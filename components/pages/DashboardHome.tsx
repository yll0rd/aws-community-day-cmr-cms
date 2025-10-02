"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    Image,
    Award,
    TrendingUp,
    Eye,
    Clock,
    CheckCircle,
    Building2,
    UserCheck,
    Mail,
    Settings,
    RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth'; // Your existing useAuth hook
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardData {
    stats: {
        speakers: number;
        agenda: number;
        gallery: number;
        sponsors: number;
        organizers: number;
        volunteers: number;
    };
    recentActivity: {
        action: string;
        item: string;
        time: string;
        type: 'speaker' | 'agenda' | 'gallery' | 'sponsor';
    }[];
    completionStatus: {
        venue: boolean;
        contact: boolean;
        settings: boolean;
        speakers: boolean;
        sponsors: boolean;
        agenda: boolean;
    };
    totals: {
        speakers: number;
        agenda: number;
        gallery: number;
        sponsors: number;
        organizers: number;
        volunteers: number;
    };
}

export default function DashboardHome() {
    const { t } = useLanguage();
    const { user, currentYear, loading: authLoading, refreshYear } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch dashboard data when currentYear changes
    useEffect(() => {
        if (currentYear) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [currentYear]);

    const fetchDashboardData = async () => {
        if (!currentYear) return;

        try {
            setLoading(true);
            const response = await api.getDashboardData(currentYear.id);

            if (response.error) {
                toast.error(response.error);
            } else {
                setDashboardData(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshYear(); // Refresh year first
        fetchDashboardData(); // Then refresh dashboard data
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'speaker':
                return Users;
            case 'agenda':
                return Calendar;
            case 'gallery':
                return Image;
            case 'sponsor':
                return Award;
            default:
                return TrendingUp;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'speaker':
                return 'text-blue-500';
            case 'agenda':
                return 'text-green-500';
            case 'gallery':
                return 'text-purple-500';
            case 'sponsor':
                return 'text-aws-secondary';
            default:
                return 'text-gray-500';
        }
    };

    const stats = dashboardData ? [
        {
            title: 'Speakers',
            value: dashboardData.stats.speakers?.toString() || '0',
            change: dashboardData.stats.speakers > 0 ? `+${dashboardData.stats.speakers}` : '0',
            icon: Users,
            color: 'bg-blue-500',
            total: dashboardData.totals.speakers || 0
        },
        {
            title: 'Agenda Items',
            value: dashboardData.stats.agenda?.toString() || '0',
            change: dashboardData.stats.agenda > 0 ? `+${dashboardData.stats.agenda}` : '0',
            icon: Calendar,
            color: 'bg-green-500',
            total: dashboardData.totals.agenda || 0
        },
        {
            title: 'Gallery Images',
            value: dashboardData.stats.gallery?.toString() || '0',
            change: dashboardData.stats.gallery > 0 ? `+${dashboardData.stats.gallery}` : '0',
            icon: Image,
            color: 'bg-purple-500',
            total: dashboardData.totals.gallery || 0
        },
        {
            title: 'Sponsors',
            value: dashboardData.stats.sponsors?.toString() || '0',
            change: dashboardData.stats.sponsors > 0 ? `+${dashboardData.stats.sponsors}` : '0',
            icon: Award,
            color: 'bg-aws-secondary',
            total: dashboardData.totals.sponsors || 0
        }
    ] : [];

    const completionItems = dashboardData ? [
        {
            title: 'Venue Information',
            completed: dashboardData.completionStatus?.venue || false,
            icon: Building2,
            description: dashboardData.completionStatus?.venue ? 'Complete' : 'Not configured',
            color: dashboardData.completionStatus?.venue ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
        },
        {
            title: 'Contact Information',
            completed: dashboardData.completionStatus?.contact || false,
            icon: Mail,
            description: dashboardData.completionStatus?.contact ? 'Complete' : 'Not configured',
            color: dashboardData.completionStatus?.contact ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
        },
        {
            title: 'Event Settings',
            completed: dashboardData.completionStatus?.settings || false,
            icon: Settings,
            description: dashboardData.completionStatus?.settings ? 'Complete' : 'Not configured',
            color: dashboardData.completionStatus?.settings ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
        },
        {
            title: 'Speakers',
            completed: dashboardData.completionStatus?.speakers || false,
            icon: Users,
            description: dashboardData.completionStatus?.speakers ? `${dashboardData.stats.speakers} added` : 'No speakers',
            color: dashboardData.completionStatus?.speakers ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
        },
        {
            title: 'Sponsors',
            completed: dashboardData.completionStatus?.sponsors || false,
            icon: Award,
            description: dashboardData.completionStatus?.sponsors ? `${dashboardData.stats.sponsors} added` : 'No sponsors',
            color: dashboardData.completionStatus?.sponsors ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
        },
        {
            title: 'Agenda',
            completed: dashboardData.completionStatus?.agenda || false,
            icon: Calendar,
            description: dashboardData.completionStatus?.agenda ? `${dashboardData.stats.agenda} items` : 'No agenda items',
            color: dashboardData.completionStatus?.agenda ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
        }
    ] : [];

    // Show loading state when auth is loading
    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <LoadingSpinner size="lg" />
                <span className="text-gray-600 text-lg">Loading authentication...</span>
            </div>
        );
    }

    // Show message if no year is available
    if (!currentYear) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <TrendingUp className="w-16 h-16 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800">No Event Year Found</h2>
                <p className="text-gray-600 text-center max-w-md">
                    No event year has been set up yet. Please run the database seeder or create a year in the admin panel first.
                </p>
                <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                >
                    <RefreshCw className="w-5 h-5" />
                    <span>Refresh</span>
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-aws-primary to-gray-800 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {t('dashboard.welcome')}, {user?.name}!
                        </h1>
                        <p className="text-blue-100 text-lg">
                            AWS Community Day {currentYear.name}
                        </p>
                        <p className="text-blue-200 mt-2">
                            Manage your event content and track progress from here.
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-16 h-16 text-aws-secondary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                                        <span className={`text-sm font-medium ${
                                            stat.total > 0 ? 'text-green-500' : 'text-gray-400'
                                        }`}>
                      {stat.change}
                    </span>
                                    </div>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Additional Stats */}
            {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Organizers</p>
                                <p className="text-2xl font-bold text-gray-800">{dashboardData.stats.organizers}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Volunteers</p>
                                <p className="text-2xl font-bold text-gray-800">{dashboardData.stats.volunteers}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Overview & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Completion Status */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Setup Progress
                    </h2>

                    <div className="space-y-4">
                        {completionItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{item.title}</p>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                    {item.completed ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-yellow-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Recent Activity
                        </h2>
                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {dashboardData?.recentActivity.length ? (
                            dashboardData.recentActivity.map((activity, index) => {
                                const Icon = getActivityIcon(activity.type);
                                const color = getActivityColor(activity.type);
                                return (
                                    <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                                            <Icon className={`w-4 h-4 ${color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">
                                                {activity.action}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate">{activity.item}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatTimeAgo(activity.time)}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8">
                                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No recent activity</p>
                                <p className="text-sm text-gray-400 mt-1">Activities will appear here as you manage content</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}