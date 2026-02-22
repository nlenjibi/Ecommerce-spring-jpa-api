'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Edit2, Plus, X, AlertCircle } from 'lucide-react';
import { helpSupportApi } from '@/lib/api';
import { HelpLink, ChatConfig } from '@/types';
import { Button } from '@/components/ui/Button';

type EditingType = 'helpLink' | 'chatConfig' | null;

export default function HelpSettingsPage() {
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>([]);
  const [chatConfigs, setChatConfigs] = useState<ChatConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floatingButtonEnabled, setFloatingButtonEnabled] = useState(true);
  const [floatingButtonPosition, setFloatingButtonPosition] = useState<'bottom-left' | 'bottom-right'>('bottom-right');

  // Form state
  const [editingType, setEditingType] = useState<EditingType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'help' as 'contact' | 'live-chat' | 'help' | 'tracking' | 'returns' | 'faq',
    type: 'whatsapp' as const,
    displayText: '',
    displayOrder: 0,
    icon: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get help links
      const helpResponse = await fetch('/api/admin/help-support/links')
        .then(res => res.json())
        .catch(() => ({
          helpLinks: [],
        }));
      if (helpResponse && helpResponse.helpLinks) {
        setHelpLinks(helpResponse.helpLinks);
      }

      // Get chat configs
      const chatResponse = await fetch('/api/admin/help-support/chat-configs')
        .then(res => res.json())
        .catch(() => ({
          chatConfigs: [],
        }));
      if (chatResponse && chatResponse.chatConfigs) {
        setChatConfigs(chatResponse.chatConfigs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHelpLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url) {
      setError('Please fill in required fields');
      return;
    }

    try {
      setError(null);

      if (editingId && editingType === 'helpLink') {
        await helpSupportApi.updateHelpLink(editingId, {
          title: formData.title,
          description: formData.description,
          url: formData.url,
          category: formData.category,
          displayOrder: formData.displayOrder,
          icon: formData.icon,
        });
      } else {
        await helpSupportApi.createHelpLink({
          title: formData.title,
          description: formData.description,
          url: formData.url,
          category: formData.category,
          displayOrder: formData.displayOrder,
          icon: formData.icon,
        });
      }

      resetForm();
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save help link');
    }
  };

  const handleAddChatConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url) {
      setError('Please fill in required fields');
      return;
    }

    try {
      setError(null);

      if (editingId && editingType === 'chatConfig') {
        await helpSupportApi.updateChatConfig(editingId, {
          type: formData.type,
          title: formData.title,
          url: formData.url,
          displayText: formData.displayText,
          displayOrder: formData.displayOrder,
          icon: formData.icon,
        });
      } else {
        await helpSupportApi.createChatConfig({
          type: formData.type,
          title: formData.title,
          url: formData.url,
          displayText: formData.displayText,
          displayOrder: formData.displayOrder,
          icon: formData.icon,
        });
      }

      resetForm();
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chat config');
    }
  };

  const handleDeleteHelpLink = async (id: number) => {
    if (!confirm('Delete this help link?')) return;

    try {
      await helpSupportApi.deleteHelpLink(id);
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete help link');
    }
  };

  const handleDeleteChatConfig = async (id: number) => {
    if (!confirm('Delete this chat config?')) return;

    try {
      await helpSupportApi.deleteChatConfig(id);
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat config');
    }
  };

  const handleEditHelpLink = (link: HelpLink) => {
    setEditingType('helpLink');
    setEditingId(link.id);
    setFormData({
      title: link.title,
      description: link.description || '',
      url: link.url,
      category: link.category as any,
      type: 'whatsapp',
      displayText: '',
      displayOrder: link.displayOrder,
      icon: link.icon || '',
    });
  };

  const handleEditChatConfig = (config: ChatConfig) => {
    setEditingType('chatConfig');
    setEditingId(config.id);
    setFormData({
      title: config.title,
      description: '',
      url: config.url,
      category: 'live-chat',
      type: config.type as any,
      displayText: config.displayText || '',
      displayOrder: config.displayOrder,
      icon: config.icon || '',
    });
  };

  const resetForm = () => {
    setEditingType(null);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      category: 'help',
      type: 'whatsapp',
      displayText: '',
      displayOrder: 0,
      icon: '',
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Help & Support Settings</h1>
        <Link href="/admin">
          <Button variant="secondary">Back to Admin</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6 flex gap-2">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Floating Button Settings */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Floating Chat Button</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={floatingButtonEnabled}
              onChange={(e) => setFloatingButtonEnabled(e.target.checked)}
              className="w-5 h-5"
              id="floating-enabled"
            />
            <label htmlFor="floating-enabled" className="font-medium">
              Enable floating chat button
            </label>
          </div>

          {floatingButtonEnabled && (
            <div className="space-y-2">
              <label className="block font-medium">Position</label>
              <select
                value={floatingButtonPosition}
                onChange={(e) => setFloatingButtonPosition(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          )}

          <Button
            onClick={async () => {
              try {
                await helpSupportApi.updateFloatingButton({
                  enabled: floatingButtonEnabled,
                  position: floatingButtonPosition,
                });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save settings');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Button Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Help Links Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Help Links</h2>
            {editingType !== 'helpLink' && (
              <button
                onClick={() => setEditingType('helpLink')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} /> Add
              </button>
            )}
          </div>

          {/* Form */}
          {editingType === 'helpLink' && (
            <form onSubmit={handleAddHelpLink} className="bg-gray-50 p-6 rounded-lg space-y-4 border">
              <div>
                <label className="block font-medium text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="contact">Contact</option>
                  <option value="live-chat">Live Chat</option>
                  <option value="help">Help</option>
                  <option value="tracking">Tracking</option>
                  <option value="returns">Returns</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Add'} Help Link
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : helpLinks.length === 0 ? (
              <p className="text-gray-500">No help links added yet</p>
            ) : (
              helpLinks.map((link) => (
                <div key={link.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.url}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                      {link.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditHelpLink(link)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteHelpLink(link.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Configs Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Chat Configurations</h2>
            {editingType !== 'chatConfig' && (
              <button
                onClick={() => setEditingType('chatConfig')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} /> Add
              </button>
            )}
          </div>

          {/* Form */}
          {editingType === 'chatConfig' && (
            <form onSubmit={handleAddChatConfig} className="bg-gray-50 p-6 rounded-lg space-y-4 border">
              <div>
                <label className="block font-medium text-sm mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook Messenger</option>
                  <option value="telegram">Telegram</option>
                  <option value="live_chat">Live Chat</option>
                  <option value="custom_link">Custom Link</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-sm mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-sm mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://wa.me/1234567890 or https://m.me/..."
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Add'} Chat Config
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="space-y-2">
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : chatConfigs.length === 0 ? (
              <p className="text-gray-500">No chat configs added yet</p>
            ) : (
              chatConfigs.map((config) => (
                <div key={config.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{config.title}</h3>
                    <p className="text-sm text-gray-600">{config.url}</p>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                      {config.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditChatConfig(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteChatConfig(config.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
