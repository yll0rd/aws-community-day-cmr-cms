import React, { useState } from 'react';
import { 
  MapPin, 
  Edit, 
  Upload, 
  Image as ImageIcon,
  Phone,
  Globe,
  Navigation
} from 'lucide-react';

interface Venue {
  id: string;
  name: { en: string; fr: string };
  address: { en: string; fr: string };
  description: { en: string; fr: string };
  images: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  accessibility: { en: string; fr: string };
  parking: { en: string; fr: string };
  publicTransport: { en: string; fr: string };
  capacity: number;
  published: boolean;
}

export default function VenueManager() {
  const { t, currentLanguage } = useLanguage();
  const [showForm, setShowForm] = useState(false);

  // Mock data (usually there would be only one venue)
  const [venue, setVenue] = useState<Venue>({
    id: '1',
    name: { 
      en: 'Palais des Congrès de Yaoundé', 
      fr: 'Palais des Congrès de Yaoundé' 
    },
    address: { 
      en: 'Boulevard du 20 Mai, Yaoundé, Cameroon', 
      fr: 'Boulevard du 20 Mai, Yaoundé, Cameroun' 
    },
    description: { 
      en: 'Modern conference center in the heart of Yaoundé with state-of-the-art facilities and excellent connectivity.',
      fr: 'Centre de conférences moderne au cœur de Yaoundé avec des installations de pointe et une excellente connectivité.'
    },
    images: [
      'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?w=600&h=400&fit=crop',
      'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?w=600&h=400&fit=crop',
      'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?w=600&h=400&fit=crop'
    ],
    coordinates: {
      lat: 3.866,
      lng: 11.522
    },
    contact: {
      phone: '+237 222 123 456',
      email: 'info@palaiscongrès.cm',
      website: 'https://palaiscongrès.cm'
    },
    accessibility: {
      en: 'Wheelchair accessible with elevators, ramps, and accessible restrooms throughout the facility.',
      fr: 'Accessible en fauteuil roulant avec ascenseurs, rampes et toilettes accessibles dans toute l\'installation.'
    },
    parking: {
      en: 'Free parking available for 200 vehicles with dedicated spaces for disabled visitors.',
      fr: 'Parking gratuit disponible pour 200 véhicules avec des places dédiées aux visiteurs handicapés.'
    },
    publicTransport: {
      en: 'Bus lines 12, 15, and 23 stop directly in front of the venue. Metro station 500m away.',
      fr: 'Les lignes de bus 12, 15 et 23 s\'arrêtent directement devant le lieu. Station de métro à 500m.'
    },
    capacity: 500,
    published: true
  });

  const handleSave = (updatedVenue: Partial<Venue>) => {
    setVenue(prev => ({ ...prev, ...updatedVenue }));
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('nav.venue')}</h1>
          <p className="text-gray-600 mt-2">Manage venue information and details</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
        >
          <Edit className="w-5 h-5" />
          <span>Edit Venue</span>
        </button>
      </div>

      {/* Venue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {venue.name[currentLanguage]}
                </h2>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{venue.address[currentLanguage]}</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                venue.published 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {venue.published ? 'Published' : 'Draft'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">
              {venue.description[currentLanguage]}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-aws-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-aws-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Capacity</p>
                  <p className="text-sm text-gray-600">{venue.capacity} attendees</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-aws-secondary/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-aws-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Languages</p>
                  <p className="text-sm text-gray-600">English • Français</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {venue.contact.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{venue.contact.phone}</span>
                </div>
              )}
              {venue.contact.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${venue.contact.email}`} className="text-aws-primary hover:underline">
                    {venue.contact.email}
                  </a>
                </div>
              )}
              {venue.contact.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={venue.contact.website} target="_blank" rel="noopener noreferrer" className="text-aws-primary hover:underline">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Accessibility & Transportation */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Practical Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">Accessibility</h4>
                <p className="text-sm text-gray-600">{venue.accessibility[currentLanguage]}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">Parking</h4>
                <p className="text-sm text-gray-600">{venue.parking[currentLanguage]}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">Public Transportation</h4>
                <p className="text-sm text-gray-600">{venue.publicTransport[currentLanguage]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Images and Map */}
        <div className="space-y-6">
          {/* Venue Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Venue Images</h3>
              <button className="flex items-center space-x-2 text-sm text-aws-primary hover:bg-aws-primary/10 px-3 py-1 rounded-lg transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {venue.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Venue image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg"></div>
                  <button className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              ))}
              
              <button className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-aws-primary hover:text-aws-primary transition-colors">
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Image</span>
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Location Map</h3>
              <button className="flex items-center space-x-2 text-sm text-aws-primary hover:bg-aws-primary/10 px-3 py-1 rounded-lg transition-colors">
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </button>
            </div>
            
            {/* Placeholder Map */}
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive map would be here</p>
                <p className="text-sm text-gray-400">Lat: {venue.coordinates.lat}, Lng: {venue.coordinates.lng}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Venue Information</h2>
            <p className="text-gray-600 mb-4">Venue form implementation would go here...</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave({})}
                className="px-4 py-2 bg-aws-primary text-white rounded-lg hover:bg-aws-primary/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Missing import
import { Users, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
