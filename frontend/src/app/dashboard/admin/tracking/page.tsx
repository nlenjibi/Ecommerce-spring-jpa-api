'use client';

import React, { useState, useEffect } from 'react';
import { useTracking } from '@/lib/services/tracking';
import { Button } from '@/components/ui/Button';

export default function TrackingDebugPage() {
  const tracking = useTracking();
  const [events, setEvents] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const storedEvents = tracking.getStoredEvents();
    setEvents(storedEvents);
    setCurrentTime(new Date().toLocaleTimeString());
  }, [refreshKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClear = () => {
    tracking.clearEvents();
    setRefreshKey(prev => prev + 1);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'add_to_cart':
        return '🛒';
      case 'product_click':
        return '👆';
      case 'add_to_wishlist':
        return '❤️';
      case 'product_view':
        return '👁️';
      default:
        return '📊';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'add_to_cart':
        return 'bg-green-100 text-green-800';
      case 'product_click':
        return 'bg-blue-100 text-blue-800';
      case 'add_to_wishlist':
        return 'bg-red-100 text-red-800';
      case 'product_view':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Tracking Events Debug</h1>
              <p className="text-gray-600 mt-1">
                Monitor user interactions and events in real-time
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
              >
                🔄 Refresh
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                🗑️ Clear All
              </Button>
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-blue-900">Total Events:</span>
                <span className="ml-2 text-lg font-bold text-blue-600">{events.length}</span>
              </div>
              <div className="text-sm text-blue-700">
                Last updated: {currentTime || 'Loading...'}
              </div>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking events yet</h3>
              <p className="text-gray-600">
                Start interacting with products to see tracking events here
              </p>
              <div className="mt-6 text-sm text-gray-500">
                <p>Try:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Clicking on a product card</li>
                  <li>• Adding a product to cart</li>
                  <li>• Adding a product to wishlist</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice().reverse().map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getEventIcon(event.event)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.event)}`}>
                            {event.event.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Product:</span>
                            <span className="ml-2 text-gray-900">{event.productName}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">ID:</span>
                            <span className="ml-2 text-gray-900">#{event.productId}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Category:</span>
                            <span className="ml-2 text-gray-900">{event.category}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Price:</span>
                            <span className="ml-2 text-gray-900">GHS {event.price}</span>
                          </div>
                          {event.sessionId && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Session:</span>
                              <span className="ml-2 text-gray-500 text-xs font-mono">{event.sessionId}</span>
                            </div>
                          )}
                          {event.metadata && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700">Metadata:</span>
                              <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

