'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Trash2, Download, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { newsletterApi } from '@/lib/api';
import { Subscriber } from '@/types';

export default function AdminSubscribersPage() {
  const { user, isAuthenticated } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/unauthorized';
      return;
    }
    fetchSubscribers();
  }, [isAuthenticated, user]);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const response = await newsletterApi.getSubscribers();
      setSubscribers(response);
    } catch (error) {
      toast.error('Failed to load subscribers');
      console.error('Error fetching subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      await newsletterApi.deleteSubscriber(email);
      setSubscribers((prev) => prev.filter((sub) => sub.email !== email));
      toast.success('Subscriber deleted');
    } catch (error) {
      toast.error('Failed to delete subscriber');
      console.error('Error deleting subscriber:', error);
    }
  };

  const exportSubscribers = async () => {
    try {
      const csv = await newsletterApi.exportSubscribers();
      // Create a blob and download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Subscribers exported');
    } catch (error) {
      toast.error('Failed to export subscribers');
      console.error('Error exporting subscribers:', error);
    }
  };

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === 'active').length,
    unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
            </div>
            <button
              onClick={exportSubscribers}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Total Subscribers</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm font-medium">Unsubscribed</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{stats.unsubscribed}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subscribed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{subscriber.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            subscriber.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {subscriber.status === 'active' ? (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <EyeOff className="w-3 h-3" />
                              Unsubscribed
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteSubscriber(subscriber.email)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Info */}
        <p className="text-sm text-gray-600 mt-4">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </p>
      </div>
    </div>
  );
}

