"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Link, 
  Save, 
  Eye,
  Globe,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';

interface EventSettings {
  id: string;
  eventDate: string;
  registrationUrl: string;
  volunteerApplicationUrl: string;
  speakerApplicationUrl: string;
  sponsorApplicationUrl: string;
  eventDescription: { en: string; fr: string };
  eventLocation: string;
  maxAttendees: number;
  registrationDeadline: string;
  published: boolean;
}

export default function SettingsManager() {
  const { t, currentLanguage } = useLanguage();
  const { currentYear } = useYear();
  const [hasChanges, setHasChanges] = useState(false);

  // Mock data
  const [settings, setSettings] = useState<EventSettings>({
    id: '1',
    eventDate: '2025-03-15',
    registrationUrl: 'https://awscommunity.cm/register',
    volunteerApplicationUrl: 'https://awscommunity.cm/volunteer',
    speakerApplicationUrl: 'https://awscommunity.cm/speak',
    sponsorApplicationUrl: 'https://awscommunity.cm/sponsor',
    eventDescription: {
      en: 'Join us for AWS Community Day Cameroon 2025, the premier cloud computing event in Central Africa. Connect with fellow developers, learn from industry experts, and discover the latest AWS innovations.',
      fr: 'Rejoignez-nous pour AWS Community Day Cameroun 2025, l\'événement de cloud computing de premier plan en Afrique centrale. Connectez-vous avec d\'autres développeurs, apprenez des experts de l\'industrie et découvrez les dernières innovations AWS.'
    },
    eventLocation: 'Palais des Congrès de Yaoundé',
    maxAttendees: 500,
    registrationDeadline: '2025-03-10',
    published: true
  });

  const handleInputChange = (field: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleDescriptionChange = (lang: 'en' | 'fr', value: string) => {
    setSettings(prev => ({
      ...prev,
      eventDescription: {
        ...prev.eventDescription,
        [lang]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save logic would go here
    setHasChanges(false);
  };

  const togglePublished = () => {
    setSettings(prev => ({ ...prev, published: !prev.published }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('nav.settings')}</h1>
          <p className="text-gray-600 mt-2">Configure general event settings for {currentYear}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePublished}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              settings.published
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            {settings.published ? 'Published' : 'Draft'}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              hasChanges
                ? 'bg-aws-primary text-white hover:bg-aws-primary/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="date"
                    value={settings.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline
                </label>
                <input
                  type="date"
                  value={settings.registrationDeadline}
                  onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Location
                </label>
                <input
                  type="text"
                  value={settings.eventLocation}
                  onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  value={settings.maxAttendees}
                  onChange={(e) => handleInputChange('maxAttendees', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Description</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <span>English Description</span>
                  <Globe className="w-4 h-4 text-gray-400" />
                </label>
                <textarea
                  rows={4}
                  value={settings.eventDescription.en}
                  onChange={(e) => handleDescriptionChange('en', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                  placeholder="Enter event description in English..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.eventDescription.en.length} characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <span>French Description</span>
                  <Globe className="w-4 h-4 text-gray-400" />
                </label>
                <textarea
                  rows={4}
                  value={settings.eventDescription.fr}
                  onChange={(e) => handleDescriptionChange('fr', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                  placeholder="Entrez la description de l'événement en français..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {settings.eventDescription.fr.length} caractères
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application URLs */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Links</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration URL
                </label>
                <div className="relative">
                  <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="url"
                    value={settings.registrationUrl}
                    onChange={(e) => handleInputChange('registrationUrl', e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    placeholder="https://..."
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volunteer Application URL
                </label>
                <div className="relative">
                  <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="url"
                    value={settings.volunteerApplicationUrl}
                    onChange={(e) => handleInputChange('volunteerApplicationUrl', e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    placeholder="https://..."
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speaker Application URL
                </label>
                <div className="relative">
                  <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="url"
                    value={settings.speakerApplicationUrl}
                    onChange={(e) => handleInputChange('speakerApplicationUrl', e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    placeholder="https://..."
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsor Application URL
                </label>
                <div className="relative">
                  <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="url"
                    value={settings.sponsorApplicationUrl}
                    onChange={(e) => handleInputChange('sponsorApplicationUrl', e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    placeholder="https://..."
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings Preview</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  AWS Community Day Cameroon {currentYear}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {settings.eventDescription[currentLanguage]}
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p><strong>Date:</strong> {new Date(settings.eventDate).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {settings.eventLocation}</p>
                  <p><strong>Capacity:</strong> {settings.maxAttendees} attendees</p>
                  <p><strong>Registration Deadline:</strong> {new Date(settings.registrationDeadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={settings.registrationUrl}
                  className="flex items-center justify-center space-x-2 bg-aws-primary text-white px-4 py-3 rounded-lg hover:bg-aws-primary/90 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Register Now</span>
                </a>
                <a
                  href={settings.speakerApplicationUrl}
                  className="flex items-center justify-center space-x-2 bg-aws-secondary text-white px-4 py-3 rounded-lg hover:bg-aws-secondary/90 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Apply to Speak</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}