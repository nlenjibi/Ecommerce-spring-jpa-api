'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Save, Store, CreditCard, Mail, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'ShopHub',
    storeEmail: 'support@shophub.com',
    storePhone: '+1 (555) 123-4567',
    currency: 'USD',
    taxRate: 8,
    shippingCost: 9.99,
    freeShippingThreshold: 50,
    orderNotifications: true,
    stockAlerts: true,
    lowStockThreshold: 10,
    stripeEnabled: true,
    paypalEnabled: false,
    maintenanceMode: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof settings) => adminApi.updateSettings(data),
    onSuccess: () => toast.success('Settings saved successfully'),
    onError: () => toast.error('Failed to save settings'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your store settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Store Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping & Tax */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Shipping & Tax</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.shippingCost}
                onChange={(e) => setSettings({ ...settings, shippingCost: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Order Notifications</p>
                <p className="text-sm text-gray-500">Receive email notifications for new orders</p>
              </div>
              <input
                type="checkbox"
                checked={settings.orderNotifications}
                onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-gray-500">Get notified when products are running low</p>
              </div>
              <input
                type="checkbox"
                checked={settings.stockAlerts}
                onChange={(e) => setSettings({ ...settings, stockAlerts: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            {settings.stockAlerts && (
              <div className="ml-4 pl-4 border-l-2 border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold">Payment Methods</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">Stripe</p>
                <p className="text-sm text-gray-500">Accept credit card payments via Stripe</p>
              </div>
              <input
                type="checkbox"
                checked={settings.stripeEnabled}
                onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium">PayPal</p>
                <p className="text-sm text-gray-500">Accept payments via PayPal</p>
              </div>
              <input
                type="checkbox"
                checked={settings.paypalEnabled}
                onChange={(e) => setSettings({ ...settings, paypalEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-red-600">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Put the store in maintenance mode (only admins can access)</p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
