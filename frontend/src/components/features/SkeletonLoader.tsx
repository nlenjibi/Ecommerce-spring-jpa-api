'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface SkeletonLoaderProps {
  count?: number;
  variant?: 'product' | 'text' | 'compact';
}

export function SkeletonLoader({ count = 6, variant = 'product' }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'text') {
    return (
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden">
          {/* Image skeleton */}
          <div className="aspect-square bg-gray-200 animate-pulse" />

          {/* Content skeleton */}
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
