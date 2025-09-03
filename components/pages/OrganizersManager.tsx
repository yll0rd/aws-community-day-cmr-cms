"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    UserCheck,
    Upload,
    Building
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Organizer {
    id: string;
    name: string;
    affiliation: string;
    role: string;
    photoUrl?: string;
    yearId: string;
    createdAt: string;
    updatedAt: string;
}

export default function OrganizersManager() {
    const { t } = useLanguage();
    const { currentYear } = useYear();
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        affiliation: '',
        role: '',
        photoUrl: ''
    });

    useEffect(() => {
        fetchOrganizers();
    }, [currentYear]);

    const fetchOrganizers = async () => {
        try {
            setLoading(true);
            // Mock implementation - replace with actual API call
            setOrganizers([]);
        } catch (error) {
            toast.error('Failed to fetch organizers');
            console.error('Error fetching organizers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // Mock implementation
            toast.success(editingOrganizer ? 'Organizer updated successfully' : 'Organizer added successfully');
            setShowForm(false);
            setEditingOrganizer(null);
            resetForm();
            fetchOrganizers();
        } catch (error) {
            toast.error('Failed to save organizer');
            console.error('Error saving organizer:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this organizer?')) return;

        try {
            toast.success('Organizer removed successfully');
            fetchOrganizers();
        } catch (error) {
            toast.error('Failed to remove organizer');
            console.error('Error removing organizer:', error);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            const response = await api.uploadFile(file, 'organizers');
            if (response.error) {
                toast.error(response.error);
            } else {
                setFormData(prev => ({ ...prev, photoUrl: response.url }));
                toast.success('Photo uploaded successfully');
            }
        } catch (error) {
            toast.error('Failed to upload photo');
            console.error('Error uploading photo:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            affiliation: '',
            role: '',
            photoUrl: ''
        });
    };

    const filteredOrganizers = organizers.filter(organizer =>
        organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.affiliation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        organizer.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading organizers...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.organizers')}</h1>
                    <p className="text-gray-600 mt-2">Manage event organizing team</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingOrganizer(null);
                        setShowForm(true);
                    }}
                    className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Organizer</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search organizers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Organizers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrganizers.map((organizer) => (
                    <div key={organizer.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="relative h-48 bg-gray-200">
                            {organizer.photoUrl ? (
                                <img
                                    src={organizer.photoUrl}
                                    alt={organizer.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserCheck className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-1">{organizer.name}</h3>
                            <p className="text-sm text-aws-primary mb-1">{organizer.role}</p>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                                <Building className="w-3 h-3" />
                                <span>{organizer.affiliation}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingOrganizer(organizer);
                                            setFormData({
                                                name: organizer.name,
                                                affiliation: organizer.affiliation,
                                                role: organizer.role,
                                                photoUrl: organizer.photoUrl || ''
                                            });
                                            setShowForm(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(organizer.id)}
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

            {/* Empty State */}
            {filteredOrganizers.length === 0 && !loading && (
                <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {searchTerm ? 'No organizers found' : 'No organizers yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Add your first organizer to get started'
                        }
                    </p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingOrganizer ? 'Edit Organizer' : 'Add New Organizer'}
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
                                    Role *
                                </label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="e.g., Event Coordinator, Technical Lead"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Affiliation *
                                </label>
                                <input
                                    type="text"
                                    value={formData.affiliation}
                                    onChange={(e) => setFormData(prev => ({ ...prev, affiliation: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="e.g., AWS User Group Cameroon"
                                    required
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
                                            alt="Organizer photo"
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

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingOrganizer(null);
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
                                        <span>{editingOrganizer ? 'Update Organizer' : 'Add Organizer'}</span>
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