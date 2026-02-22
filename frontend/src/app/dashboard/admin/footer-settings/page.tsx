'use client';

import React, { useState } from 'react';
import { Settings, Save, Plus, Trash2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface SecurityBadge {
  id: string;
  label: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface LegalLink {
  id: string;
  label: string;
  url: string;
  isActive: boolean;
}

interface FooterConfig {
  companyDescription: string;
  supportOnlineStatus: boolean;
  storeLocatorUrl: string;
  liveChatUrl: string;
  paymentMethods: PaymentMethod[];
  securityBadges: SecurityBadge[];
  legalLinks: LegalLink[];
  newsletterDescription: string;
}

export default function FooterSettingsPage() {
  const [config, setConfig] = useState<FooterConfig>({
    companyDescription: 'Your one-stop destination for quality products at affordable prices. Shop with confidence on our secure platform.',
    supportOnlineStatus: true,
    storeLocatorUrl: 'https://example.com/store-locator',
    liveChatUrl: 'https://chat.example.com',
    paymentMethods: [
      { id: '1', label: 'Visa', icon: '💳', color: 'bg-blue-100 text-blue-700', isActive: true },
      { id: '2', label: 'Mastercard', icon: '💳', color: 'bg-red-100 text-red-700', isActive: true },
      { id: '3', label: 'Discover', icon: '💳', color: 'bg-orange-100 text-orange-700', isActive: true },
      { id: '4', label: 'Amex', icon: '💳', color: 'bg-green-100 text-green-700', isActive: true },
      { id: '5', label: 'PayPal', icon: '🅿️', color: 'bg-blue-100 text-blue-900', isActive: true },
      { id: '6', label: 'Google Pay', icon: '🔵', color: 'bg-gray-100 text-gray-700', isActive: true },
      { id: '7', label: 'Apple Pay', icon: '🍎', color: 'bg-black text-white', isActive: true },
    ],
    securityBadges: [
      { id: '1', label: 'SSL Certificate', icon: 'Shield', color: 'text-green-400', isActive: true },
      { id: '2', label: 'Payment Security', icon: 'Lock', color: 'text-blue-400', isActive: true },
      { id: '3', label: 'Trust Badge', icon: 'Award', color: 'text-amber-400', isActive: true },
      { id: '4', label: 'Verified Secure', icon: 'Award', color: 'text-purple-400', isActive: true },
    ],
    legalLinks: [
      { id: '1', label: 'Terms of Use', url: '/terms-of-service', isActive: true },
      { id: '2', label: 'Privacy Policy', url: '/privacy-policy', isActive: true },
      { id: '3', label: 'Cookie Preferences', url: '#', isActive: true },
      { id: '4', label: 'Ad Choices', url: '#', isActive: true },
    ],
    newsletterDescription: 'Get exclusive deals, new arrivals, and special offers delivered to your inbox.',
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'security' | 'legal' | 'newsletter'>('general');

  const handleSave = async () => {
    try {
      // TODO: API call to save footer config
      // await api.put('/admin/footer-config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save footer config:', error);
    }
  };

  const addPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      label: 'New Payment',
      icon: '💳',
      color: 'bg-gray-100 text-gray-700',
      isActive: true,
    };
    setConfig({
      ...config,
      paymentMethods: [...config.paymentMethods, newMethod],
    });
  };

  const removePaymentMethod = (id: string) => {
    setConfig({
      ...config,
      paymentMethods: config.paymentMethods.filter(m => m.id !== id),
    });
  };

  const updatePaymentMethod = (id: string, field: keyof PaymentMethod, value: any) => {
    setConfig({
      ...config,
      paymentMethods: config.paymentMethods.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    });
  };

  const addSecurityBadge = () => {
    const newBadge: SecurityBadge = {
      id: Date.now().toString(),
      label: 'New Badge',
      icon: 'Shield',
      color: 'text-blue-400',
      isActive: true,
    };
    setConfig({
      ...config,
      securityBadges: [...config.securityBadges, newBadge],
    });
  };

  const removeSecurityBadge = (id: string) => {
    setConfig({
      ...config,
      securityBadges: config.securityBadges.filter(b => b.id !== id),
    });
  };

  const updateSecurityBadge = (id: string, field: keyof SecurityBadge, value: any) => {
    setConfig({
      ...config,
      securityBadges: config.securityBadges.map(b =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    });
  };

  const addLegalLink = () => {
    const newLink: LegalLink = {
      id: Date.now().toString(),
      label: 'New Link',
      url: '#',
      isActive: true,
    };
    setConfig({
      ...config,
      legalLinks: [...config.legalLinks, newLink],
    });
  };

  const removeLegalLink = (id: string) => {
    setConfig({
      ...config,
      legalLinks: config.legalLinks.filter(l => l.id !== id),
    });
  };

  const updateLegalLink = (id: string, field: keyof LegalLink, value: any) => {
    setConfig({
      ...config,
      legalLinks: config.legalLinks.map(l =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    });
  };

  const tabClasses = (tab: string) =>
    `px-4 py-2 rounded-t-lg transition-colors ${
      activeTab === tab
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-white">Footer Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['general', 'payments', 'security', 'legal', 'newsletter'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={tabClasses(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-gray-800 rounded-b-lg p-8">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Company Description</label>
              <textarea
                value={config.companyDescription}
                onChange={(e) => setConfig({ ...config, companyDescription: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1">Appears in the footer's company info section</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Support Status</label>
                <select
                  value={config.supportOnlineStatus ? 'online' : 'offline'}
                  onChange={(e) => setConfig({ ...config, supportOnlineStatus: e.target.value === 'online' })}
                  className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Display online/offline status indicator</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Store Locator URL</label>
                <input
                  type="url"
                  value={config.storeLocatorUrl}
                  onChange={(e) => setConfig({ ...config, storeLocatorUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com/stores"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Live Chat URL</label>
              <input
                type="url"
                value={config.liveChatUrl}
                onChange={(e) => setConfig({ ...config, liveChatUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://chat.example.com"
              />
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Payment Methods</h2>
              <button
                onClick={addPaymentMethod}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Method
              </button>
            </div>

            <div className="space-y-4">
              {config.paymentMethods.map((method) => (
                <div key={method.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{method.label}</h3>
                    <button
                      onClick={() => removePaymentMethod(method.id)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={method.label}
                      onChange={(e) => updatePaymentMethod(method.id, 'label', e.target.value)}
                      placeholder="Payment method name"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={method.icon}
                      onChange={(e) => updatePaymentMethod(method.id, 'icon', e.target.value)}
                      placeholder="Icon emoji"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={method.color}
                      onChange={(e) => updatePaymentMethod(method.id, 'color', e.target.value)}
                      placeholder="Tailwind classes"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none col-span-2"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={method.isActive}
                      onChange={(e) => updatePaymentMethod(method.id, 'isActive', e.target.checked)}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Badges */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Security Badges</h2>
              <button
                onClick={addSecurityBadge}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Badge
              </button>
            </div>

            <div className="space-y-4">
              {config.securityBadges.map((badge) => (
                <div key={badge.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{badge.label}</h3>
                    <button
                      onClick={() => removeSecurityBadge(badge.id)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={badge.label}
                      onChange={(e) => updateSecurityBadge(badge.id, 'label', e.target.value)}
                      placeholder="Badge name"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={badge.icon}
                      onChange={(e) => updateSecurityBadge(badge.id, 'icon', e.target.value)}
                      placeholder="Icon name"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={badge.color}
                      onChange={(e) => updateSecurityBadge(badge.id, 'color', e.target.value)}
                      placeholder="Color class"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none col-span-2"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={badge.isActive}
                      onChange={(e) => updateSecurityBadge(badge.id, 'isActive', e.target.checked)}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Links */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Legal Links</h2>
              <button
                onClick={addLegalLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>

            <div className="space-y-4">
              {config.legalLinks.map((link) => (
                <div key={link.id} className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{link.label}</h3>
                    <button
                      onClick={() => removeLegalLink(link.id)}
                      className="p-2 text-red-400 hover:bg-red-600/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLegalLink(link.id, 'label', e.target.value)}
                      placeholder="Link label"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLegalLink(link.id, 'url', e.target.value)}
                      placeholder="URL or path"
                      className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={link.isActive}
                      onChange={(e) => updateLegalLink(link.id, 'isActive', e.target.checked)}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Newsletter Description</label>
              <textarea
                value={config.newsletterDescription}
                onChange={(e) => setConfig({ ...config, newsletterDescription: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-400 mt-1">Displayed above the email input field</p>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                Newsletter subscribers are stored in the database. Use the Analytics dashboard to view subscriber list and export data.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link
          href="/admin"
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}

