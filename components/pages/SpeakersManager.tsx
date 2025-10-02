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
    Award,
    X,
    RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';

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
    const { currentYearData, loading: yearLoading, refreshYears } = useYear();
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        bio: '',
        keyNote: ''
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [removePhoto, setRemovePhoto] = useState(false);

    // Fetch speakers when currentYearData changes
    useEffect(() => {
        if (currentYearData) {
            console.log('Current year changed:', currentYearData.name, currentYearData.id);
            fetchSpeakers();
        } else {
            setSpeakers([]);
            setLoading(false);
        }
    }, [currentYearData]);

    const fetchSpeakers = async () => {
        if (!currentYearData) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching speakers for year:', currentYearData.id);
            const response = await api.getSpeakers(currentYearData.id);

            if (response.error) {
                toast.error(response.error);
            } else {
                setSpeakers(response.data || []);
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

        if (!currentYearData) {
            toast.error('No year selected');
            return;
        }

        setFormLoading(true);

        try {
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('title', formData.title);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('keyNote', formData.keyNote);
            formDataToSend.append('yearId', currentYearData.id); // Use dynamic year ID

            // Handle photo
            if (photoFile) {
                formDataToSend.append('photo', photoFile);
            }

            if (removePhoto && editingSpeaker?.photoUrl) {
                formDataToSend.append('removePhoto', 'true');
            }

            let response;
            if (editingSpeaker) {
                response = await api.updateSpeakerWithPhoto(editingSpeaker.id, formDataToSend);
            } else {
                response = await api.createSpeakerWithPhoto(formDataToSend);
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

    const handleFileSelect = (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please select an image (JPEG, PNG, GIF, WebP).');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size too large. Maximum size is 5MB.');
            return;
        }

        setPhotoFile(file);
        setRemovePhoto(false);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview('');
        setRemovePhoto(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            bio: '',
            keyNote: ''
        });
        setPhotoFile(null);
        setPhotoPreview('');
        setRemovePhoto(false);
    };

    const openEditForm = (speaker: Speaker) => {
        setEditingSpeaker(speaker);
        setFormData({
            name: speaker.name,
            title: speaker.title || '',
            bio: speaker.bio || '',
            keyNote: speaker.keyNote || ''
        });
        setPhotoPreview(speaker.photoUrl || '');
        setRemovePhoto(false);
        setShowForm(true);
    };

    const openAddForm = () => {
        if (!currentYearData) {
            toast.error('Please select a year first');
            return;
        }

        setEditingSpeaker(null);
        resetForm();
        setShowForm(true);
    };

    const filteredSpeakers = speakers.filter(speaker =>
        speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (speaker.title && speaker.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Show loading state when year is loading
    if (yearLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <LoadingSpinner size="lg" />
                <span className="text-gray-600 text-lg">Loading year information...</span>
            </div>
        );
    }

    // Show message if no year is available
    if (!currentYearData) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <User className="w-16 h-16 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800">No Event Year Found</h2>
                <p className="text-gray-600 text-center max-w-md">
                    No event year has been set up yet. Please run the database seeder or create a year in the admin panel first.
                </p>
                <button
                    onClick={refreshYears}
                    className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                >
                    <RefreshCw className="w-5 h-5" />
                    <span>Refresh</span>
                </button>
            </div>
        );
    }

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
                    <p className="text-gray-600 mt-2">
                        Managing speakers for AWS Community Day {currentYearData.name}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={refreshYears}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={openAddForm}
                        className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Speaker</span>
                    </button>
                </div>
            </div>

            {/* Year Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-aws-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Y</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">
                                Currently managing: <span className="text-aws-primary">AWS Community Day {currentYearData.name}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                                Year ID: {currentYearData.id.slice(-8)}...
                            </p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        {speakers.length} speaker{speakers.length !== 1 ? 's' : ''} found
                    </div>
                </div>
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
                        className="w-full pl-10 text-gray-700 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Speakers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpeakers.map((speaker) => (
                    <div key={speaker.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="relative h-48 bg-gray-200">
                            {speaker.photoUrl ? (
                                <Image
                                    src={speaker.photoUrl}
                                    alt={speaker.name}
                                    fill
                                    className="object-cover"
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
                            onClick={openAddForm}
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
                        <h2 className="text-xl text-gray-700 font-bold mb-4">
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
                                    className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
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
                                    className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
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
                                    className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                />
                            </div>

                            {/* Year Info (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Year
                                </label>
                                <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-700">
                                    AWS Community Day {currentYearData.name}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Speaker is automatically associated with the current event year
                                </p>
                            </div>

                            {/* Photo Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Speaker Photo
                                </label>
                                <div className="space-y-4">
                                    {/* Photo Preview */}
                                    {(photoPreview || (editingSpeaker?.photoUrl && !removePhoto)) && (
                                        <div className="relative inline-block">
                                            <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                                                <Image
                                                    src={photoPreview || editingSpeaker?.photoUrl || ''}
                                                    alt="Speaker preview"
                                                    width={128}
                                                    height={128}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* File Upload */}
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(file);
                                            }}
                                            className="hidden"
                                            id="photo-upload"
                                        />
                                        <label
                                            htmlFor="photo-upload"
                                            className="flex items-center text-gray-700 space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-aws-primary hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Upload className="w-5 h-5" />
                                            <span>Choose Photo</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">
                                            JPEG, PNG, GIF, WebP. Max 5MB.
                                        </p>
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
                                    className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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