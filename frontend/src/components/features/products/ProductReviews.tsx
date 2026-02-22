'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import AddReviewForm from '@/components/features/review/AddReviewForm';
import ReviewList from '@/components/features/review/ReviewList';
import { reviewsApi } from '@/lib/api';

interface ProductReviewsProps {
  productId: number;
  productName?: string;
  initialAverageRating?: number;
  initialTotalReviews?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  initialAverageRating = 0,
  initialTotalReviews = 0
}) => {
  const { isAuthenticated } = useAuth();
  const [showAddReview, setShowAddReview] = useState(false);
  const [averageRating, setAverageRating] = useState(initialAverageRating || 0);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews || 0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingRating, setLoadingRating] = useState(true);

  // Update states if initial props change
  useEffect(() => {
    if (initialAverageRating !== undefined) setAverageRating(initialAverageRating || 0);
    if (initialTotalReviews !== undefined) setTotalReviews(initialTotalReviews || 0);
  }, [initialAverageRating, initialTotalReviews]);

  // Fetch product rating
  useEffect(() => {
    fetchProductRating();
  }, [productId]);

  const fetchProductRating = async () => {
    try {
      setLoadingRating(true);
      const response = await reviewsApi.getProductRating(productId);
      if (response && response.success && response.data) {
        setAverageRating(response.data.averageRating || 0);
        setTotalReviews(response.data.totalReviews || 0);
      }
    } catch (err) {
      // Don't show error if we have initial values
      if (!averageRating && !totalReviews) {
        console.error('Failed to fetch product rating:', err);
      }
    } finally {
      setLoadingRating(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowAddReview(false);
    setRefreshTrigger(prev => prev + 1);
    fetchProductRating();
  };

  return (
    <div className="space-y-8">
      {/* Add Review Section */}
      <div>
        {!isAuthenticated ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <LogIn className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Share Your Review</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Sign in to your account to write a review and help other customers.
                </p>
                <Link href="/auth/login">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Sign In to Review
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : !showAddReview ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="font-semibold text-gray-900">Have you used this product?</h3>
              <p className="text-sm text-gray-600">Share your experience and help other customers</p>
            </div>
            <Button
              onClick={() => setShowAddReview(true)}
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
            >
              Write a Review
            </Button>
          </div>
        ) : (
          <AddReviewForm
            productId={productId}
            productName={productName}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowAddReview(false)}
          />
        )}
      </div>

      {/* Reviews List */}
      <ReviewList
        key={refreshTrigger}
        productId={productId}
        averageRating={averageRating}
        totalReviewsCount={totalReviews}
        onReviewDeleted={fetchProductRating}
      />
    </div>
  );
};

export default ProductReviews;
export { ProductReviews };
