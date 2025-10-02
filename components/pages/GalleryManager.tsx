"use client"
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Upload,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Move,
    Image as ImageIcon,
    Grid,
    List,
    X,
    CheckCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useYear } from '@/contexts/YearContext';
import Image from "next/image";
import { api } from '@/lib/api';
import toast from "react-hot-toast";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface GalleryImage {
    id: string;
    imageUrl: string;
    caption: string;
    category: string;
    yearId: string;
    createdAt: string;
    updatedAt: string;
    year: {
        id: string;
        name: string;
    };
}

interface BulkUploadItem {
    file: File;
    preview: string;
    caption: string;
    category: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

export default function GalleryManager() {
    const { t, currentLanguage } = useLanguage();
    const { currentYearData, loading: yearLoading, refreshYears } = useYear();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [bulkUploadItems, setBulkUploadItems] = useState<BulkUploadItem[]>([]);
    const [formData, setFormData] = useState({
        imageUrl: '',
        caption: '',
        category: '',
        yearId: ''
    });

    // Fetch images when currentYearData changes
    useEffect(() => {
        if (currentYearData) {
            console.log('Current year changed:', currentYearData.name, currentYearData.id);
            fetchImages();
        } else {
            setImages([]);
            setLoading(false);
        }
    }, [currentYearData]);

    const fetchImages = async () => {
        if (!currentYearData) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            console.log('Fetching gallery images for year:', currentYearData.id);
            const response = await api.getGalleryImages(currentYearData.id);
            if (response.data) {
                setImages(response.data);
            } else {
                toast.error('Failed to fetch images');
                console.error('Error fetching images:', response.error);
            }
        } catch (error) {
            toast.error('Failed to fetch images');
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', 'event', 'speakers', 'networking', 'workshops', 'venue'];

    const filteredImages = images.filter(image => {
        const matchesSearch = image.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            image.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await api.deleteGalleryImage(id);
            if (!response.error) {
                setImages(prev => prev.filter(img => img.id !== id));
                toast.success('Image deleted');
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        }
    };

    const handleFileUpload = async (file: File): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await api.uploadFile(file, 'gallery');
                if (response.data) {
                    resolve(response.data.url);
                } else {
                    reject(new Error(response.error || 'Upload failed'));
                }
            } catch (error) {
                reject(error);
            }
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentYearData) {
            toast.error('No year selected');
            return;
        }

        if (!formData.imageUrl) {
            toast.error('Please select an image');
            return;
        }

        setUploading(true);

        try {
            let response;

            const payload = {
                ...formData,
                yearId: currentYearData.id
            };

            if (editingImage) {
                response = await api.updateGalleryImage(editingImage.id, payload);
            } else {
                response = await api.createGalleryImage(payload);
            }

            if (response.data) {
                if (editingImage) {
                    setImages(prev => prev.map(img =>
                        img.id === editingImage.id ? response.data! : img
                    ));
                } else {
                    setImages(prev => [response.data!, ...prev]);
                }
                setShowForm(false);
                setEditingImage(null);
                resetForm();
                toast.success(editingImage ? 'Image updated' : 'Image added');
            } else {
                toast.error(response.error || 'Failed to save image');
            }
        } catch (error) {
            console.error('Error saving image:', error);
            toast.error('Error saving image');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            imageUrl: '',
            caption: '',
            category: '',
            yearId: currentYearData?.id || ''
        });
    };

    const openEditForm = (image: GalleryImage) => {
        setEditingImage(image);
        setFormData({
            imageUrl: image.imageUrl,
            caption: image.caption || '',
            category: image.category || '',
            yearId: image.yearId
        });
        setShowForm(true);
    };

    const openAddForm = () => {
        if (!currentYearData) {
            toast.error('Please select a year first');
            return;
        }
        setEditingImage(null);
        resetForm();
        setShowForm(true);
    };

    // Bulk Upload Functions
    const handleBulkFileSelect = (files: FileList) => {
        if (!currentYearData) {
            toast.error('Please select a year first');
            return;
        }

        const newItems: BulkUploadItem[] = [];

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`Skipped ${file.name}: Not an image file`);
                return;
            }

            const preview = URL.createObjectURL(file);
            newItems.push({
                file,
                preview,
                caption: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for caption
                category: 'event', // Default category
                status: 'pending',
                progress: 0
            });
        });

        setBulkUploadItems(prev => [...prev, ...newItems]);
    };

    const removeBulkItem = (index: number) => {
        setBulkUploadItems(prev => {
            const newItems = [...prev];
            URL.revokeObjectURL(newItems[index].preview);
            newItems.splice(index, 1);
            return newItems;
        });
    };

    const updateBulkItem = (index: number, updates: Partial<BulkUploadItem>) => {
        setBulkUploadItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], ...updates };
            return newItems;
        });
    };

    const processBulkUpload = async () => {
        if (!currentYearData || bulkUploadItems.length === 0) return;

        let successCount = 0;
        let errorCount = 0;

        // Process each item sequentially to avoid overwhelming the server
        for (let i = 0; i < bulkUploadItems.length; i++) {
            const item = bulkUploadItems[i];

            if (item.status === 'success') continue; // Skip already successful items

            try {
                // Update status to uploading
                updateBulkItem(i, { status: 'uploading', progress: 0 });

                // Step 1: Upload file
                updateBulkItem(i, { progress: 30 });
                const imageUrl = await handleFileUpload(item.file);

                // Step 2: Create gallery entry
                updateBulkItem(i, { progress: 70 });
                const response = await api.createGalleryImage({
                    imageUrl,
                    caption: item.caption,
                    category: item.category,
                    yearId: currentYearData.id
                });

                if (response.data) {
                    updateBulkItem(i, { status: 'success', progress: 100 });
                    successCount++;

                    // Add to images list immediately
                    setImages(prev => [response.data!, ...prev]);
                } else {
                    throw new Error(response.error || 'Failed to create gallery entry');
                }

            } catch (error) {
                console.error(`Error uploading ${item.file.name}:`, error);
                updateBulkItem(i, {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Upload failed'
                });
                errorCount++;
            }
        }

        // Show summary
        if (successCount > 0) {
            toast.success(`Successfully uploaded ${successCount} image(s)`);
        }
        if (errorCount > 0) {
            toast.error(`Failed to upload ${errorCount} image(s)`);
        }

        // Clear successful items after a delay
        setTimeout(() => {
            setBulkUploadItems(prev => prev.filter(item => item.status !== 'success'));
        }, 3000);
    };

    const openBulkUpload = () => {
        if (!currentYearData) {
            toast.error('Please select a year first');
            return;
        }
        setBulkUploadItems([]);
        setShowBulkUpload(true);
    };

    // Clean up object URLs
    useEffect(() => {
        return () => {
            bulkUploadItems.forEach(item => URL.revokeObjectURL(item.preview));
        };
    }, [bulkUploadItems]);

    // Show loading state when year is loading
    if (yearLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <LoadingSpinner size="lg" />
                <span className="text-gray-600 text-lg">Loading year information...</span>
            </div>
        );
    }

    if (!currentYearData) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                <ImageIcon className="w-16 h-16 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800">No Event Year Found</h2>
                <p className="text-gray-600 text-center max-w-md">
                    No event year has been set up yet. Please run the database seeder or create a year in the admin panel first.
                </p>
                <button
                    onClick={refreshYears}
                    className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                >
                    <Plus className="w-5 h-5" />
                    <span>Refresh</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.gallery')}</h1>
                    <p className="text-gray-600 mt-2">
                        Managing gallery for AWS Community Day {currentYearData.name}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={openBulkUpload}
                        className="flex items-center text-gray-700 space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Bulk Upload</span>
                    </button>
                    <button
                        onClick={openAddForm}
                        className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Image</span>
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
                    <button
                        onClick={refreshYears}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Rest of your existing component remains the same */}
            {/* Filters and Controls */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center space-x-3">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="border text-gray-700 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-aws-primary text-white'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-aws-primary text-white'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aws-primary mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading images...</p>
                </div>
            )}

            {/* Gallery Content - Your existing grid/list views remain the same */}
            {!loading && (viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredImages.map((image) => (
                        <div key={image.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="relative">
                                <Image
                                    src={image.imageUrl}
                                    alt={image.caption || 'Gallery image'}
                                    width={400}
                                    height={300}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                                <div className="absolute top-3 left-3">
                                    <span className="bg-black/50 text-white px-2 py-1 text-xs rounded-full capitalize">
                                        {image.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <p className="font-medium text-gray-800 mb-1 line-clamp-2">
                                    {image.caption || 'Untitled Image'}
                                </p>
                                <p className="text-sm text-gray-500 mb-3">
                                    {image.year.name} • {new Date(image.createdAt).toLocaleDateString()}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => openEditForm(image)}
                                            className="p-1.5 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                            <Move className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(image.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {filteredImages.map((image) => (
                            <div key={image.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.caption || 'Gallery image'}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-800 mb-1">
                                            {image.caption || 'Untitled Image'}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize mb-1">{image.category}</p>
                                        <p className="text-xs text-gray-400">
                                            {image.year.name} • {new Date(image.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                                            {image.category}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => openEditForm(image)}
                                                className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(image.id)}
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
                </div>
            ))}

            {/* Empty State */}
            {!loading && filteredImages.length === 0 && (
                <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {searchTerm || selectedCategory !== 'all' ? 'No images found' : 'No images yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Upload your first image to get started'
                        }
                    </p>
                    {!(searchTerm || selectedCategory !== 'all') && (
                        <button
                            onClick={openAddForm}
                            className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                        >
                            Add First Image
                        </button>
                    )}
                </div>
            )}

            {/* Single Image Form Modal - Your existing form remains the same */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingImage ? 'Edit Image' : 'Add New Image'}
                        </h2>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            {/* Your existing single image form remains the same */}
                            {/* ... */}
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkUpload && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl text-aws-primary font-bold">Bulk Upload Images</h2>
                            <button
                                onClick={() => setShowBulkUpload(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-aws-primary" />
                            </button>
                        </div>

                        {/* File Drop Zone */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => e.target.files && handleBulkFileSelect(e.target.files)}
                                className="hidden"
                                id="bulk-file-upload"
                            />
                            <label
                                htmlFor="bulk-file-upload"
                                className="cursor-pointer block"
                            >
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-600 mb-2">
                                    Click to select multiple images or drag and drop
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Select multiple PNG, JPG, GIF files (up to 10MB each)
                                </p>
                            </label>
                        </div>

                        {/* Upload Queue */}
                        {bulkUploadItems.length > 0 && (
                            <div className="space-y-4 mb-6">
                                <h3 className="font-medium text-gray-800">
                                    Upload Queue ({bulkUploadItems.length} files)
                                </h3>

                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {bulkUploadItems.map((item, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="relative">
                                                <Image
                                                    src={item.preview}
                                                    alt="Preview"
                                                    width={60}
                                                    height={60}
                                                    className="w-15 text-aws-primary h-15 object-cover rounded"
                                                />
                                                {item.status === 'success' && (
                                                    <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <input
                                                        type="text"
                                                        value={item.caption}
                                                        onChange={(e) => updateBulkItem(index, { caption: e.target.value })}
                                                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                                                        placeholder="Enter caption"
                                                    />
                                                    <select
                                                        value={item.category}
                                                        onChange={(e) => updateBulkItem(index, { category: e.target.value })}
                                                        className="text-sm border border-gray-300 rounded px-2 py-1"
                                                    >
                                                        {categories.filter(cat => cat !== 'all').map(category => (
                                                            <option key={category} value={category}>
                                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {item.status === 'uploading' && (
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-aws-primary h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${item.progress}%` }}
                                                        ></div>
                                                    </div>
                                                )}

                                                {item.status === 'error' && (
                                                    <p className="text-red-500 text-xs">{item.error}</p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => removeBulkItem(index)}
                                                className="p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Bulk Upload Actions */}
                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkUpload(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={processBulkUpload}
                                        disabled={bulkUploadItems.length === 0 || bulkUploadItems.every(item => item.status === 'success')}
                                        className="flex-1 px-4 py-2 bg-aws-primary text-white rounded-lg hover:bg-aws-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>Start Upload</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}