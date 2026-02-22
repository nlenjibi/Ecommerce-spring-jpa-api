'use client';

import React, { useState } from 'react';
import { ChevronDown, Badge } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { ProductCondition } from '@/types';

interface ConditionOption {
  id: string;
  label: string;
  value: ProductCondition;
}

const conditionOptions: ConditionOption[] = [
  { id: 'new', label: 'New', value: ProductCondition.NEW },
  { id: 'like-new', label: 'Like New', value: ProductCondition.LIKE_NEW },
  { id: 'refurbished', label: 'Refurbished', value: ProductCondition.REFURBISHED },
  { id: 'used', label: 'Used', value: ProductCondition.USED },
];

export function ConditionFilter() {
  const { filters, updateFilter } = useFilters();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (value: ProductCondition) => {
    const updated = filters.condition.includes(value)
      ? filters.condition.filter((c) => c !== value)
      : [...filters.condition, value];
    updateFilter('condition', updated);
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:text-blue-600 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">Condition</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {conditionOptions.map((option) => (
            <label key={option.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.condition.includes(option.value)}
                onChange={() => handleChange(option.value)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-500 mr-2">
                <Badge className="w-4 h-4" />
              </span>
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
