"use client";

import React, { useState, useEffect } from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Edit,
    Save,
    Trash2,
    RefreshCw,
    Twitter,
    Facebook,
    Instagram,
    Linkedin,
    ExternalLink
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ContactInfo {
    id: string;
    email: string;
    phone?: string;
    address?: string;
    twitterLink?: string;
    facebookLink?: string;
    instagramLink?: string;
    linkedinLink?: string;
    yearId: string;
    createdAt: string;
    updatedAt: string;
}

export default function ContactManager() {
    const { t } = useLanguage();
    const { currentYearData, loading: yearLoading, refreshYears } = useYear();
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        address: '',
        twitterLink: '',
        facebookLink: '',
        instagramLink: '',
        linkedinLink: ''
    });

    // Fetch contact info when currentYearData changes
    useEffect(() => {
        if (currentYearData) {
            console.log('Current year changed:', currentYearData.name, currentYearData.id);
            fetchContactInfo();
        } else {
            setContactInfo(null);
            setLoading(false);
        }
    }, [currentYearData]);

    const fetchContactInfo = async () => {
        if (!currentYearData) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching contact info for year:', currentYearData.id);
            const response = await api.getContactInfo(currentYearData.id);

            if (response.error) {
                // Contact info doesn't exist yet, that's fine
                setContactInfo(null);
            } else {
                setContactInfo(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch contact information');
            console.error('Error fetching contact info:', error);
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

            // Append all fields
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('twitterLink', formData.twitterLink);
            formDataToSend.append('facebookLink', formData.facebookLink);
            formDataToSend.append('instagramLink', formData.instagramLink);
            formDataToSend.append('linkedinLink', formData.linkedinLink);
            formDataToSend.append('yearId', currentYearData.id);

            const response = await api.updateContactInfo(formDataToSend);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Contact information saved successfully');
                setIsEditing(false);
                fetchContactInfo();
            }
        } catch (error) {
            toast.error('Failed to save contact information');
            console.error('Error saving contact info:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentYearData || !contactInfo) return;

        if (!confirm('Are you sure you want to delete this contact information?')) return;

        try {
            const response = await api.deleteContactInfo(currentYearData.id);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Contact information deleted successfully');
                setContactInfo(null);
            }
        } catch (error) {
            toast.error('Failed to delete contact information');
            console.error('Error deleting contact info:', error);
        }
    };

    const resetForm = () => {
        if (contactInfo) {
            setFormData({
                email: contactInfo.email,
                phone: contactInfo.phone || '',
                address: contactInfo.address || '',
                twitterLink: contactInfo.twitterLink || '',
                facebookLink: contactInfo.facebookLink || '',
                instagramLink: contactInfo.instagramLink || '',
                linkedinLink: contactInfo.linkedinLink || ''
            });
        } else {
            setFormData({
                email: '',
                phone: '',
                address: '',
                twitterLink: '',
                facebookLink: '',
                instagramLink: '',
                linkedinLink: ''
            });
        }
    };

    const openEditForm = () => {
        if (!currentYearData) {
            toast.error('Please select a year first');
            return;
        }

        resetForm();
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        resetForm();
    };

    const getSocialMediaIcon = (platform: string) => {
        switch (platform) {
            case 'twitter':
                return <Twitter className="w-4 h-4" />;
            case 'facebook':
                return <Facebook className="w-4 h-4" />;
            case 'instagram':
                return <Instagram className="w-4 h-4" />;
            case 'linkedin':
                return <Linkedin className="w-4 h-4" />;
            default:
                return <ExternalLink className="w-4 h-4" />;
        }
    };

    const getSocialMediaColor = (platform: string) => {
        switch (platform) {
            case 'twitter':
                return 'bg-blue-50 text-blue-600';
            case 'facebook':
                return 'bg-blue-100 text-blue-600';
            case 'instagram':
                return 'bg-pink-50 text-pink-600';
            case 'linkedin':
                return 'bg-blue-50 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-600';
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
                <Mail className="w-16 h-16 text-gray-300" />
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
                <span className="ml-3 text-gray-600">Loading contact information...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.contact')}</h1>
                    <p className="text-gray-600 mt-2">
                        Managing contact information for AWS Community Day {currentYearData.name}
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
                    {contactInfo && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    )}
                    <button
                        onClick={isEditing ? cancelEdit : openEditForm}
                        className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                    >
                        {isEditing ? (
                            <>
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <Edit className="w-5 h-5" />
                                <span>{contactInfo ? 'Edit Contact Info' : 'Add Contact Info'}</span>
                            </>
                        )}
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
                        {contactInfo ? 'Contact info configured' : 'No contact info set up'}
                    </div>
                </div>
            </div>

            {!contactInfo && !isEditing ? (
                // Empty State
                <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Contact Information</h3>
                    <p className="text-gray-600 mb-6">
                        Set up the contact information for this event year
                    </p>
                    <button
                        onClick={openEditForm}
                        className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                    >
                        Add Contact Information
                    </button>
                </div>
            ) : isEditing ? (
                // Edit Form
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl text-aws-primary font-bold mb-6">
                        {contactInfo ? 'Edit Contact Information' : 'Add Contact Information'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                    placeholder="contact@awscommunity.cm"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="+237 222 123 456"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="AWS Community Day Team, Yaoundé, Cameroon"
                                />
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Media Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Twitter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Twitter
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.twitterLink}
                                        onChange={(e) => setFormData(prev => ({ ...prev, twitterLink: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        placeholder="https://twitter.com/username"
                                    />
                                </div>

                                {/* Facebook */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Facebook
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.facebookLink}
                                        onChange={(e) => setFormData(prev => ({ ...prev, facebookLink: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        placeholder="https://facebook.com/username"
                                    />
                                </div>

                                {/* Instagram */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.instagramLink}
                                        onChange={(e) => setFormData(prev => ({ ...prev, instagramLink: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        placeholder="https://instagram.com/username"
                                    />
                                </div>

                                {/* LinkedIn */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedinLink}
                                        onChange={(e) => setFormData(prev => ({ ...prev, linkedinLink: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        placeholder="https://linkedin.com/company/username"
                                    />
                                </div>
                            </div>
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
                                Contact information is automatically associated with the current event year
                            </p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex-1 px-4 text-aws-primary py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
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
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // Display Contact Information
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        {/* Primary Contact */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-aws-primary/10 rounded-lg flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-aws-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Email</p>
                                        <a href={`mailto:${contactInfo.email}`} className="text-aws-primary hover:underline">
                                            {contactInfo.email}
                                        </a>
                                    </div>
                                </div>

                                {contactInfo.phone && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-aws-secondary/10 rounded-lg flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-aws-secondary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Phone</p>
                                            <a href={`tel:${contactInfo.phone}`} className="text-gray-700">
                                                {contactInfo.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {contactInfo.address && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Address</p>
                                            <p className="text-gray-700">{contactInfo.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Media</h2>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { platform: 'twitter', link: contactInfo.twitterLink },
                                    { platform: 'facebook', link: contactInfo.facebookLink },
                                    { platform: 'instagram', link: contactInfo.instagramLink },
                                    { platform: 'linkedin', link: contactInfo.linkedinLink }
                                ].map(({ platform, link }) => (
                                    link && (
                                        <a
                                            key={platform}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${getSocialMediaColor(platform)}`}
                                        >
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                                {getSocialMediaIcon(platform)}
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize">{platform}</p>
                                                <p className="text-sm opacity-75 truncate">{link}</p>
                                            </div>
                                            <ExternalLink className="w-4 h-4 ml-auto opacity-50" />
                                        </a>
                                    )
                                ))}
                            </div>

                            {!contactInfo.twitterLink && !contactInfo.facebookLink && !contactInfo.instagramLink && !contactInfo.linkedinLink && (
                                <p className="text-gray-500 text-center py-4">No social media links configured</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}