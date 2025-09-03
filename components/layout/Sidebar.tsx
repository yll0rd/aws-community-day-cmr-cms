"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useYear } from '../../contexts/YearContext';
import {
  LayoutDashboard,
  Image,
  Users,
  Calendar,
  ImageIcon,
  Award,
  UserCheck,
  MapPin,
  Mail,
  Settings,
  UserCog,
  ChevronDown,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', href: '/dashboard', icon: LayoutDashboard, translationKey: 'nav.dashboard' },
  { id: 'hero', href: '/hero', icon: Image, translationKey: 'nav.hero' },
  { id: 'speakers', href: '/speakers', icon: Users, translationKey: 'nav.speakers' },
  { id: 'agenda', href: '/agenda', icon: Calendar, translationKey: 'nav.agenda' },
  { id: 'gallery', href: '/gallery', icon: ImageIcon, translationKey: 'nav.gallery' },
  { id: 'sponsors', href: '/sponsors', icon: Award, translationKey: 'nav.sponsors' },
  { id: 'organizers', href: '/organizers', icon: UserCheck, translationKey: 'nav.organizers' },
  { id: 'venue', href: '/venue', icon: MapPin, translationKey: 'nav.venue' },
  { id: 'contact', href: '/contact', icon: Mail, translationKey: 'nav.contact' },
  { id: 'settings', href: '/settings', icon: Settings, translationKey: 'nav.settings' },
  { id: 'users', href: '/users', icon: UserCog, translationKey: 'nav.users', adminOnly: true },
] as const;

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentYear, setYear, availableYears } = useYear();
  const pathname = usePathname();

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-aws-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AWS</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Community CMS</h1>
                <p className="text-xs text-gray-500">Cameroon 2025</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Year Selector */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <select
                value={currentYear}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-aws-secondary focus:border-transparent appearance-none cursor-pointer"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    AWS Community Day {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-aws-primary text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-aws-primary'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{t(item.translationKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=40&h=40&fit=crop'}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}