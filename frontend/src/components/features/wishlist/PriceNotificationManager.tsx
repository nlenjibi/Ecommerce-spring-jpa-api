'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  DollarSign,
  Bell,
  BellOff,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Settings,
  Percent,
} from 'lucide-react';
import { useWishlist, WishlistItem } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface NotificationSettings {
  targetPrice?: number;
  notifyOnPriceDrop: boolean;
  notifyOnStock: boolean;
  shouldNotifyPriceDrop: boolean;
  shouldNotifyStock: boolean;
}

interface PriceNotificationManagerProps {
  item: WishlistItem;
  onUpdate?: (productId: number, updates: any) => void;
  className?: string;
}

export function PriceNotificationManager({
  item,
  onUpdate,
  className = '',
}: PriceNotificationManagerProps) {
  const { user, token } = useAuth();
  const { updateWishlistItem } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    notifyOnPriceDrop: item.notifyOnPriceDrop,
    notifyOnStock: item.notifyOnStock,
    shouldNotifyPriceDrop: item.shouldNotifyPriceDrop,
    shouldNotifyStock: item.shouldNotifyStock,
    targetPrice: item.targetPrice,
  });

  // Update notification settings
  const handleUpdateSettings = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      const updates = {
        targetPrice: notificationSettings.targetPrice,
        notifyOnPriceDrop: notificationSettings.notifyOnPriceDrop,
        notifyOnStock: notificationSettings.notifyOnStock,
        shouldNotifyPriceDrop: notificationSettings.shouldNotifyPriceDrop,
        shouldNotifyStock: notificationSettings.shouldNotifyStock,
      };

      await updateWishlistItem(item.productId, updates);
      toast.success('Notification settings updated');
      onUpdate?.(item.productId, updates);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate price drop percentage
  const priceDropPercentage = item.priceWhenAdded > 0 
    ? ((item.priceWhenAdded - item.currentPrice) / item.priceWhenAdded) * 100
    : 0;

  // Check if target price is reached
  const isTargetPriceReached = item.targetPrice && item.currentPrice <= item.targetPrice;

  // Check notifications status
  const hasActiveNotifications = 
    notificationSettings.notifyOnPriceDrop || 
    notificationSettings.notifyOnStock || 
    notificationSettings.targetPrice;

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">{item.product.name}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showSettings ? 'Done' : 'Settings'}
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Notification Status Overview */}
        {!showSettings && (
          <div className="space-y-4">
            {/* Target Price Status */}
            {item.targetPrice && (
              <div className={`p-4 rounded-lg border ${
                isTargetPriceReached
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isTargetPriceReached ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Target className={`w-5 h-5 ${
                        isTargetPriceReached ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Target Price: ${item.targetPrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: ${item.currentPrice.toFixed(2)}
                        {isTargetPriceReached && (
                          <span className="text-green-600 font-medium ml-2">
                            ✓ Target reached!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.shouldNotifyPriceDrop && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            )}

            {/* Price Drop Status */}
            {item.isPriceDropped && (
              <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Price Drop Detected!
                      </div>
                      <div className="text-sm text-gray-600">
                        ${item.priceWhenAdded.toFixed(2)} → ${item.currentPrice.toFixed(2)}
                        <span className="text-green-600 font-medium ml-2">
                          ({Math.abs(priceDropPercentage).toFixed(1)}% off)
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.notifyOnPriceDrop && (
                    <Bell className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className={`p-4 rounded-lg border ${
              item.inStock
                ? 'border-green-200 bg-green-50'
                : 'border-orange-200 bg-orange-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.inStock ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <div className={`w-5 h-5 rounded-full ${
                      item.inStock ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.inStock
                        ? 'Available for purchase'
                        : 'Currently unavailable'
                      }
                    </div>
                  </div>
                </div>
                {item.shouldNotifyStock && (
                  item.inStock ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Bell className="w-5 h-5 text-orange-500" />
                  )
                )}
              </div>
            </div>

            {/* Notification Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Active Notifications
                </span>
              </div>
              <div className="space-y-2 text-sm text-blue-800">
                {item.targetPrice && item.shouldNotifyPriceDrop && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Target price alert
                  </div>
                )}
                {item.notifyOnPriceDrop && (
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Price drop alerts
                  </div>
                )}
                {item.notifyOnStock && !item.inStock && (
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Back in stock alert
                  </div>
                )}
                {!hasActiveNotifications && (
                  <div className="text-blue-700 italic">
                    No notifications enabled for this item
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-6">
            {/* Target Price Setting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price (optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={notificationSettings.targetPrice || ''}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    targetPrice: e.target.value ? parseFloat(e.target.value) : undefined
                  }))}
                  placeholder="Enter target price"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Get notified when the price drops to this amount or lower
              </p>
            </div>

            {/* Notification Toggles */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Email Notifications
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Price Drops
                      </div>
                      <div className="text-xs text-gray-600">
                        When this item goes on sale
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyOnPriceDrop}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      notifyOnPriceDrop: e.target.checked,
                      shouldNotifyPriceDrop: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Back in Stock
                      </div>
                      <div className="text-xs text-gray-600">
                        When this item becomes available again
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.notifyOnStock}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      notifyOnStock: e.target.checked,
                      shouldNotifyStock: e.target.checked
                    }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>

                {notificationSettings.targetPrice && (
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Target Price Reached
                        </div>
                        <div className="text-xs text-gray-600">
                          When price drops to ${notificationSettings.targetPrice?.toFixed(2)} or lower
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.shouldNotifyPriceDrop}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        shouldNotifyPriceDrop: e.target.checked
                      }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                onClick={handleUpdateSettings}
                disabled={isLoading}
                className="flex-1"
              >
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}