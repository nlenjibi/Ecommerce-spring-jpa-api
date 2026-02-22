'use client';

import React from 'react';

export function SkeletonCategoryCard() {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      role="status"
      aria-label="Loading category"
    >
      {/* Image skeleton with shimmer */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
      </div>

      {/* Category name skeleton */}
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded overflow-hidden relative w-3/4">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200 bg-[length:200%_100%] animate-skeleton-loading" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonCategoryCardGridProps {
  count?: number;
}

export function SkeletonCategoryCardGrid({ count = 6 }: SkeletonCategoryCardGridProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {items.map((i) => (
        <SkeletonCategoryCard key={i} />
      ))}
    </div>
  );
}
