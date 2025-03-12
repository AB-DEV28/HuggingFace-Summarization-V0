'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateUser, deleteUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updates: { email?: string; password?: string } = {};
      
      // Only include fields that have been changed
      if (formData.email && formData.email !== user?.email) {
        updates.email = formData.email;
      }
      if (formData.password) {
        updates.password = formData.password;
      }

      if (Object.keys(updates).length === 0) {
        setMessage({ type: 'error', text: 'No changes to update' });
        setIsLoading(false);
        return;
      }

      await updateUser(updates);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteUser();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <FiUser className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <div className="inline-block p-8 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
          <FiUser className="w-16 h-16 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 mb-8 transition-all duration-200">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <FiCheck className="mr-2" /> Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h2>
              <p className="mt-2 text-lg text-gray-900 dark:text-gray-100">{user.email}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <FiEdit2 className="mr-2" /> Edit Profile
            </button>
          </div>
        )}
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 shadow-lg rounded-xl p-8">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4 flex items-center">
          <FiTrash2 className="mr-2" /> Danger Zone
        </h2>
        <p className="text-sm text-red-600 dark:text-red-300 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
        >
          <FiTrash2 className="mr-2" /> Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full animate-scale-in">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Delete Account
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  'Delete Account'
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
