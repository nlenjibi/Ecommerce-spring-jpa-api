'use client';

import React from 'react';

interface SkeletonDashboardProps {
  variant?: 'orders' | 'wishlist' | 'summary';
}

export function SkeletonDashboard({ variant = 'orders' }: SkeletonDashboardProps) {
  if (variant === 'summary') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="status" aria-label="Loading summary">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'wishlist') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Loading wishlist">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse flex-1" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Orders variant
  return (
    <div className="space-y-4" role="status" aria-label="Loading orders">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          {/* Order header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-40" />
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          </div>

          {/* Order items */}
          <div className="border-t pt-4 space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Total and action */}
          <div className="border-t pt-4 flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
