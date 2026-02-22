import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-12 bg-gray-200 rounded" />
        <div className="h-12 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
