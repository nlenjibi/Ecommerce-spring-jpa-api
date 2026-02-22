'use client';

import React from 'react';

interface SkeletonCheckoutProps {
  variant?: 'cart' | 'addresses' | 'payment';
}

export function SkeletonCheckout({ variant = 'cart' }: SkeletonCheckoutProps) {
  if (variant === 'cart') {
    return (
      <div className="space-y-4" role="status" aria-label="Loading cart items">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 flex gap-4">
            {/* Product image */}
            <div className="w-24 h-24 bg-gray-200 rounded animate-pulse flex-shrink-0" />

            {/* Product info */}
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>

            {/* Quantity and price */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'addresses') {
    return (
      <div className="space-y-4" role="status" aria-label="Loading addresses">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
          </div>
        ))}
      </div>
    );
  }

  // Payment variant
  return (
    <div className="space-y-6" role="status" aria-label="Loading payment options">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
          </div>
          <div className="space-y-2 ml-8">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
