"use client"
import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Move,
  Image as ImageIcon,
  Grid,
  List
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GalleryImage {
  id: string;
  url: string;
  caption: { en: string; fr: string };
  alt: { en: string; fr: string };
  category: string;
  uploadDate: string;
  order: number;
  published: boolean;
}

export default function GalleryManager() {
  const { t, currentLanguage } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  // Mock data
  const [images, setImages] = useState<GalleryImage[]>([
    {
      id: '1',
      url: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?w=400&h=300&fit=crop',
      caption: { 
        en: 'AWS Community Day 2024 Opening Ceremony', 
        fr: 'Cérémonie d\'Ouverture AWS Community Day 2024' 
      },
      alt: { 
        en: 'Attendees at the opening ceremony', 
        fr: 'Participants à la cérémonie d\'ouverture' 
      },
      category: 'event',
      uploadDate: '2024-12-01',
      order: 1,
      published: true
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?w=400&h=300&fit=crop',
      caption: { 
        en: 'Keynote Speaker Presentation', 
        fr: 'Présentation du Conférencier Principal' 
      },
      alt: { 
        en: 'Speaker presenting on stage', 
        fr: 'Conférencier présentant sur scène' 
      },
      category: 'speakers',
      uploadDate: '2024-12-01',
      order: 2,
      published: true
    },
    {
      id: '3',
      url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=400&h=300&fit=crop',
      caption: { 
        en: 'Networking Session', 
        fr: 'Session de Réseautage' 
      },
      alt: { 
        en: 'People networking at the event', 
        fr: 'Personnes en réseautage lors de l\'événement' 
      },
      category: 'networking',
      uploadDate: '2024-11-30',
      order: 3,
      published: false
    },
    {
      id: '4',
      url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?w=400&h=300&fit=crop',
      caption: { 
        en: 'Technical Workshop', 
        fr: 'Atelier Technique' 
      },
      alt: { 
        en: 'Participants in a hands-on workshop', 
        fr: 'Participants dans un atelier pratique' 
      },
      category: 'workshops',
      uploadDate: '2024-11-29',
      order: 4,
      published: true
    }
  ]);

  const categories = ['all', 'event', 'speakers', 'networking', 'workshops', 'venue'];

  const filteredImages = images.filter(image => {
    const matchesSearch = image.caption[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.alt[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const togglePublished = (id: string) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, published: !img.published } : img
    ));
  };

  const handleBulkUpload = () => {
    // Placeholder for bulk upload functionality
    console.log('Bulk upload triggered');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('nav.gallery')}</h1>
          <p className="text-gray-600 mt-2">Manage images for your event gallery</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBulkUpload}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
          >
            <Plus className="w-5 h-5" />
            <span>Add Image</span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-aws-primary text-white'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-aws-primary text-white'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div key={image.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.alt[currentLanguage]}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div className="absolute top-3 right-3 flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    image.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {image.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-black/50 text-white px-2 py-1 text-xs rounded-full">
                    #{image.order}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <p className="font-medium text-gray-800 mb-1 line-clamp-2">
                  {image.caption[currentLanguage]}
                </p>
                <p className="text-sm text-gray-500 capitalize mb-3">
                  {image.category}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingImage(image);
                        setShowForm(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Move className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => togglePublished(image.id)}
                    className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                      image.published
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {image.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredImages.map((image) => (
              <div key={image.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <img
                    src={image.url}
                    alt={image.alt[currentLanguage]}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 mb-1">
                      {image.caption[currentLanguage]}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize mb-1">{image.category}</p>
                    <p className="text-xs text-gray-400">{image.uploadDate}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      image.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {image.published ? 'Published' : 'Draft'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingImage(image);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No images found' : 'No images yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Upload your first image to get started'
            }
          </p>
          {!(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
            >
              Add First Image
            </button>
          )}
        </div>
      )}

      {/* Form Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingImage ? 'Edit Image' : 'Add New Image'}
            </h2>
            <p className="text-gray-600 mb-4">Image form implementation would go here...</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingImage(null);
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