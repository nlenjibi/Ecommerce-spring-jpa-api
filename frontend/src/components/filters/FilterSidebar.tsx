'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useFilters } from '@/context/FilterContext';
import { Button } from '@/components/ui/Button';
import { StockFilter } from './StockFilter';
import { FulfillmentFilter } from './FulfillmentFilter';
import { PriceAndDealFilter } from './PriceAndDealFilter';
import { CustomerSignalFilter } from './CustomerSignalFilter';
import { ConditionFilter } from './ConditionFilter';
import { SellerFilter } from './SellerFilter';

interface FilterSidebarProps {
  onClose?: () => void;
  isOpen?: boolean;
  isMobile?: boolean;
}

export function FilterSidebar({ onClose, isOpen = true, isMobile = false }: FilterSidebarProps) {
  const { resetFilters } = useFilters();

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <div
      className={`
        ${isMobile
          ? 'fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          : 'hidden lg:block'
        }
      `}
      onClick={isMobile ? onClose : undefined}
    >
      <div
        className={`
          ${isMobile
            ? 'fixed left-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto'
            : 'relative'
          }
          ${!isMobile && 'bg-white rounded-xl shadow-md sticky top-4'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="p-6 space-y-6">
          <StockFilter />
          <FulfillmentFilter />
          <ConditionFilter />
          <SellerFilter />
          <PriceAndDealFilter />
          <CustomerSignalFilter />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
          <Button
            onClick={resetFilters}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
