'use client';

import React from 'react';

export function SkeletonProductCard() {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm"
      role="status"
      aria-label="Loading product"
    >
      {/* Image skeleton with shimmer */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
        </div>
        <div className="h-3 bg-gray-200 rounded overflow-hidden relative w-3/4">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
        </div>

        {/* Price section */}
        <div className="space-y-2 pt-2">
          <div className="h-5 bg-gray-200 rounded overflow-hidden relative w-1/3">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
          </div>
          <div className="h-3 bg-gray-200 rounded overflow-hidden relative w-1/4">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex gap-2 items-center">
          <div className="h-4 bg-gray-200 rounded overflow-hidden relative w-16">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
          </div>
          <div className="h-3 bg-gray-200 rounded overflow-hidden relative w-12">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <div className="h-9 bg-gray-200 rounded overflow-hidden relative flex-1">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
          </div>
          <div className="h-9 bg-gray-200 rounded overflow-hidden relative w-10">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkeletonProductCardGridProps {
  count?: number;
  columns?: number;
}

export function SkeletonProductCardGrid({ count = 6, columns = 3 }: SkeletonProductCardGridProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {items.map((i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}
