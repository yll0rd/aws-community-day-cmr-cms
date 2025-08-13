import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Shield,
  User,
  Mail,
  Calendar,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface CmsUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  active: boolean;
}

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<CmsUser | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');

  // Mock data
  const [users, setUsers] = useState<CmsUser[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@awscommunity.cm',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100&h=100&fit=crop',
      lastLogin: '2024-12-01T10:30:00Z',
      createdAt: '2024-01-15T08:00:00Z',
      active: true
    },
    {
      id: '2',
      name: 'Content Editor',
      email: 'editor@awscommunity.cm',
      role: 'editor',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100&h=100&fit=crop',
      lastLogin: '2024-11-30T16:45:00Z',
      createdAt: '2024-02-01T09:15:00Z',
      active: true
    },
    {
      id: '3',
      name: 'Marie Dupont',
      email: 'marie@awscommunity.cm',
      role: 'editor',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=100&h=100&fit=crop',
      lastLogin: '2024-11-28T14:20:00Z',
      createdAt: '2024-03-10T11:30:00Z',
      active: true
    },
    {
      id: '4',
      name: 'Jean Mbeki',
      email: 'jean@awscommunity.cm',
      role: 'editor',
      createdAt: '2024-11-20T10:00:00Z',
      active: false
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const toggleActive = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot deactivate your own account");
      return;
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    ));
  };

  const getRoleColor = (role: 'admin' | 'editor') => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const loginDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return formatDate(dateString);
  };

  // Only admins can access this page
  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only administrators can manage users.</p>
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
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-aws-primary text-white px-6 py-3 rounded-lg hover:bg-aws-primary/90"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.active).length}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'admin').length}</p>
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
              <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'editor').length}</p>
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-aws-secondary focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="editor">Editors</option>
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
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
                      <img
                        src={user.avatar || 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=40&h=40&fit=crop'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
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
                      {user.role === 'admin' ? 'Administrator' : 'Editor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setShowForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-aws-primary hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(user.id)}
                        disabled={user.id === currentUser?.id}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          user.id === currentUser?.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : user.active
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.active ? 'Deactivate' : 'Activate'}
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
          </div>
        )}
      </div>

      {/* Form Modal (placeholder) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-gray-600 mb-4">User form implementation would go here...</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-aws-primary text-white rounded-lg hover:bg-aws-primary/90">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}