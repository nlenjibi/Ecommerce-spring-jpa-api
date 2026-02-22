'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  className?: string;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalReviews,
  ratingDistribution,
  className = '',
}) => {
  const renderStars = (rating: number, size: 'small' | 'large' = 'large') => {
    const starClass = size === 'large' ? 'w-6 h-6' : 'w-4 h-4';

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starClass} ${i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
              ? 'fill-yellow-200 text-yellow-400'
              : 'text-gray-300'
          }`}
      />
    ));
  };

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  const formatRating = (rating: number) => {
    return (rating ?? 0).toFixed(1);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Overall Rating */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-1 mb-2">
          {renderStars(averageRating)}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatRating(averageRating)}
        </div>
        <div className="text-sm text-gray-600">
          out of 5 stars
        </div>
        <div className="text-lg font-medium text-gray-700 mt-2">
          {totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((starRating) => (
          <div key={starRating} className="flex items-center gap-3">
            {/* Star Rating Label */}
            <div className="flex items-center gap-1 text-sm text-gray-600 w-16">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{starRating}</span>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-yellow-400 h-full transition-all duration-300 ease-out"
                style={{ width: `${getPercentage(ratingDistribution[starRating as keyof typeof ratingDistribution])}%` }}
              />
            </div>

            {/* Count */}
            <div className="text-sm text-gray-600 w-12 text-right">
              {ratingDistribution[starRating as keyof typeof ratingDistribution]}
            </div>

            {/* Percentage */}
            <div className="text-sm text-gray-500 w-12 text-right">
              ({getPercentage(ratingDistribution[starRating as keyof typeof ratingDistribution])}%)
            </div>
          </div>
        ))}
      </div>

      {/* Verified Purchase Indicator */}
      {totalReviews > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            <span className="font-medium">Verified Purchase Reviews</span>
            <span className="block mt-1 text-xs text-gray-500">
              Reviews from customers who purchased this product
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export { ReviewSummary };