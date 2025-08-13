import React from 'react';
import {
  Users,
  Calendar,
  Image,
  Award,
  TrendingUp,
  Eye,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardHome() {
  const { t } = useLanguage();
  const { currentYear } = useYear();
  const { user } = useAuth();

  const stats = [
    {
      title: 'Speakers',
      value: '24',
      change: '+3',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Agenda Items',
      value: '18',
      change: '+2',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Gallery Images',
      value: '156',
      change: '+12',
      icon: Image,
      color: 'bg-purple-500'
    },
    {
      title: 'Sponsors',
      value: '8',
      change: '+1',
      icon: Award,
      color: 'bg-aws-secondary'
    }
  ];

  const recentActivity = [
    {
      action: 'Speaker added',
      item: 'Dr. Sarah Johnson',
      time: '2 hours ago',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      action: 'Gallery updated',
      item: '5 new images',
      time: '4 hours ago',
      icon: Image,
      color: 'text-purple-500'
    },
    {
      action: 'Sponsor added',
      item: 'Tech Corp Inc.',
      time: '1 day ago',
      icon: Award,
      color: 'text-aws-secondary'
    },
    {
      action: 'Agenda updated',
      item: 'Keynote timing',
      time: '2 days ago',
      icon: Calendar,
      color: 'text-green-500'
    }
  ];

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
              AWS Community Day Cameroon {currentYear}
            </p>
            <p className="text-blue-200 mt-2">
              Manage your event content and track progress from here.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-aws-secondary" />
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
                    <span className="text-green-500 text-sm font-medium">{stat.change}</span>
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

      {/* Content Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {t('dashboard.overview')}
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Hero Banners</p>
                  <p className="text-sm text-gray-600">3 published</p>
                </div>
              </div>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Speakers</p>
                  <p className="text-sm text-gray-600">2 pending approval</p>
                </div>
              </div>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Venue</p>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
              </div>
              <Eye className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {t('dashboard.recent')}
          </h2>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                  </div>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
