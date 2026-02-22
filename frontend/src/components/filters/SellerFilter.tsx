'use client';

import React, { useState } from 'react';
import { ChevronDown, Shield, CheckCircle } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { SellerType } from '@/types';

interface SellerOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  value?: SellerType;
}

const sellerOptions: SellerOption[] = [
  {
    id: 'verified',
    label: 'Verified Sellers Only',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    id: 'official',
    label: 'Official Sellers',
    icon: <Shield className="w-4 h-4" />,
    value: SellerType.OFFICIAL,
  },
  {
    id: 'verified-seller',
    label: 'Verified Partners',
    icon: <CheckCircle className="w-4 h-4" />,
    value: SellerType.VERIFIED,
  },
];

export function SellerFilter() {
  const { filters, updateFilter } = useFilters();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleVerifiedChange = (checked: boolean) => {
    updateFilter('verifiedSellerOnly', checked);
  };

  const handleSellerTypeChange = (value: SellerType) => {
    const updated = filters.sellerTypes.includes(value)
      ? filters.sellerTypes.filter((s) => s !== value)
      : [...filters.sellerTypes, value];
    updateFilter('sellerTypes', updated);
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:text-blue-600 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">Seller Type</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifiedSellerOnly}
              onChange={(e) => handleVerifiedChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-500 mr-2">
              <CheckCircle className="w-4 h-4" />
            </span>
            <span className="text-gray-700">Verified Sellers Only</span>
          </label>

          <div className="pl-7 space-y-2">
            {sellerOptions.slice(1).filter(option => option.value).map((option) => (
              <label key={option.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sellerTypes.includes(option.value!)}
                  onChange={() => handleSellerTypeChange(option.value!)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  disabled={!filters.verifiedSellerOnly && option.id !== 'official'}
                />
                <span className="ml-3 text-gray-500 mr-2">{option.icon}</span>
                <span className="text-gray-700 text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
