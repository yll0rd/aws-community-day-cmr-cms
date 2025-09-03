"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Award,
    Upload,
    ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Sponsor {
    id: string;
    name: string;
    logoUrl?: string;
    website?: string;
    type: 'GOLD' | 'SILVER' | 'COMMUNITY' | 'COMMUNITY_EXHIBITOR';
    yearId: string;
    createdAt: string;
    updatedAt: string;
}

export default function SponsorsManager() {
    const { t } = useLanguage();
    const { currentYear } = useYear();
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        logoUrl: '',
        website: '',
        type: 'COMMUNITY' as Sponsor['type']
    });

    useEffect(() => {
        fetchSponsors();
    }, [currentYear]);

    const fetchSponsors = async () => {
        try {
            setLoading(true);
            // Mock implementation - replace with actual API call
            setSponsors([]);
        } catch (error) {
            toast.error('Failed to fetch sponsors');
            console.error('Error fetching sponsors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // Mock implementation
            toast.success(editingSponsor ? 'Sponsor updated successfully' : 'Sponsor created successfully');
            setShowForm(false);
            setEditingSponsor(null);
            resetForm();
            fetchSponsors();
        } catch (error) {
            toast.error('Failed to save sponsor');
            console.error('Error saving sponsor:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sponsor?')) return;

        try {
            toast.success('Sponsor deleted successfully');
            fetchSponsors();
        } catch (error) {
            toast.error('Failed to delete sponsor');
            console.error('Error deleting sponsor:', error);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            const response = await api.uploadFile(file, 'sponsors');
            if (response.error) {
                toast.error(response.error);
            } else {
                setFormData(prev => ({ ...prev, logoUrl: response.url }));
                toast.success('Logo uploaded successfully');
            }
        } catch (error) {
            toast.error('Failed to upload logo');
            console.error('Error uploading logo:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            logoUrl: '',
            website: '',
            type: 'COMMUNITY'
        });
    };

    const getTypeColor = (type: Sponsor['type']) => {
        switch (type) {
            case 'GOLD':
                return 'bg-yellow-100 text-yellow-800';
            case 'SILVER':
                return 'bg-gray-100 text-gray-800';
            case 'COMMUNITY':
                return 'bg-blue-100 text-blue-800';
            case 'COMMUNITY_EXHIBITOR':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredSponsors = sponsors.filter(sponsor => {
        const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || sponsor.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading sponsors...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.sponsors')}</h1>
                    <p className="text-gray-600 mt-2">Manage event sponsors and partners</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setEditingSponsor(null);
                        setShowForm(true);
                    }}
                    className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Sponsor</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search sponsors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="GOLD">Gold</option>
                        <option value="SILVER">Silver</option>
                        <option value="COMMUNITY">Community</option>
                        <option value="COMMUNITY_EXHIBITOR">Community Exhibitor</option>
                    </select>
                </div>
            </div>

            {/* Sponsors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSponsors.map((sponsor) => (
                    <div key={sponsor.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="relative h-32 bg-gray-50 flex items-center justify-center">
                            {sponsor.logoUrl ? (
                                <img
                                    src={sponsor.logoUrl}
                                    alt={sponsor.name}
                                    className="max-h-20 max-w-full object-contain"
                                />
                            ) : (
                                <Award className="w-12 h-12 text-gray-300" />
                            )}
                            <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(sponsor.type)}`}>
                  {sponsor.type.replace('_', ' ')}
                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">{sponsor.name}</h3>

                            {sponsor.website && (
                                <a
                                    href={sponsor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 text-sm text-aws-primary hover:underline mb-3"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Visit Website</span>
                                </a>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingSponsor(sponsor);
                                            setFormData({
                                                name: sponsor.name,
                                                logoUrl: sponsor.logoUrl || '',
                                                website: sponsor.website || '',
                                                type: sponsor.type
                                            });
                                            setShowForm(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sponsor.id)}
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
            {filteredSponsors.length === 0 && !loading && (
                <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {searchTerm || filterType !== 'all' ? 'No sponsors found' : 'No sponsors yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || filterType !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Add your first sponsor to get started'
                        }
                    </p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">
                            {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name *
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
                                    Sponsor Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Sponsor['type'] }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                >
                                    <option value="GOLD">Gold Sponsor</option>
                                    <option value="SILVER">Silver Sponsor</option>
                                    <option value="COMMUNITY">Community Partner</option>
                                    <option value="COMMUNITY_EXHIBITOR">Community Exhibitor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo
                                </label>
                                <div className="flex items-center space-x-4">
                                    {formData.logoUrl && (
                                        <img
                                            src={formData.logoUrl}
                                            alt="Sponsor logo"
                                            className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-2"
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
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Upload Logo</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingSponsor(null);
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
                                        <span>{editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}</span>
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