'use client';

import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  const rowArray = Array.from({ length: rows }, (_, i) => i);
  const colArray = Array.from({ length: columns }, (_, i) => i);

  return (
    <div 
      className="border rounded-lg overflow-hidden"
      role="status"
      aria-label="Loading table data"
    >
      {/* Header skeleton */}
      <div className="bg-gray-100 border-b grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {colArray.map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>

      {/* Row skeletons */}
      {rowArray.map((rowIdx) => (
        <div
          key={rowIdx}
          className="border-b grid gap-4 p-4 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {colArray.map((colIdx) => (
            <div key={colIdx} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonChartProps {
  height?: number;
}

export function SkeletonChart({ height = 300 }: SkeletonChartProps) {
  return (
    <div 
      className="bg-white rounded-lg border p-6"
      role="status"
      aria-label="Loading chart"
      style={{ minHeight: `${height}px` }}
    >
      {/* Chart header skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
      </div>

      {/* Chart area with bars */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <div 
                className="bg-gray-200 rounded animate-pulse relative overflow-hidden"
                style={{ height: `${Math.random() * 150 + 50}px` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
              </div>
            </div>
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
