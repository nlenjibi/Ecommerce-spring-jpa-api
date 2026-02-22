'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Bell,
  BellOff,
  Clock,
  Mail,
  Smartphone,
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useWishlist, WishlistItem } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface Reminder {
  id: string;
  productId: number;
  reminderDate: string;
  reminderNote?: string;
  emailNotification: boolean;
  pushNotification: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ReminderManagerProps {
  item: WishlistItem;
  onClose?: () => void;
  onReminderSet?: (productId: number, reminder: any) => void;
  onReminderCancelled?: (productId: number) => void;
  className?: string;
}

export function ReminderManager({
  item,
  onClose,
  onReminderSet,
  onReminderCancelled,
  className = '',
}: ReminderManagerProps) {
  const { user, token } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Form state
  const [reminderDate, setReminderDate] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [emailNotification, setEmailNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);

  // Fetch reminders for this product
  const fetchReminders = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/wishlist/reminders/due?userId=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Filter reminders for this specific product
        const productReminders = data.data.filter((reminder: any) => 
          reminder.productId === item.productId
        );
        setReminders(productReminders);
      }
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
      toast.error('Failed to load reminders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [item.productId, user, token]);

  // Set a new reminder
  const handleSetReminder = async () => {
    if (!user || !token || !reminderDate) return;

    setIsLoading(true);
    try {
      const requestBody = {
        reminderDate: new Date(reminderDate).toISOString(),
        reminderNote,
        emailNotification,
        pushNotification,
      };

      const response = await fetch(
        `/api/v1/wishlist/${item.productId}/reminder?userId=${user.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to set reminder');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Reminder set successfully!');
        onReminderSet?.(item.productId, data.data);
        resetForm();
        fetchReminders();
      }
    } catch (error) {
      console.error('Failed to set reminder:', error);
      toast.error('Failed to set reminder');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a reminder
  const handleCancelReminder = async (reminderId: string) => {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/wishlist/${item.productId}/reminder?userId=${user.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel reminder');
      }

      toast.success('Reminder cancelled');
      onReminderCancelled?.(item.productId);
      fetchReminders();
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
      toast.error('Failed to cancel reminder');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setReminderDate('');
    setReminderNote('');
    setEmailNotification(true);
    setPushNotification(true);
    setShowForm(false);
    setEditingReminder(null);
  };

  // Start editing a reminder
  const startEditing = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setReminderDate(new Date(reminder.reminderDate).toISOString().slice(0, 16));
    setReminderNote(reminder.reminderNote || '');
    setEmailNotification(reminder.emailNotification);
    setPushNotification(reminder.pushNotification);
    setShowForm(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if reminder is due
  const isReminderDue = (reminderDate: string) => {
    const now = new Date();
    const reminder = new Date(reminderDate);
    return reminder <= now;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
              <p className="text-sm text-gray-600">{item.product.name}</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Existing Reminders */}
        {reminders.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Active Reminders</h4>
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border ${
                    isReminderDue(reminder.reminderDate)
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(reminder.reminderDate)}
                        </span>
                        {isReminderDue(reminder.reminderDate) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Due Now
                          </span>
                        )}
                      </div>
                      
                      {reminder.reminderNote && (
                        <p className="text-sm text-gray-600 mb-2">
                          {reminder.reminderNote}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          {reminder.emailNotification ? (
                            <Mail className="w-3 h-3" />
                          ) : (
                            <Mail className="w-3 h-3 opacity-30" />
                          )}
                          Email {reminder.emailNotification ? 'On' : 'Off'}
                        </span>
                        <span className="flex items-center gap-1">
                          {reminder.pushNotification ? (
                            <Smartphone className="w-3 h-3" />
                          ) : (
                            <Smartphone className="w-3 h-3 opacity-30" />
                          )}
                          Push {reminder.pushNotification ? 'On' : 'Off'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(reminder)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelReminder(reminder.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Reminder Form */}
        {showForm ? (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              {editingReminder ? 'Edit Reminder' : 'Set New Reminder'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (optional)
                </label>
                <textarea
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  placeholder="Add a note for this reminder..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Methods
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={emailNotification}
                      onChange={(e) => setEmailNotification(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email notification
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pushNotification}
                      onChange={(e) => setPushNotification(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Smartphone className="w-4 h-4" />
                      Push notification
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={handleSetReminder}
                  disabled={!reminderDate || isLoading}
                  className="flex-1"
                >
                  {editingReminder ? 'Update Reminder' : 'Set Reminder'}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Set reminders to be notified about this item
              </p>
              {reminders.length === 0 && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Info className="w-4 h-4" />
                  Get notified when price drops or item comes back in stock
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}