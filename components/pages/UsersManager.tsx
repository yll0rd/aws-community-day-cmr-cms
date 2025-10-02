"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Shield,
    User,
    Mail,
    Calendar,
    Filter,
    Save,
    X,
    Upload,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';

interface CmsUser {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EDITOR';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}

export default function UsersManager() {
    const { user: currentUser } = useAuth();
    const { t } = useLanguage();
    const [users, setUsers] = useState<CmsUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<CmsUser | null>(null);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [formLoading, setFormLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EDITOR' as 'ADMIN' | 'EDITOR'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [removeAvatar, setRemoveAvatar] = useState(false);

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.getUsers();

            if (response.error) {
                toast.error(response.error);
            } else {
                setUsers(response.data || []);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormLoading(true);

        try {
            const formDataToSend = new FormData();

            // Append text fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('role', formData.role);

            // Only append password for new users or when changing password
            if (!editingUser || formData.password) {
                formDataToSend.append('password', formData.password);
            }

            // Handle avatar
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }

            if (removeAvatar && editingUser?.avatar) {
                formDataToSend.append('removeAvatar', 'true');
            }

            let response;
            if (editingUser) {
                response = await api.updateUser(editingUser.id, formDataToSend);
            } else {
                response = await api.createUser(formDataToSend);
            }

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
                setShowForm(false);
                setEditingUser(null);
                resetForm();
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to save user');
            console.error('Error saving user:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (userId === currentUser?.id) {
            toast.error("You cannot delete your own account");
            return;
        }

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const response = await api.deleteUser(userId);

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success('User deleted successfully');
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to delete user');
            console.error('Error deleting user:', error);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please select an image (JPEG, PNG, GIF, WebP).');
            return;
        }

        // Validate file size (2MB max)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size too large. Maximum size is 2MB.');
            return;
        }

        setAvatarFile(file);
        setRemoveAvatar(false);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview('');
        setRemoveAvatar(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'EDITOR'
        });
        setAvatarFile(null);
        setAvatarPreview('');
        setRemoveAvatar(false);
        setShowPassword(false);
    };

    const openEditForm = (user: CmsUser) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't pre-fill password
            role: user.role
        });
        setAvatarPreview(user.avatar || '');
        setRemoveAvatar(false);
        setShowForm(true);
    };

    const openAddForm = () => {
        setEditingUser(null);
        resetForm();
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingUser(null);
        resetForm();
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role: 'ADMIN' | 'EDITOR') => {
        return role === 'ADMIN'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRoleDisplayName = (role: 'ADMIN' | 'EDITOR') => {
        return role === 'ADMIN' ? 'Administrator' : 'Editor';
    };

    // Only admins can access this page
    if (currentUser?.role.toLowerCase() !== 'admin') {
        return (
            <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Access Restricted</h3>
                <p className="text-gray-600">Only administrators can manage users.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('nav.users')}</h1>
                    <p className="text-gray-600 mt-2">Manage CMS users and permissions</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchUsers}
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
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                            <p className="text-sm text-gray-600">Total Users</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'ADMIN').length}</p>
                            <p className="text-sm text-gray-600">Administrators</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'EDITOR').length}</p>
                            <p className="text-sm text-gray-600">Editors</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Edit className="w-5 h-5 text-blue-600" />
                        </div>
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
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-aws-primary pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="border text-aws-primary border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="ADMIN">Administrators</option>
                            <option value="EDITOR">Editors</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Updated
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Image
                                                src={user.avatar || '/default-avatar.png'}
                                                alt={user.name}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">
                                                {user.name}
                                                {user.id === currentUser?.id && (
                                                    <span className="ml-2 text-xs text-aws-primary">(You)</span>
                                                )}
                                            </p>
                                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                                                <Mail className="w-3 h-3" />
                                                <span>{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                            {getRoleDisplayName(user.role)}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(user.createdAt)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(user.updatedAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => openEditForm(user)}
                                            className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={user.id === currentUser?.id}
                                            className={`p-2 transition-colors rounded-lg ${
                                                user.id === currentUser?.id
                                                    ? 'text-gray-300 cursor-not-allowed'
                                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                            }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No users found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || filterRole !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Add your first user to get started'
                            }
                        </p>
                        {!searchTerm && filterRole === 'all' && (
                            <button
                                onClick={openAddForm}
                                className="bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
                            >
                                Add First User
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl text-aws-primary font-bold mb-4">
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
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
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password {editingUser ? '(Leave blank to keep current)' : '*'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full text-aws-primary px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                            required={!editingUser}
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Minimum 6 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Role *
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'ADMIN' | 'EDITOR' }))}
                                        className="w-full text-aws-primary px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
                                        required
                                    >
                                        <option value="EDITOR">Editor</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Picture
                                </label>
                                <div className="space-y-4">
                                    {/* Avatar Preview */}
                                    {(avatarPreview || (editingUser?.avatar && !removeAvatar)) && (
                                        <div className="relative inline-block">
                                            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
                                                <Image
                                                    src={avatarPreview || editingUser?.avatar || ''}
                                                    alt="Avatar preview"
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveAvatar}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
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
                                            id="avatar-upload"
                                        />
                                        <label
                                            htmlFor="avatar-upload"
                                            className="flex text-aws-primary items-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-aws-primary hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <Upload className="w-5 h-5" />
                                            <span>Choose Profile Picture</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">
                                            JPEG, PNG, GIF, WebP. Max 2MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
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
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>{editingUser ? 'Update User' : 'Create User'}</span>
                                        </>
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