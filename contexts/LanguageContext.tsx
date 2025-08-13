"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.hero': 'Hero Banners',
    'nav.speakers': 'Speakers',
    'nav.agenda': 'Agenda',
    'nav.gallery': 'Gallery',
    'nav.sponsors': 'Sponsors',
    'nav.organizers': 'Organizers',
    'nav.venue': 'Venue',
    'nav.contact': 'Contact',
    'nav.settings': 'Settings',
    'nav.users': 'Users',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.upload': 'Upload',
    'common.preview': 'Preview',
    'common.publish': 'Publish',
    'common.draft': 'Draft',
    
    // Auth
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.welcome': 'Welcome to AWS Community Day CMS',
    'auth.signin': 'Sign in to manage your event content',
    
    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.overview': 'Content Overview',
    'dashboard.recent': 'Recent Updates',
    
    // Hero
    'hero.title': 'Hero Banners',
    'hero.add': 'Add Hero Banner',
    'hero.upload': 'Upload Images',
    
    // Speakers
    'speakers.title': 'Speakers',
    'speakers.add': 'Add Speaker',
    'speakers.name': 'Name',
    'speakers.title_field': 'Title',
    'speakers.bio': 'Biography',
    'speakers.keynote': 'Keynote Speaker',
    
    // Languages
    'lang.en': 'English',
    'lang.fr': 'Français',
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.hero': 'Bannières Hero',
    'nav.speakers': 'Intervenants',
    'nav.agenda': 'Programme',
    'nav.gallery': 'Galerie',
    'nav.sponsors': 'Sponsors',
    'nav.organizers': 'Organisateurs',
    'nav.venue': 'Lieu',
    'nav.contact': 'Contact',
    'nav.settings': 'Paramètres',
    'nav.users': 'Utilisateurs',
    
    // Common
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.add': 'Ajouter',
    'common.upload': 'Télécharger',
    'common.preview': 'Aperçu',
    'common.publish': 'Publier',
    'common.draft': 'Brouillon',
    
    // Auth
    'auth.login': 'Connexion',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.welcome': 'Bienvenue sur le CMS AWS Community Day',
    'auth.signin': 'Connectez-vous pour gérer le contenu de votre événement',
    
    // Dashboard
    'dashboard.welcome': 'Bon retour',
    'dashboard.overview': 'Aperçu du contenu',
    'dashboard.recent': 'Mises à jour récentes',
    
    // Hero
    'hero.title': 'Bannières Hero',
    'hero.add': 'Ajouter une bannière',
    'hero.upload': 'Télécharger des images',
    
    // Speakers
    'speakers.title': 'Intervenants',
    'speakers.add': 'Ajouter un intervenant',
    'speakers.name': 'Nom',
    'speakers.title_field': 'Titre',
    'speakers.bio': 'Biographie',
    'speakers.keynote': 'Conférencier principal',
    
    // Languages
    'lang.en': 'English',
    'lang.fr': 'Français',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('aws-cms-language', lang);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}