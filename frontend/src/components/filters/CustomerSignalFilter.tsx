'use client';

import React, { useState } from 'react';
import { ChevronDown, Star, TrendingUp, Zap, Clock, Smile } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';

export function CustomerSignalFilter() {
  const { filters, updateFilter } = useFilters();
  const [isExpanded, setIsExpanded] = useState(true);

  const signals = [
    {
      id: 'topRated',
      label: 'Top Rated (4★+)',
      key: 'topRatedOnly' as const,
      icon: <Star className="w-4 h-4" />,
    },
    {
      id: 'trending',
      label: 'Trending',
      key: 'trendingOnly' as const,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'mostPurchased',
      label: 'Most Purchased',
      key: 'mostPurchasedOnly' as const,
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'recentlyViewed',
      label: 'Recently Viewed',
      key: 'recentlyViewedOnly' as const,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'recommended',
      label: 'Recommended for You',
      key: 'recommendedOnly' as const,
      icon: <Smile className="w-4 h-4" />,
    },
  ];

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:text-blue-600 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">Customer Signals</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {signals.map((signal) => (
            <label key={signal.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters[signal.key]}
                onChange={(e) => updateFilter(signal.key, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-500 mr-2">{signal.icon}</span>
              <span className="text-gray-700">{signal.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
