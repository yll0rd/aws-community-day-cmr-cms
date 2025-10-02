"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Edit,
    Upload,
    Image as ImageIcon,
    Phone,
    Globe,
    Navigation,
    Users,
    Mail,
    X,
    Plus,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';

interface Venue {
    id: string;
    name: string;
    address?: string;
    city: string;
    region: string;
    description?: string;
    latitude: number;
    longitude: number;
    mapUrl?: string;
    capacity?: number;
    website?: string;
    contactInfo?: string;
    images: string[];
    yearId: string;
    createdAt: string;
    updatedAt: string;
}

export default function VenueManager() {
    const { t, currentLanguage } = useLanguage();
    const { currentYearData, loading: yearLoading, refreshYears } = useYear();
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        region: '',
        description: '',
        latitude: '',
        longitude: '',
        mapUrl: '',
        capacity: '',
        website: '',
        contactInfo: ''
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // Fetch venue when currentYearData changes
    useEffect(() => {
        if (currentYearData) {
            console.log('Current year changed:', currentYearData.name, currentYearData.id);
            fetchVenue();
        } else {
            setVenue(null);
            setLoading(false);
        }
    }, [currentYearData]);

    const fetchVenue = async () => {
        if (!currentYearData) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching venue for year:', currentYearData.id);
            const response = await api.getVenue(currentYearData.id);

            if (response.error) {
                // Venue doesn't exist yet, that's fine
                setVenue(null);
            } else {
                setVenue(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch venue');
            console.error('Error fetching venue:', error);
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
            formDataToSend.append('address', formData.address);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('region', formData.region);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('latitude', formData.latitude);
            formDataToSend.append('longitude', formData.longitude);
            formDataToSend.append('mapUrl', formData.mapUrl);
            formDataToSend.append('capacity', formData.capacity);
            formDataToSend.append('website', formData.website);
            formDataToSend.append('contactInfo', formData.contactInfo);
            formDataToSend.append('yearId', currentYearData.id);
            formDataToSend.append('existingImages', JSON.stringify(existingImages));

            // Append image files
            imageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            const response = await api.updateVenue(formDataToSend);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Venue saved successfully');
                setShowForm(false);
                resetForm();
                fetchVenue();
            }
        } catch (error) {
            toast.error('Failed to save venue');
            console.error('Error saving venue:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentYearData || !venue) return;

        if (!confirm('Are you sure you want to delete this venue?')) return;

        try {
            const response = await api.deleteVenue(currentYearData.id);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Venue deleted successfully');
                setVenue(null);
            }
        } catch (error) {
            toast.error('Failed to delete venue');
            console.error('Error deleting venue:', error);
        }
    };

    const handleFileSelect = (files: FileList) => {
        const newFiles = Array.from(files);

        // Validate files
        for (const file of newFiles) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Invalid file type. Please select images only (JPEG, PNG, GIF, WebP).');
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error(`File ${file.name} is too large. Maximum size is 5MB.`);
                return;
            }
        }

        setImageFiles(prev => [...prev, ...newFiles]);

        // Create previews
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            city: '',
            region: '',
            description: '',
            latitude: '',
            longitude: '',
            mapUrl: '',
            capacity: '',
            website: '',
            contactInfo: ''
        });
        setImageFiles([]);
        setImagePreviews([]);
        setExistingImages([]);
    };

    const openEditForm = () => {
        if (!currentYearData) {
            toast.error('Please select a year first');
            return;
        }

        if (venue) {
            // Editing existing venue
            setFormData({
                name: venue.name,
                address: venue.address || '',
                city: venue.city,
                region: venue.region,
                description: venue.description || '',
                latitude: venue.latitude.toString(),
                longitude: venue.longitude.toString(),
                mapUrl: venue.mapUrl || '',
                capacity: venue.capacity?.toString() || '',
                website: venue.website || '',
                contactInfo: venue.contactInfo || ''
            });
            setExistingImages(venue.images);
        } else {
            // Creating new venue
            resetForm();
        }

        setShowForm(true);
    };

    const openMapUrl = () => {
        if (venue?.mapUrl) {
            window.open(venue.mapUrl, '_blank');
        }
    };

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
                <MapPin className="w-16 h-16 text-gray-300" />
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
                <span className="ml-3 text-gray-600">Loading venue...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.venue')}</h1>
                    <p className="text-gray-600 mt-2">
                        Managing venue for AWS Community Day {currentYearData.name}
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
                    {venue && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Venue</span>
                        </button>
                    )}
                    <button
                        onClick={openEditForm}
                        className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                    >
                        <Edit className="w-5 h-5" />
                        <span>{venue ? 'Edit Venue' : 'Add Venue'}</span>
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
                        {venue ? 'Venue configured' : 'No venue set up'}
                    </div>
                </div>
            </div>

            {!venue ? (
                // Empty State
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Venue Configured</h3>
                    <p className="text-gray-600 mb-6">
                        Set up the venue information for this event year
                    </p>
                    <button
                        onClick={openEditForm}
                        className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                    >
                        Add Venue
                    </button>
                </div>
            ) : (
                // Venue Details
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Information */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                        {venue.name}
                                    </h2>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">
                                            {venue.address && `${venue.address}, `}
                                            {venue.city}, {venue.region}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {venue.description && (
                                <p className="text-gray-600 mb-4">
                                    {venue.description}
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {venue.capacity && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-aws-primary/10 rounded-lg flex items-center justify-center">
                                            <Users className="w-4 h-4 text-aws-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">Capacity</p>
                                            <p className="text-sm text-gray-600">{venue.capacity} attendees</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-aws-secondary/10 rounded-lg flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-aws-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Coordinates</p>
                                        <p className="text-sm text-gray-600">
                                            {venue.latitude.toFixed(4)}, {venue.longitude.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        {(venue.website || venue.contactInfo) && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    {venue.website && (
                                        <div className="flex items-center space-x-3">
                                            <Globe className="w-4 h-4 text-gray-400" />
                                            <a
                                                href={venue.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-aws-primary hover:underline"
                                            >
                                                {venue.website}
                                            </a>
                                        </div>
                                    )}
                                    {venue.contactInfo && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700">{venue.contactInfo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Images and Map */}
                    <div className="space-y-6">
                        {/* Venue Images */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Venue Images</h3>

                            <div className="grid grid-cols-1 gap-4">
                                {venue.images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <Image
                                            src={image}
                                            alt={`Venue image ${index + 1}`}
                                            width={600}
                                            height={400}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Location</h3>
                                {venue.mapUrl && (
                                    <button
                                        onClick={openMapUrl}
                                        className="flex items-center space-x-2 text-sm text-aws-primary hover:bg-aws-primary/10 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        <span>View on Map</span>
                                    </button>
                                )}
                            </div>

                            {/* Placeholder Map */}
                            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">Location coordinates</p>
                                    <p className="text-sm text-gray-400">
                                        Lat: {venue.latitude.toFixed(4)}, Lng: {venue.longitude.toFixed(4)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl text-aws-primary font-bold mb-4">
                            {venue ? 'Edit Venue' : 'Add New Venue'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Venue Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Region *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.region}
                                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Map URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.mapUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mapUrl: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Information
                                </label>
                                <input
                                    type="text"
                                    value={formData.contactInfo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="Phone number or contact details"
                                />
                            </div>

                            {/* Year Info (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Year
                                </label>
                                <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-aws-primary">
                                    AWS Community Day {currentYearData.name}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Venue is automatically associated with the current event year
                                </p>
                            </div>

                            {/* Images Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Venue Images
                                </label>

                                {/* Existing Images */}
                                {existingImages.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                            {existingImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <Image
                                                        src={image}
                                                        alt={`Venue image ${index + 1}`}
                                                        width={200}
                                                        height={150}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Images */}
                                {(imagePreviews.length > 0 || imageFiles.length > 0) && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={preview}
                                                        alt={`New image ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* File Upload */}
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (files) handleFileSelect(files);
                                        }}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-aws-primary hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <Upload className="w-5 h-5" />
                                        <span>Choose Images</span>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">
                                        JPEG, PNG, GIF, WebP. Max 5MB per image.
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
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
                                        <span>{venue ? 'Update Venue' : 'Create Venue'}</span>
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