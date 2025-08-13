import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactInfo {
  id: string;
  email: string;
  phone?: string;
  address: { en: string; fr: string };
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    email: string;
  };
  formConfiguration: {
    enabled: boolean;
    fields: string[];
    webhook?: string;
  };
  published: boolean;
}

export default function ContactManager() {
  const { t, currentLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    id: '1',
    email: 'contact@awscommunity.cm',
    phone: '+237 222 123 456',
    address: { 
      en: 'AWS Community Day Team, Yaoundé, Cameroon', 
      fr: 'Équipe AWS Community Day, Yaoundé, Cameroun' 
    },
    socialMedia: {
      twitter: '@AWSCameroon',
      linkedin: 'aws-user-group-cameroon',
      facebook: 'AWSCameroon',
      instagram: 'awscameroon'
    },
    emergencyContact: {
      name: 'Jean-Pierre Mvondo',
      phone: '+237 699 123 456',
      email: 'emergency@awscommunity.cm'
    },
    formConfiguration: {
      enabled: true,
      fields: ['name', 'email', 'subject', 'message'],
      webhook: 'https://hooks.zapier.com/hooks/catch/...'
    },
    published: true
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic would go here
  };

  const togglePublished = () => {
    setContactInfo(prev => ({ ...prev, published: !prev.published }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('nav.contact')}</h1>
          <p className="text-gray-600 mt-2">Manage contact information and form settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePublished}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              contactInfo.published
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            {contactInfo.published ? 'Published' : 'Draft'}
          </button>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
          >
            {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            <span>{isEditing ? 'Save Changes' : 'Edit Contact Info'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          {/* Primary Contact */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Primary Contact Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-aws-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-aws-primary" />
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                  />
                ) : (
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <a href={`mailto:${contactInfo.email}`} className="text-aws-primary hover:underline">
                      {contactInfo.email}
                    </a>
                  </div>
                )}
              </div>

              {contactInfo.phone && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-aws-secondary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-aws-secondary" />
                  </div>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    />
                  ) : (
                    <div>
                      <p className="font-medium text-gray-800">Phone</p>
                      <a href={`tel:${contactInfo.phone}`} className="text-gray-700">
                        {contactInfo.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Address (English)"
                      value={contactInfo.address.en}
                      onChange={(e) => setContactInfo(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, en: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Adresse (Français)"
                      value={contactInfo.address.fr}
                      onChange={(e) => setContactInfo(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, fr: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-800">Address</p>
                    <p className="text-gray-700">{contactInfo.address[currentLanguage]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h2>
            
            {contactInfo.emergencyContact && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Name</p>
                  <p className="text-gray-700">{contactInfo.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Phone</p>
                  <a href={`tel:${contactInfo.emergencyContact.phone}`} className="text-aws-primary hover:underline">
                    {contactInfo.emergencyContact.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Email</p>
                  <a href={`mailto:${contactInfo.emergencyContact.email}`} className="text-aws-primary hover:underline">
                    {contactInfo.emergencyContact.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Media</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(contactInfo.socialMedia).map(([platform, handle]) => (
                handle && (
                  <div key={platform} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{platform}</p>
                      <a href="#" className="text-sm text-aws-primary hover:underline">
                        {handle}
                      </a>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form Configuration */}
        <div className="space-y-6">
          {/* Form Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Form Configuration</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Enable Contact Form</p>
                  <p className="text-sm text-gray-600">Allow visitors to send messages through a form</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactInfo.formConfiguration.enabled}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      formConfiguration: {
                        ...prev.formConfiguration,
                        enabled: e.target.checked
                      }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-aws-secondary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aws-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Fields
                </label>
                <div className="space-y-2">
                  {['name', 'email', 'phone', 'subject', 'message', 'company'].map((field) => (
                    <label key={field} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={contactInfo.formConfiguration.fields.includes(field)}
                        onChange={(e) => {
                          const fields = e.target.checked
                            ? [...contactInfo.formConfiguration.fields, field]
                            : contactInfo.formConfiguration.fields.filter(f => f !== field);
                          setContactInfo(prev => ({
                            ...prev,
                            formConfiguration: {
                              ...prev.formConfiguration,
                              fields
                            }
                          }));
                        }}
                        className="rounded border-gray-300 text-aws-primary focus:ring-aws-secondary"
                      />
                      <span className="text-sm text-gray-700 capitalize">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={contactInfo.formConfiguration.webhook || ''}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      formConfiguration: {
                        ...prev.formConfiguration,
                        webhook: e.target.value
                      }
                    }))}
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                  />
                  <ExternalLink className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Webhook URL to receive form submissions
                </p>
              </div>
            </div>
          </div>

          {/* Form Preview */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Preview</h2>
            
            <div className="space-y-4">
              {contactInfo.formConfiguration.fields.includes('name') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
              )}
              {contactInfo.formConfiguration.fields.includes('email') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
              )}
              {contactInfo.formConfiguration.fields.includes('phone') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
              )}
              {contactInfo.formConfiguration.fields.includes('subject') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input type="text" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
              )}
              {contactInfo.formConfiguration.fields.includes('message') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea rows={4} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"></textarea>
                </div>
              )}
              
              <button disabled className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg cursor-not-allowed">
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}