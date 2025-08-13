"use client";

import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
// import SpeakersManager from './pages/SpeakersManager';
import AgendaManager from './pages/AgendaManager';
// import SponsorsManager from './pages/SponsorsManager';
// import OrganizersManager from './pages/OrganizersManager';
import DashboardHome from './pages/DashboardHome';
import GalleryManager from './pages/GalleryManager';
import HeroManager from './pages/HeroManager';
import SettingsManager from './pages/SettingsManager';
import VenueManager from './pages/VenueManager';
import ContactManager from './pages/ContactManager';
import UsersManager from './pages/UsersManager';

export type ActiveSection = 
  | 'dashboard' 
  | 'hero' 
  | 'speakers' 
  | 'agenda' 
  | 'gallery' 
  | 'sponsors' 
  // | 'organizers' 
  | 'venue' 
  | 'contact' 
  | 'settings' 
  | 'users';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'hero':
        return <HeroManager />;
      // case 'speakers':
      //   return <SpeakersManager />;
      case 'agenda':
        return <AgendaManager />;
      case 'gallery':
        return <GalleryManager />;
      // case 'sponsors':
      //   return <SponsorsManager />;
      // case 'organizers':
      //   return <OrganizersManager />;
      case 'venue':
        return <VenueManager />;
      case 'contact':
        return <ContactManager />;
      case 'settings':
        return <SettingsManager />;
      case 'users':
        return <UsersManager />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}