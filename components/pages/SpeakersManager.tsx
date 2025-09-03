"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    User,
    Upload,
    Globe,
    Award
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Speaker {
    id: string;
    name: string;
    title?: string;
    bio?: string;
    photoUrl?: string;
    keyNote?: string;
    yearId: string;
    createdAt: string;
    updatedAt: string;
}

export default function SpeakersManager() {
    const { t, currentLanguage } = useLanguage();
    const { currentYear } = useYear();
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        bio: '',
        photoUrl: '',
        keyNote: ''
    });

    useEffect(() => {
        fetchSpeakers();
    }, [currentYear]);

    const fetchSpeakers = async () => {
        try {
            setLoading(true);
            // For now, we'll use a mock year ID since we need to implement year management
            const mockYearId = '507f1f77bcf86cd799439011';
            const response = await api.getSpeakers(mockYearId);

            if (response.error) {
                toast.error(response.error);
            } else {
                setSpeakers(response.data?.speakers || []);
            }
        } catch (error) {
            toast.error('Failed to fetch speakers');
            console.error('Error fetching speakers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const mockYearId = '507f1f77bcf86cd799439011';
            const speakerData = { ...formData, yearId: mockYearId };

            let response;
            if (editingSpeaker) {
                response = await api.updateSpeaker(editingSpeaker.id, speakerData);
            } else {
                response = await api.createSpeaker(speakerData);
            }

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success(editingSpeaker ? 'Speaker updated successfully' : 'Speaker created successfully');
                setShowForm(false);
                setEditingSpeaker(null);
                resetForm();
                fetchSpeakers();
            }
        } catch (error) {
            toast.error('Failed to save speaker');
            console.error('Error saving speaker:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this speaker?')) return;

        try {
            const response = await api.deleteSpeaker(id);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Speaker deleted successfully');
                fetchSpeakers();
            }
        } catch (error) {
            toast.error('Failed to delete speaker');
            console.error('Error deleting speaker:', error);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            const response = await api.uploadFile(file, 'speakers');
            if (response.error) {
                toast.error(response.error);
            } else {
                setFormData(prev => ({ ...prev, photoUrl: response.url }));
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            toast.error('Failed to upload image');
            console.error('Error uploading image:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            bio: '',
            photoUrl: '',
            keyNote: ''
        });
    };

    const openEditForm = (speaker: Speaker) => {
        setEditingSpeaker(speaker);
        setFormData({
            name: speaker.name,
            title: speaker.title || '',
            bio: speaker.bio || '',
            photoUrl: speaker.photoUrl || '',
            keyNote: speaker.keyNote || ''
        });
        setShowForm(true);
    };

    const filteredSpeakers = speakers.filter(speaker =>
        speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (speaker.title && speaker.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading speakers...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.speakers')}</h1>
                    <p className="text-gray-600 mt-2">Manage speakers for AWS Community Day {currentYear}</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingSpeaker(null);
                        setShowForm(true);
                    }}
                    className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Speaker</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search speakers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Speakers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpeakers.map((speaker) => (
                    <div key={speaker.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="relative h-48 bg-gray-200">
                            {speaker.photoUrl ? (
                                <img
                                    src={speaker.photoUrl}
                                    alt={speaker.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                            {speaker.keyNote && (
                                <div className="absolute top-3 left-3">
                  <span className="bg-aws-secondary text-white px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>Keynote</span>
                  </span>
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-1">{speaker.name}</h3>
                            {speaker.title && (
                                <p className="text-sm text-gray-600 mb-2">{speaker.title}</p>
                            )}
                            {speaker.bio && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{speaker.bio}</p>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => openEditForm(speaker)}
                                        className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(speaker.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Globe className="w-3 h-3" />
                                    <span>Profile</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredSpeakers.length === 0 && !loading && (
                <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {searchTerm ? 'No speakers found' : 'No speakers yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Add your first speaker to get started'
                        }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => {
                                resetForm();
                                setEditingSpeaker(null);
                                setShowForm(true);
                            }}
                            className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                        >
                            Add First Speaker
                        </button>
                    )}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSpeaker ? 'Edit Speaker' : 'Add New Speaker'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title/Position
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Biography
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Photo
                                </label>
                                <div className="flex items-center space-x-4">
                                    {formData.photoUrl && (
                                        <img
                                            src={formData.photoUrl}
                                            alt="Speaker photo"
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file);
                                            }}
                                            className="hidden"
                                            id="photo-upload"
                                        />
                                        <label
                                            htmlFor="photo-upload"
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Upload Photo</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Keynote Topic (if keynote speaker)
                                </label>
                                <input
                                    type="text"
                                    value={formData.keyNote}
                                    onChange={(e) => setFormData(prev => ({ ...prev, keyNote: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingSpeaker(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 bg-aws-primary text-white px-4 py-3 rounded-lg hover:bg-aws-primary/90 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {formLoading ? (
                                        <LoadingSpinner size="sm" />
                                    ) : (
                                        <span>{editingSpeaker ? 'Update Speaker' : 'Add Speaker'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}