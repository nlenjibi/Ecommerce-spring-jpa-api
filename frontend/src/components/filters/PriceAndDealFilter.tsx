'use client';

import React, { useState } from 'react';
import { ChevronDown, Tag, Zap, Truck } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';

export function PriceAndDealFilter() {
  const { filters, updateFilter } = useFilters();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 hover:text-blue-600 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">Price & Deals</h3>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])
                }
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                min="0"
                max="10000"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])
                }
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Discount Filters */}
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.discountedOnly}
                onChange={(e) => updateFilter('discountedOnly', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-500 mr-2">
                <Tag className="w-4 h-4" />
              </span>
              <span className="text-gray-700">Discounted Items</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.flashSaleOnly}
                onChange={(e) => updateFilter('flashSaleOnly', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-500 mr-2">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-gray-700">Flash Sale</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.freeShippingOnly}
                onChange={(e) => updateFilter('freeShippingOnly', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-500 mr-2">
                <Truck className="w-4 h-4" />
              </span>
              <span className="text-gray-700">Free Shipping</span>
            </label>
          </div>

          {/* Minimum Discount Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Discount: {filters.minDiscount}%+
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={filters.minDiscount}
              onChange={(e) => updateFilter('minDiscount', Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
