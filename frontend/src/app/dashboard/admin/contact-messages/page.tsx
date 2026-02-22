'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Eye, Trash2, Archive, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { contactApi } from '@/lib/api';
import { ContactMessage } from '@/types';

export default function AdminContactMessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/unauthorized';
      return;
    }
    fetchMessages();
  }, [isAuthenticated, user]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await contactApi.getMessages();
      setMessages(response);
    } catch (error) {
      toast.error('Failed to load messages');
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: 'new' | 'read' | 'archived') => {
    try {
      await contactApi.updateMessageStatus(id, status);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status } : msg))
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
      toast.success(`Message marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update message');
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await contactApi.deleteMessage(id);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
      console.error('Error deleting message:', error);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          </div>
          <p className="text-gray-600 mt-2">
            {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Filter Tabs */}
              <div className="border-b border-gray-200 p-4 flex gap-2 flex-wrap">
                {(['all', 'new', 'read', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="divide-y divide-gray-200">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <button
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {message.name}
                          </h3>
                          <p className="text-sm text-gray-600">{message.email}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            message.status === 'new'
                              ? 'bg-red-100 text-red-700'
                              : message.status === 'read'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {message.status}
                        </span>
                      </div>
                      <h4 className="text-gray-700 font-medium mb-1">
                        {message.subject}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {message.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Message Details
                </h2>

                {/* Contact Info */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    From
                  </h3>
                  <p className="font-semibold text-gray-900 mb-1">
                    {selectedMessage.name}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    {selectedMessage.email}
                  </p>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Reply via Email
                  </a>
                </div>

                {/* Subject & Message */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </h3>
                  <p className="font-semibold text-gray-900 mb-4">
                    {selectedMessage.subject}
                  </p>

                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Message
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Date Info */}
                <div className="mb-6 pb-6 border-b border-gray-200 text-sm text-gray-600">
                  <p>
                    <strong>Received:</strong>{' '}
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                  {selectedMessage.updatedAt && (
                    <p>
                      <strong>Last Updated:</strong>{' '}
                      {new Date(selectedMessage.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedMessage.status !== 'read' && (
                    <button
                      onClick={() =>
                        updateMessageStatus(selectedMessage.id, 'read')
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Mark as Read
                    </button>
                  )}
                  {selectedMessage.status !== 'archived' && (
                    <button
                      onClick={() =>
                        updateMessageStatus(selectedMessage.id, 'archived')
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

