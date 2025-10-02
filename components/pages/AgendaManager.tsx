"use client";

import React, { useEffect, useState } from "react";
import { Plus, Clock, Edit, Trash2, Calendar, MapPin, User, Globe, RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from '@/lib/api';
import { useYear } from "@/contexts/YearContext";
import toast from "react-hot-toast";
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import YearSelector from '@/components/YearSelector';

interface Speaker {
    id: string;
    name: string;
    title?: string;
    photoUrl?: string;
}

interface AgendaItem {
    id: string;
    titleEn: string;
    titleFr?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    startTime: string;
    endTime: string;
    speakerId: string;
    yearId: string;
    location?: string;
    type: "keynote" | "session" | "break" | "networking";
    published: boolean;
    speaker?: Speaker;
    createdAt: string;
    updatedAt: string;
}

interface UIAgendaItem {
    id: string;
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    startTime: string;
    endTime: string;
    date: string;
    speaker?: string;
    speakerId: string;
    location: string;
    type: "keynote" | "session" | "break" | "networking";
    published: boolean;
}

export default function AgendaManager() {
    const { t, currentLanguage } = useLanguage();
    const { currentYearData, loading: yearLoading, refreshYears } = useYear();
    const [loading, setLoading] = useState(true);
    const [agendaItems, setAgendaItems] = useState<UIAgendaItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<UIAgendaItem | null>(null);
    const [selectedDate, setSelectedDate] = useState("2025-03-15");
    const [saving, setSaving] = useState(false);
    const [speakers, setSpeakers] = useState<Speaker[]>([]);

    const [formData, setFormData] = useState({
        titleEn: '',
        titleFr: '',
        descriptionEn: '',
        descriptionFr: '',
        date: '2025-03-15',
        startTime: '09:00',
        endTime: '10:00',
        speakerId: '',
        location: '',
        type: 'session' as AgendaItem['type'],
        published: false,
    });

    // Fetch speakers and agenda when currentYearData changes
    useEffect(() => {
        if (currentYearData) {
            console.log('Current year changed:', currentYearData.name, currentYearData.id);
            fetchSpeakers();
            fetchAgenda();
        } else {
            setAgendaItems([]);
            setSpeakers([]);
            setLoading(false);
        }
    }, [currentYearData]);

    const fetchSpeakers = async () => {
        if (!currentYearData) return;

        try {
            const res = await api.getSpeakers(currentYearData.id);
            if (!res.error) {
                setSpeakers(res.data || []);
            } else {
                toast.error('Failed to load speakers');
            }
        } catch (err) {
            console.error('Error fetching speakers:', err);
            toast.error('Failed to load speakers');
        }
    };

    const fetchAgenda = async () => {
        if (!currentYearData) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log('Fetching agenda for year:', currentYearData.id);
            const res = await api.getAgenda(currentYearData.id);

            if (res.error) {
                toast.error(res.error);
                return;
            }

            const items: UIAgendaItem[] = (res.data || []).map((item: AgendaItem) => ({
                id: item.id,
                title: {
                    en: item.titleEn,
                    fr: item.titleFr || item.titleEn
                },
                description: {
                    en: item.descriptionEn || '',
                    fr: item.descriptionFr || item.descriptionEn || ''
                },
                startTime: new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                endTime: new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date(item.startTime).toISOString().slice(0, 10),
                speaker: item.speaker?.name || '',
                speakerId: item.speakerId,
                location: item.location || 'Main Hall',
                type: item.type as "keynote" | "session" | "break" | "networking",
                published: item.published
            }));

            setAgendaItems(items);

            // Set selectedDate to first item's date if available
            if (items.length > 0 && !items.find(i => i.date === selectedDate)) {
                setSelectedDate(items[0].date);
            }

        } catch (err) {
            console.error('Error fetching agenda:', err);
            toast.error('Failed to fetch agenda');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = agendaItems
        .filter(item => item.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const getTypeColor = (type: UIAgendaItem['type']) => {
        switch (type) {
            case 'keynote':
                return 'bg-aws-secondary text-white';
            case 'session':
                return 'bg-blue-100 text-blue-800';
            case 'break':
                return 'bg-gray-100 text-gray-800';
            case 'networking':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agenda item?')) return;
        try {
            const res = await api.deleteAgendaItem(id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Agenda item deleted successfully");
                fetchAgenda();
            }
        } catch (e) {
            console.error('Error deleting agenda item:', e);
            toast.error("Error deleting agenda item");
        }
    };

    const openCreateForm = () => {
        setEditingItem(null);
        setFormData({
            titleEn: '',
            titleFr: '',
            descriptionEn: '',
            descriptionFr: '',
            date: selectedDate,
            startTime: '09:00',
            endTime: '10:00',
            speakerId: '',
            location: '',
            type: 'session',
            published: false,
        });
        setShowForm(true);
    };

    const openEditForm = (item: UIAgendaItem) => {
        // Convert displayed time (e.g., "09:00 AM") to 24-hour format for input
        const convertTo24Hour = (timeStr: string) => {
            if (!timeStr) return '';

            // If it's already in 24-hour format (HH:MM), return as is
            if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
                return timeStr;
            }

            // Convert from "HH:MM AM/PM" to 24-hour format
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');

            if (modifier === 'PM' && hours !== '12') {
                hours = String(parseInt(hours, 10) + 12);
            }
            if (modifier === 'AM' && hours === '12') {
                hours = '00';
            }

            // Ensure two-digit format
            hours = hours.padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        setEditingItem(item);
        setFormData({
            titleEn: item.title.en,
            titleFr: item.title.fr,
            descriptionEn: item.description.en,
            descriptionFr: item.description.fr,
            date: item.date,
            startTime: convertTo24Hour(item.startTime),
            endTime: convertTo24Hour(item.endTime),
            speakerId: item.speakerId,
            location: item.location,
            type: item.type,
            published: item.published,
        });
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!currentYearData) {
            toast.error('No year selected');
            return;
        }

        try {
            setSaving(true);

            // Validation
            if (!formData.titleEn.trim()) {
                toast.error('English title is required');
                return;
            }
            if (!formData.date) {
                toast.error('Date is required');
                return;
            }
            if (!formData.startTime || !formData.endTime) {
                toast.error('Start and end times are required');
                return;
            }
            if (!formData.speakerId) {
                toast.error('Speaker is required');
                return;
            }

            // Prepare data for API
            const startISO = new Date(`${formData.date}T${formData.startTime}`).toISOString();
            const endISO = new Date(`${formData.date}T${formData.endTime}`).toISOString();

            const payload = {
                titleEn: formData.titleEn,
                titleFr: formData.titleFr || formData.titleEn,
                descriptionEn: formData.descriptionEn,
                descriptionFr: formData.descriptionFr || formData.descriptionEn,
                startTime: startISO,
                endTime: endISO,
                speakerId: formData.speakerId,
                yearId: currentYearData.id, // Use dynamic year ID
                location: formData.location,
                type: formData.type,
                published: formData.published,
            };

            let res;
            if (editingItem) {
                res = await api.updateAgendaItem(editingItem.id, payload);
            } else {
                res = await api.createAgendaItem(payload);
            }

            if (res.error) {
                toast.error(res.error);
                return;
            }

            toast.success(editingItem ? 'Agenda item updated successfully' : 'Agenda item created successfully');
            setShowForm(false);
            setEditingItem(null);
            fetchAgenda();

        } catch (e) {
            console.error('Error saving agenda item:', e);
            toast.error('Error saving agenda item');
        } finally {
            setSaving(false);
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



    const togglePublished = async (id: string) => {
        try {
            const item = agendaItems.find(item => item.id === id);
            if (!item) return;

            const payload = {
                published: !item.published
            };

            const res = await api.updateAgendaItem(id, payload);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(item.published ? 'Agenda item unpublished' : 'Agenda item published');
                fetchAgenda();
            }
        } catch (e) {
            console.error('Error toggling publish status:', e);
            toast.error('Error updating agenda item');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <LoadingSpinner size="lg" />
                <span className="text-gray-600 text-lg">Loading agenda items...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.agenda')}</h1>
                    <p className="text-gray-600 mt-2">Manage your event schedule and sessions</p>
                </div>
                <button
                    onClick={openCreateForm}
                    className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Agenda Item</span>
                </button>
            </div>

            {/* Date Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">Event Date:</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                    />
                    <div className="text-sm text-gray-500">
                        {filteredItems.length} items scheduled
                    </div>
                </div>
            </div>

            {/* Timeline View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Event Schedule</h2>
                    <p className="text-sm text-gray-600">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-4">
                                {/* Time */}
                                <div className="flex-shrink-0 text-center">
                                    <div className="text-sm font-medium text-gray-800">
                                        {item.startTime}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {item.endTime}
                                    </div>
                                    <div className="w-px h-8 bg-gray-200 mx-auto mt-2"></div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {item.title[currentLanguage]}
                                                </h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                                                    {item.type}
                                                </span>
                                                {!item.published && (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                        Draft
                                                    </span>
                                                )}
                                            </div>

                                            {item.description[currentLanguage] && (
                                                <p className="text-gray-600 mb-3">
                                                    {item.description[currentLanguage]}
                                                </p>
                                            )}

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                {item.speaker && (
                                                    <div className="flex items-center space-x-1">
                                                        <User className="w-4 h-4" />
                                                        <span>{item.speaker}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{item.location}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Globe className="w-4 h-4" />
                                                    <span>Bilingual</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openEditForm(item)}
                                                className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => togglePublished(item.id)}
                                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                    item.published
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            >
                                                {item.published ? 'Published' : 'Publish'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No agenda items</h3>
                        <p className="text-gray-600 mb-6">Add items to your event schedule</p>
                        <button
                            onClick={openCreateForm}
                            className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                        >
                            Add First Item
                        </button>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl text-gray-700 font-bold mb-4">
                            {editingItem ? 'Edit Agenda Item' : 'Add New Agenda Item'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* English Title */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title (English) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.titleEn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* French Title */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title (French)
                                </label>
                                <input
                                    type="text"
                                    value={formData.titleFr}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titleFr: e.target.value }))}
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                />
                            </div>

                            {/* English Description */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (English)
                                </label>
                                <textarea
                                    value={formData.descriptionEn}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            {/* French Description */}
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (French)
                                </label>
                                <textarea
                                    value={formData.descriptionFr}
                                    onChange={(e) => setFormData(prev => ({ ...prev, descriptionFr: e.target.value }))}
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-4 text-gray-700 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time *
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="w-full px-4 text-gray-700 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Speaker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Speaker *
                                </label>
                                <select
                                    value={formData.speakerId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, speakerId: e.target.value }))}
                                    className="w-full text-gray-700 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a speaker</option>
                                    {speakers.map((speaker) => (
                                        <option key={speaker.id} value={speaker.id}>
                                            {speaker.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                    placeholder="Main Hall, Room 101, etc."
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AgendaItem['type'] }))}
                                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                >
                                    <option value="keynote">Keynote</option>
                                    <option value="session">Session</option>
                                    <option value="break">Break</option>
                                    <option value="networking">Networking</option>
                                </select>
                            </div>

                            {/* Published */}
                            <div className="flex items-center space-x-2">
                                <input
                                    id="published"
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                                    className="h-4 w-4 text-aws-primary border-gray-300 rounded"
                                />
                                <label htmlFor="published" className="text-sm text-gray-700">
                                    Published
                                </label>
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingItem(null);
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-aws-primary text-white rounded-lg hover:bg-aws-primary/90 disabled:opacity-50 flex items-center space-x-2"
                            >
                                {saving && <LoadingSpinner size="sm" />}
                                <span>{saving ? 'Saving...' : (editingItem ? 'Update' : 'Save')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}