import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Move, 
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroBanner {
  id: string;
  title: { en: string; fr: string };
  subtitle: { en: string; fr: string };
  image: string;
  ctaText: { en: string; fr: string };
  ctaLink: string;
  order: number;
  published: boolean;
}

export default function HeroManager() {
  const { t, currentLanguage } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Mock data
  const [banners, setBanners] = useState<HeroBanner[]>([
    {
      id: '1',
      title: { en: 'AWS Community Day Cameroon 2025', fr: 'Journée Communautaire AWS Cameroun 2025' },
      subtitle: { en: 'Join us for the biggest cloud event', fr: 'Rejoignez-nous pour le plus grand événement cloud' },
      image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?w=800&h=400&fit=crop',
      ctaText: { en: 'Register Now', fr: 'S\'inscrire Maintenant' },
      ctaLink: '#register',
      order: 1,
      published: true
    },
    {
      id: '2',
      title: { en: 'Learn from Industry Experts', fr: 'Apprenez des Experts de l\'Industrie' },
      subtitle: { en: 'World-class speakers and sessions', fr: 'Conférenciers et sessions de classe mondiale' },
      image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?w=800&h=400&fit=crop',
      ctaText: { en: 'View Speakers', fr: 'Voir les Intervenants' },
      ctaLink: '#speakers',
      order: 2,
      published: true
    }
  ]);

  const handleSave = (banner: Partial<HeroBanner>) => {
    if (editingBanner) {
      setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...banner } : b));
    } else {
      const newBanner: HeroBanner = {
        id: Date.now().toString(),
        title: banner.title || { en: '', fr: '' },
        subtitle: banner.subtitle || { en: '', fr: '' },
        image: banner.image || '',
        ctaText: banner.ctaText || { en: '', fr: '' },
        ctaLink: banner.ctaLink || '',
        order: banners.length + 1,
        published: false
      };
      setBanners(prev => [...prev, newBanner]);
    }
    setShowForm(false);
    setEditingBanner(null);
  };

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const togglePublished = (id: string) => {
    setBanners(prev => prev.map(b => 
      b.id === id ? { ...b, published: !b.published } : b
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('hero.title')}</h1>
          <p className="text-gray-600 mt-2">Manage hero banners for your event website</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            <span>{t('hero.upload')}</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-aws-primary text-white px-4 py-2 rounded-lg hover:bg-aws-primary/90"
          >
            <Plus className="w-4 h-4" />
            <span>{t('hero.add')}</span>
          </button>
        </div>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* Banner Image */}
            <div className="relative h-48 bg-gray-200">
              <img
                src={banner.image}
                alt={banner.title[currentLanguage]}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  banner.published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {banner.published ? 'Published' : 'Draft'}
                </span>
                <div className="bg-black/50 px-2 py-1 rounded-full">
                  <span className="text-white text-xs">#{banner.order}</span>
                </div>
              </div>
            </div>

            {/* Banner Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                {banner.title[currentLanguage]}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {banner.subtitle[currentLanguage]}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{banner.ctaText[currentLanguage]}</span>
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>Bilingual</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingBanner(banner);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Move className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePublished(banner.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      banner.published
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {banner.published ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {banners.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No hero banners yet</h3>
          <p className="text-gray-600 mb-6">Create your first hero banner to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
          >
            {t('hero.add')}
          </button>
        </div>
      )}

      {/* Form Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
            </h2>
            <p className="text-gray-600 mb-4">Form implementation would go here...</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBanner(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave({})}
                className="px-4 py-2 bg-aws-primary text-white rounded-lg hover:bg-aws-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}