'use client';

import React, { useState } from 'react';
import { ChevronDown, Truck, MapPin, Zap, Globe } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { FulfillmentType } from '@/types';

interface FulfillmentOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: FulfillmentType;
}

const fulfillmentOptions: FulfillmentOption[] = [
  {
    id: 'shipped',
    label: 'Shipped',
    icon: <Truck className="w-4 h-4" />,
    value: FulfillmentType.SHIPPED,
  },
  {
    id: 'in-store',
    label: 'In-Store Pickup',
    icon: <MapPin className="w-4 h-4" />,
    value: FulfillmentType.IN_STORE_PICKUP,
  },
  {
    id: 'express',
    label: 'Express Delivery',
    icon: <Zap className="w-4 h-4" />,
    value: FulfillmentType.EXPRESS_DELIVERY,
  },
  {
    id: 'international',
    label: 'International Shipping',
    icon: <Globe className="w-4 h-4" />,
    value: FulfillmentType.INTERNATIONAL_SHIPPING,
  },
];

export function FulfillmentFilter() {
  const { filters, updateFilter } = useFilters();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (value: FulfillmentType) => {
    const updated = filters.fulfillmentTypes.includes(value)
      ? filters.fulfillmentTypes.filter((f) => f !== value)
      : [...filters.fulfillmentTypes, value];
    updateFilter('fulfillmentTypes', updated);
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:text-blue-600 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">Fulfillment Type</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {fulfillmentOptions.map((option) => (
            <label key={option.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.fulfillmentTypes.includes(option.value)}
                onChange={() => handleChange(option.value)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-500 mr-2">{option.icon}</span>
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
