'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';

export function StockFilter() {
  const { filters, updateFilter } = useFilters();
  const [isExpanded, setIsExpanded] = useState(true);

  const stockOptions = [
    { id: 'inStock', label: 'In Stock', key: 'inStock' as const },
    { id: 'lowStock', label: 'Low Stock', key: 'lowStock' as const },
    { id: 'availableToday', label: 'Available Today', key: 'availableToday' as const },
    { id: 'outOfStock', label: 'Out of Stock (View Only)', key: 'outOfStock' as const },
  ];

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:text-blue-600 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">Stock & Availability</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {stockOptions.map((option) => (
            <label key={option.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters[option.key]}
                onChange={(e) => updateFilter(option.key, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
