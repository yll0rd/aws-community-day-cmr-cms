"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Award,
    Upload,
    ExternalLink,
    X,
    RefreshCw,
    Building2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';

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
    const { currentYearData, loading: yearLoading, refreshYears } = useYear();
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        type: 'COMMUNITY' as Sponsor['type']
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [removeLogo, setRemoveLogo] = useState(false);

    // Fetch sponsors when currentYearData changes
    useEffect(() => {
        if (currentYearData) {
            console.log('Current year changed:', currentYearData.name, currentYearData.id);
            fetchSponsors();
        } else {
            setSponsors([]);
            setLoading(false);
        }
    }, [currentYearData]);

    const fetchSponsors = async () => {
        if (!currentYearData) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching sponsors for year:', currentYearData.id);
            const response = await api.getSponsors(currentYearData.id);

            if (response.error) {
                toast.error(response.error);
            } else {
                setSponsors(response.data || []);
            }
        } catch (error) {
            toast.error('Failed to fetch sponsors');
            console.error('Error fetching sponsors:', error);
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
            formDataToSend.append('website', formData.website);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('yearId', currentYearData.id);

            // Handle logo
            if (logoFile) {
                formDataToSend.append('logo', logoFile);
            }

            if (removeLogo && editingSponsor?.logoUrl) {
                formDataToSend.append('removeLogo', 'true');
            }

            let response;
            if (editingSponsor) {
                response = await api.updateSponsorWithLogo(editingSponsor.id, formDataToSend);
            } else {
                response = await api.createSponsorWithLogo(formDataToSend);
            }

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success(editingSponsor ? 'Sponsor updated successfully' : 'Sponsor created successfully');
                setShowForm(false);
                setEditingSponsor(null);
                resetForm();
                fetchSponsors();
            }
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
            const response = await api.deleteSponsor(id);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Sponsor deleted successfully');
                fetchSponsors();
            }
        } catch (error) {
            toast.error('Failed to delete sponsor');
            console.error('Error deleting sponsor:', error);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please select an image (JPEG, PNG, GIF, WebP, SVG).');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size too large. Maximum size is 5MB.');
            return;
        }

        setLogoFile(file);
        setRemoveLogo(false);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview('');
        setRemoveLogo(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            website: '',
            type: 'COMMUNITY'
        });
        setLogoFile(null);
        setLogoPreview('');
        setRemoveLogo(false);
    };

    const openEditForm = (sponsor: Sponsor) => {
        setEditingSponsor(sponsor);
        setFormData({
            name: sponsor.name,
            website: sponsor.website || '',
            type: sponsor.type
        });
        setLogoPreview(sponsor.logoUrl || '');
        setRemoveLogo(false);
        setShowForm(true);
    };

    const openAddForm = () => {
        if (!currentYearData) {
            toast.error('Please select a year first');
            return;
        }

        setEditingSponsor(null);
        resetForm();
        setShowForm(true);
    };

    const getTypeColor = (type: Sponsor['type']) => {
        switch (type) {
            case 'GOLD':
                return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'SILVER':
                return 'bg-gray-100 text-gray-800 border border-gray-200';
            case 'COMMUNITY':
                return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'COMMUNITY_EXHIBITOR':
                return 'bg-green-100 text-green-800 border border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getTypeDisplayName = (type: Sponsor['type']) => {
        switch (type) {
            case 'GOLD':
                return 'Gold Sponsor';
            case 'SILVER':
                return 'Silver Sponsor';
            case 'COMMUNITY':
                return 'Community Partner';
            case 'COMMUNITY_EXHIBITOR':
                return 'Community Exhibitor';
            default:
                return type;
        }
    };

    const filteredSponsors = sponsors.filter(sponsor => {
        const matchesSearch = sponsor.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || sponsor.type === filterType;
        return matchesSearch && matchesType;
    });

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
                <Building2 className="w-16 h-16 text-gray-300" />
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
                    <p className="text-gray-600 mt-2">
                        Managing sponsors for AWS Community Day {currentYearData.name}
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
                        <span>Add Sponsor</span>
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
                        {sponsors.length} sponsor{sponsors.length !== 1 ? 's' : ''} found
                    </div>
                </div>
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
                            className="w-full text-aws-primary pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="border text-aws-primary border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    >
                        <option value="all">All Types</option>
                        <option value="GOLD">Gold Sponsors</option>
                        <option value="SILVER">Silver Sponsors</option>
                        <option value="COMMUNITY">Community Partners</option>
                        <option value="COMMUNITY_EXHIBITOR">Community Exhibitors</option>
                    </select>
                </div>
            </div>

            {/* Sponsors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSponsors.map((sponsor) => (
                    <div key={sponsor.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="relative h-32 bg-gray-50 flex items-center justify-center p-4">
                            {sponsor.logoUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <Image
                                        src={sponsor.logoUrl}
                                        alt={sponsor.name}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </div>
                            ) : (
                                <Building2 className="w-12 h-12 text-gray-300" />
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(sponsor.type)}`}>
                                    {getTypeDisplayName(sponsor.type)}
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
                                        onClick={() => openEditForm(sponsor)}
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
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {searchTerm || filterType !== 'all' ? 'No sponsors found' : 'No sponsors yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || filterType !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Add your first sponsor to get started'
                        }
                    </p>
                    {!searchTerm && filterType === 'all' && (
                        <button
                            onClick={openAddForm}
                            className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                        >
                            Add First Sponsor
                        </button>
                    )}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl text-gray-700 font-bold mb-4">
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
                                    className="w-full px-4 py-3 border text-aws-primary border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
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
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
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
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="https://..."
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
                                    Sponsor is automatically associated with the current event year
                                </p>
                            </div>

                            {/* Logo Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Logo
                                </label>
                                <div className="space-y-4">
                                    {/* Logo Preview */}
                                    {(logoPreview || (editingSponsor?.logoUrl && !removeLogo)) && (
                                        <div className="relative inline-block">
                                            <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center">
                                                <Image
                                                    src={logoPreview || editingSponsor?.logoUrl || ''}
                                                    alt="Logo preview"
                                                    width={128}
                                                    height={128}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
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
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="flex text-aws-primary items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-aws-primary hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Upload className="w-5 h-5" />
                                            <span>Choose Logo</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">
                                            JPEG, PNG, GIF, WebP, SVG. Max 5MB. Recommended: Square aspect ratio
                                        </p>
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
                                    className="flex-1 text-aws-primary px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
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