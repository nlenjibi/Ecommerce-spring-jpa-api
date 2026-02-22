'use client';

import React from 'react';
import { StockStatus } from '@/types';

interface StockBadgeProps {
  status?: StockStatus;
  stock?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StockBadge({ status, stock, size = 'md' }: StockBadgeProps) {
  // Determine status based on stock parameter if status not provided
  const displayStatus = status || (stock && stock > 0 ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK);

  const isInStock = displayStatus === StockStatus.IN_STOCK;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-semibold',
    lg: 'px-4 py-2 text-base font-semibold',
  };

  const baseClasses = 'rounded-full inline-block';
  const statusClasses = isInStock
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${statusClasses}`}>
      {isInStock ? 'In Stock' : 'Out of Stock'}
    </span>
  );
}
