'use client';

import React from 'react';

export function SkeletonProductDetail() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div>
          {/* Main image */}
          <div 
            className="aspect-square bg-gray-200 rounded-lg animate-pulse relative overflow-hidden mb-4"
            role="status"
            aria-label="Loading product image"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </div>

          {/* Thumbnail images */}
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-16 h-16 bg-gray-200 rounded animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Details Skeleton */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/5" />
          </div>

          {/* Stock Status */}
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />

          {/* Seller Info */}
          <div className="border-t pt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/5" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="h-12 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-12 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-12 bg-gray-200 rounded animate-pulse w-full" />
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="border-t pt-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
