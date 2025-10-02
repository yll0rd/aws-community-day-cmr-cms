"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Link,
    Save,
    Eye,
    Trash2,
    RefreshCw,
    Users,
    ExternalLink,
    Plus,
    Settings
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface GeneralSetting {
    id: string;
    rsvpLink?: string;
    rsvpDeadline?: string;
    eventDate?: string;
    maxAttendees?: number;
    volunteerLink?: string;
    sponsorLink?: string;
    speakerLink?: string;
    yearId: string;
}

export default function SettingsManager() {
    const { t } = useLanguage();
    const { currentYearData, loading: yearLoading, refreshYears } = useYear();
    const [settings, setSettings] = useState<GeneralSetting | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        rsvpLink: '',
        rsvpDeadline: '',
        eventDate: '',
        maxAttendees: '',
        volunteerLink: '',
        sponsorLink: '',
        speakerLink: ''
    });

    // Fetch settings when currentYearData changes
    useEffect(() => {
        if (currentYearData) {
            console.log('Current year changed:', currentYearData.name, currentYearData.id);
            fetchSettings();
        } else {
            setSettings(null);
            setLoading(false);
        }
    }, [currentYearData]);

    const fetchSettings = async () => {
        if (!currentYearData) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('Fetching settings for year:', currentYearData.id);
            const response = await api.getSettings(currentYearData.id);

            if (response.error) {
                // Settings don't exist yet, that's fine
                setSettings(null);
                setIsCreating(false);
            } else {
                setSettings(response.data);
                setIsCreating(false);
                if (response.data) {
                    // Populate form with existing data
                    setFormData({
                        rsvpLink: response.data.rsvpLink || '',
                        rsvpDeadline: response.data.rsvpDeadline ? new Date(response.data.rsvpDeadline).toISOString().split('T')[0] : '',
                        eventDate: response.data.eventDate ? new Date(response.data.eventDate).toISOString().split('T')[0] : '',
                        maxAttendees: response.data.maxAttendees?.toString() || '',
                        volunteerLink: response.data.volunteerLink || '',
                        sponsorLink: response.data.sponsorLink || '',
                        speakerLink: response.data.speakerLink || ''
                    });
                }
            }
        } catch (error) {
            toast.error('Failed to fetch settings');
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
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
            formDataToSend.append('rsvpLink', formData.rsvpLink);
            formDataToSend.append('rsvpDeadline', formData.rsvpDeadline);
            formDataToSend.append('eventDate', formData.eventDate);
            formDataToSend.append('maxAttendees', formData.maxAttendees);
            formDataToSend.append('volunteerLink', formData.volunteerLink);
            formDataToSend.append('sponsorLink', formData.sponsorLink);
            formDataToSend.append('speakerLink', formData.speakerLink);
            formDataToSend.append('yearId', currentYearData.id);

            const response = await api.updateSettings(formDataToSend);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success(settings ? 'Settings updated successfully' : 'Settings created successfully');
                setHasChanges(false);
                setIsCreating(false);
                fetchSettings();
            }
        } catch (error) {
            toast.error('Failed to save settings');
            console.error('Error saving settings:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentYearData || !settings) return;

        if (!confirm('Are you sure you want to delete these settings?')) return;

        try {
            const response = await api.deleteSettings(currentYearData.id);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('Settings deleted successfully');
                setSettings(null);
                resetForm();
                setHasChanges(false);
                setIsCreating(false);
            }
        } catch (error) {
            toast.error('Failed to delete settings');
            console.error('Error deleting settings:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            rsvpLink: '',
            rsvpDeadline: '',
            eventDate: '',
            maxAttendees: '',
            volunteerLink: '',
            sponsorLink: '',
            speakerLink: ''
        });
    };

    const startCreating = () => {
        resetForm();
        setIsCreating(true);
        setHasChanges(false);
    };

    const cancelCreating = () => {
        if (settings) {
            // Reset to existing settings
            setFormData({
                rsvpLink: settings.rsvpLink || '',
                rsvpDeadline: settings.rsvpDeadline ? new Date(settings.rsvpDeadline).toISOString().split('T')[0] : '',
                eventDate: settings.eventDate ? new Date(settings.eventDate).toISOString().split('T')[0] : '',
                maxAttendees: settings.maxAttendees?.toString() || '',
                volunteerLink: settings.volunteerLink || '',
                sponsorLink: settings.sponsorLink || '',
                speakerLink: settings.speakerLink || ''
            });
        } else {
            resetForm();
        }
        setIsCreating(false);
        setHasChanges(false);
    };

    const openLink = (url: string) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                <Calendar className="w-16 h-16 text-gray-300" />
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
                <span className="ml-3 text-gray-600">Loading settings...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.settings')}</h1>
                    <p className="text-gray-600 mt-2">
                        Configure general event settings for AWS Community Day {currentYearData.name}
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

                    {settings && !isCreating && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Settings</span>
                        </button>
                    )}

                    {!settings && !isCreating ? (
                        // Show Create button when no settings exist
                        <button
                            onClick={startCreating}
                            className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Settings</span>
                        </button>
                    ) : isCreating ? (
                        // Show both Cancel and Create buttons when creating new settings
                        <>
                            <button
                                onClick={cancelCreating}
                                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={formLoading}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                                    !formLoading
                                        ? 'bg-aws-primary text-white hover:bg-aws-primary/90'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {formLoading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                <span>{formLoading ? 'Creating...' : 'Create Settings'}</span>
                            </button>
                        </>
                    ) : (
                        // Show Save button when editing existing settings
                        <button
                            onClick={handleSubmit}
                            disabled={!hasChanges || formLoading}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                                hasChanges && !formLoading
                                    ? 'bg-aws-primary text-white hover:bg-aws-primary/90'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {formLoading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span>{formLoading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    )}
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
                        {settings ? 'Settings configured' : isCreating ? 'Creating new settings' : 'No settings set up'}
                    </div>
                </div>
            </div>

            {!settings && !isCreating ? (
                // Empty State - Show when no settings exist and not creating
                <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Settings Configured</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Configure the general settings for AWS Community Day {currentYearData.name}.
                        Set up event dates, RSVP links, application URLs, and other important information.
                    </p>
                    <button
                        onClick={startCreating}
                        className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90 mx-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Configure Settings</span>
                    </button>
                </div>
            ) : (
                // Settings Form and Display - Show when settings exist OR when creating
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Event Information */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="date"
                                            value={formData.eventDate}
                                            onChange={(e) => handleInputChange('eventDate', e.target.value)}
                                            className="w-full text-aws-primary pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        RSVP Deadline
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.rsvpDeadline}
                                        onChange={(e) => handleInputChange('rsvpDeadline', e.target.value)}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Attendees
                                    </label>
                                    <div className="relative">
                                        <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="number"
                                            value={formData.maxAttendees}
                                            onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                                            className="w-full text-aws-primary pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                            placeholder="500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application URLs */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Application Links</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        RSVP Link
                                    </label>
                                    <div className="relative">
                                        <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="url"
                                            value={formData.rsvpLink}
                                            onChange={(e) => handleInputChange('rsvpLink', e.target.value)}
                                            className="w-full text-aws-primary pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => openLink(formData.rsvpLink)}
                                            disabled={!formData.rsvpLink}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Volunteer Application Link
                                    </label>
                                    <div className="relative">
                                        <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="url"
                                            value={formData.volunteerLink}
                                            onChange={(e) => handleInputChange('volunteerLink', e.target.value)}
                                            className="w-full text-aws-primary pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => openLink(formData.volunteerLink)}
                                            disabled={!formData.volunteerLink}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Speaker Application Link
                                    </label>
                                    <div className="relative">
                                        <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="url"
                                            value={formData.speakerLink}
                                            onChange={(e) => handleInputChange('speakerLink', e.target.value)}
                                            className="w-full text-aws-primary pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => openLink(formData.speakerLink)}
                                            disabled={!formData.speakerLink}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sponsor Application Link
                                    </label>
                                    <div className="relative">
                                        <Link className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="url"
                                            value={formData.sponsorLink}
                                            onChange={(e) => handleInputChange('sponsorLink', e.target.value)}
                                            className="w-full text-aws-primary pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => openLink(formData.sponsorLink)}
                                            disabled={!formData.sponsorLink}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings Preview</h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-800 mb-2">
                                        AWS Community Day {currentYearData.name}
                                    </h3>
                                    <div className="text-sm text-gray-500 space-y-2">
                                        <p><strong>Event Date:</strong> {formatDate(formData.eventDate)}</p>
                                        <p><strong>RSVP Deadline:</strong> {formatDate(formData.rsvpDeadline)}</p>
                                        {formData.maxAttendees && (
                                            <p><strong>Maximum Attendees:</strong> {formData.maxAttendees}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {formData.rsvpLink && (
                                        <a
                                            href={formData.rsvpLink}
                                            className="flex items-center justify-center space-x-2 bg-aws-primary text-white px-4 py-3 rounded-lg hover:bg-aws-primary/90 text-sm"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span>RSVP Now</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    {formData.speakerLink && (
                                        <a
                                            href={formData.speakerLink}
                                            className="flex items-center justify-center space-x-2 bg-aws-secondary text-white px-4 py-3 rounded-lg hover:bg-aws-secondary/90 text-sm"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span>Apply to Speak</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}