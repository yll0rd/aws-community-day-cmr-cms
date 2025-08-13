"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  User,
  Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AgendaItem {
  id: string;
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  startTime: string;
  endTime: string;
  date: string;
  speaker?: string;
  location: string;
  type: 'keynote' | 'session' | 'break' | 'networking';
  published: boolean;
}

export default function AgendaManager() {
  const { t, currentLanguage } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [selectedDate, setSelectedDate] = useState('2025-03-15');

  // Mock data
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    {
      id: '1',
      title: { en: 'Registration & Welcome Coffee', fr: 'Inscription & Café de Bienvenue' },
      description: { en: 'Check-in and networking', fr: 'Enregistrement et réseautage' },
      startTime: '08:00',
      endTime: '09:00',
      date: '2025-03-15',
      location: 'Main Lobby',
      type: 'networking',
      published: true
    },
    {
      id: '2',
      title: { en: 'Opening Keynote: The Future of Cloud in Africa', fr: 'Keynote d\'Ouverture: L\'Avenir du Cloud en Afrique' },
      description: { en: 'Explore how cloud computing is transforming businesses across Africa', fr: 'Explorez comment l\'informatique en nuage transforme les entreprises à travers l\'Afrique' },
      startTime: '09:00',
      endTime: '10:00',
      date: '2025-03-15',
      speaker: 'Dr. Sarah Johnson',
      location: 'Main Auditorium',
      type: 'keynote',
      published: true
    },
    {
      id: '3',
      title: { en: 'Building Serverless Applications with AWS Lambda', fr: 'Construire des Applications Sans Serveur avec AWS Lambda' },
      description: { en: 'Learn how to build scalable serverless applications', fr: 'Apprenez à construire des applications sans serveur évolutives' },
      startTime: '10:30',
      endTime: '11:30',
      date: '2025-03-15',
      speaker: 'Michael Chen',
      location: 'Room A',
      type: 'session',
      published: true
    },
    {
      id: '4',
      title: { en: 'Coffee Break', fr: 'Pause Café' },
      description: { en: 'Networking break', fr: 'Pause réseautage' },
      startTime: '11:30',
      endTime: '12:00',
      date: '2025-03-15',
      location: 'Main Lobby',
      type: 'break',
      published: true
    }
  ]);

  const filteredItems = agendaItems
    .filter(item => item.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getTypeColor = (type: AgendaItem['type']) => {
    switch (type) {
      case 'keynote':
        return 'bg-aws-secondary text-white';
      case 'session':
        return 'bg-blue-100 text-blue-800';
      case 'break':
        return 'bg-gray-100 text-gray-800';
      case 'networking':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

//   const getTypeIcon = (type: AgendaItem['type']) => {
//     switch (type) {
//       case 'keynote':
//       case 'session':
//         return User;
//       case 'break':
//       case 'networking':
//         return Calendar;
//       default:
//         return Calendar;
//     }
//   };

  const handleDelete = (id: string) => {
    setAgendaItems(prev => prev.filter(item => item.id !== id));
  };

  const togglePublished = (id: string) => {
    setAgendaItems(prev => prev.map(item => 
      item.id === id ? { ...item, published: !item.published } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('nav.agenda')}</h1>
          <p className="text-gray-600 mt-2">Manage your event schedule and sessions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
        >
          <Plus className="w-5 h-5" />
          <span>Add Agenda Item</span>
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Event Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
          />
          <div className="text-sm text-gray-500">
            {filteredItems.length} items scheduled
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Event Schedule</h2>
          <p className="text-sm text-gray-600">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredItems.map((item) => {
            // const TypeIcon = getTypeIcon(item.type);
            return (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Time */}
                  <div className="flex-shrink-0 text-center">
                    <div className="text-sm font-medium text-gray-800">
                      {item.startTime}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.endTime}
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-auto mt-2"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.title[currentLanguage]}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                          {!item.published && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-3">
                          {item.description[currentLanguage]}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {item.speaker && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{item.speaker}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="w-4 h-4" />
                            <span>Bilingual</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowForm(true);
                          }}
                          className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => togglePublished(item.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            item.published
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {item.published ? 'Published' : 'Publish'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No agenda items</h3>
            <p className="text-gray-600 mb-6">Add items to your event schedule</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
            >
              Add First Item
            </button>
          </div>
        )}
      </div>

      {/* Form Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit Agenda Item' : 'Add New Agenda Item'}
            </h2>
            <p className="text-gray-600 mb-4">Agenda form implementation would go here...</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-aws-primary text-white rounded-lg hover:bg-aws-primary/90">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}