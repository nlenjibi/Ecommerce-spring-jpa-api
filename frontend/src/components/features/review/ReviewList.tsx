'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, AlertCircle, Filter } from 'lucide-react';
import { UserReview } from '@/types';
import { SkeletonLoader } from '@/components/features/SkeletonLoader';
import ReviewItem from '@/components/features/review/ReviewItem';
import AddReviewForm from '@/components/features/review/AddReviewForm';
import { reviewsApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/context/AuthContext';
import { verifyPurchase } from '@/lib/utils/review';

type SortOption = 'recent' | 'highest' | 'lowest';

interface ReviewListProps {
  productId: number;
  averageRating?: number;
  totalReviewsCount?: number;
  onReviewDeleted?: () => void;
  isAdmin?: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  averageRating = 0,
  totalReviewsCount = 0,
  onReviewDeleted,
  isAdmin = false,
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [verifiedPurchases, setVerifiedPurchases] = useState<Set<number>>(new Set());
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const size = 10;
  const totalPages = Math.ceil(totalReviews / size);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, page, filterRating, filterVerified]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsApi.getProductReviews(productId, {
        page: page - 1, // API uses 0-based indexing
        size,
        sortBy: sortBy === 'recent' ? 'createdAt' : sortBy === 'highest' ? 'rating' : 'rating',
        direction: sortBy === 'highest' ? 'desc' : sortBy === 'lowest' ? 'asc' : 'desc',
      });

      if (response.success && response.data) {
        const transformedReviews = response.data.content.map((review: any) => ({
          ...review,
          userName: `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 'Anonymous',
          userId: review.user?.id,
          userEmail: review.user?.email,
          isVerifiedPurchase: review.verifiedPurchase,
          helpfulCount: review.helpfulCount || 0,
          unhelpfulCount: review.notHelpfulCount || 0,
        }));

        // Apply filters
        let filteredReviews = transformedReviews;
        if (filterRating !== null) {
          filteredReviews = filteredReviews.filter(review => review.rating === filterRating);
        }
        if (filterVerified !== null) {
          filteredReviews = filteredReviews.filter(review => review.isVerifiedPurchase === filterVerified);
        }

        setReviews(filteredReviews);
        setTotalReviews(response.data.totalElements);

        // Check verified purchases if user is logged in
        if (user?.id) {
          const verified = await checkVerifiedPurchases(transformedReviews);
          setVerifiedPurchases(verified);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkVerifiedPurchases = async (reviews: UserReview[]) => {
    if (!user?.id) return new Set<number>();

    const verifiedSet = new Set<number>();
    for (const review of reviews) {
      if (review.userId === user.id) {
        const isVerified = await verifyPurchase(productId, user.id);
        if (isVerified) {
          verifiedSet.add(review.id);
        }
      }
    }
    return verifiedSet;
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!user?.id) return;

    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;

    try {
      await reviewsApi.deleteReview(reviewId, user.id);
      setReviews((reviews || []).filter(r => r.id !== reviewId));
      setTotalReviews(totalReviews - 1);
      onReviewDeleted?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      const response = await reviewsApi.markHelpful(reviewId);
      // Update helpful count locally since API doesn't return updated review
      setReviews((reviews || []).map(r => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r)));
    } catch (err) {
      console.error('Failed to mark as helpful:', err);
    }
  };

  const handleMarkUnhelpful = async (reviewId: number) => {
    try {
      const response = await reviewsApi.markUnhelpful(reviewId);
      // Update unhelpful count locally since API doesn't return updated review
      setReviews((reviews || []).map(r => (r.id === reviewId ? { ...r, unhelpfulCount: r.unhelpfulCount + 1 } : r)));
    } catch (err) {
      console.error('Failed to mark as unhelpful:', err);
    }
  };

  const handleEditReview = (review: UserReview) => {
    setEditingReview(review);
  };

  const handleReviewUpdate = () => {
    setEditingReview(null);
    fetchReviews(); // Refresh reviews after update
    onReviewDeleted?.(); // Refresh rating stats
  };

  const handleResponseAdded = () => {
    fetchReviews(); // Refresh reviews to show new response
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div key={rating} className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-yellow-400 h-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Error loading reviews</h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={fetchReviews}
            className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div>
            <div className="flex items-start gap-4">
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  {(averageRating ?? 0).toFixed(1)}
                </div>
                <div className="flex gap-1 mt-2">
                  {renderStars(averageRating ?? 0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on {totalReviewsCount} {totalReviewsCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) =>
              renderRatingBar(rating, ratingDistribution[rating] || 0, totalReviewsCount)
            )}
          </div>
        </div>
      </div>

      {/* Sort and Filter Options */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>

        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filterRating !== null || filterVerified !== null) && (
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>

            {showFilters && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-64">
                <h4 className="font-medium text-gray-900 mb-3">Filter Reviews</h4>

                {/* Rating Filter */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterRating(filterRating === 5 ? null : 5)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filterRating === 5
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      5 Stars
                    </button>
                    <button
                      onClick={() => setFilterRating(filterRating === 4 ? null : 4)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filterRating === 4
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      4 Stars
                    </button>
                    <button
                      onClick={() => setFilterRating(filterRating === 3 ? null : 3)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filterRating === 3
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      3 Stars
                    </button>
                    <button
                      onClick={() => setFilterRating(filterRating === 2 ? null : 2)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filterRating === 2
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      2 Stars
                    </button>
                    <button
                      onClick={() => setFilterRating(filterRating === 1 ? null : 1)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filterRating === 1
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      1 Star
                    </button>
                  </div>
                </div>

                {/* Verified Purchase Filter */}
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Purchase Status</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterVerified(filterVerified === true ? null : true)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${filterVerified === true
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      ✓ Verified Purchase
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setFilterRating(null);
                    setFilterVerified(null);
                    setShowFilters(false);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <label htmlFor="sort-reviews" className="text-sm font-medium text-gray-700 mr-2">
              Sort by:
            </label>
            <select
              id="sort-reviews"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setPage(1);
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonLoader count={3} variant="product" />
        </div>
      ) : (!reviews || reviews.length === 0) ? (
        <EmptyState
          title="No reviews yet"
          description="Be the first to share your thoughts about this product."
          icon="MessageSquare"
        />
      ) : editingReview ? (
        <AddReviewForm
          productId={productId}
          reviewId={editingReview.id}
          initialData={{
            rating: editingReview.rating,
            title: editingReview.title,
            comment: editingReview.comment,
          }}
          isEditing={true}
          onSuccess={handleReviewUpdate}
          onCancel={() => setEditingReview(null)}
          productName={undefined} // We don't need product name in edit mode
        />
      ) : (
        <div className="space-y-4">
          {reviews && reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onDelete={() => handleDeleteReview(review.id)}
              onMarkHelpful={() => handleMarkHelpful(review.id)}
              onMarkUnhelpful={() => handleMarkUnhelpful(review.id)}
              onEdit={handleEditReview}
              currentUserId={user?.id}
              isAdmin={isAdmin}
              isVerifiedPurchase={verifiedPurchases.has(review.id)}
              onResponseAdded={handleResponseAdded}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isVisible = Math.abs(pageNum - page) <= 1 || pageNum === 1 || pageNum === totalPages;

            if (!isVisible && i > 0 && i < totalPages - 1) {
              if (i === 1) return <span key="ellipsis" className="text-gray-500">...</span>;
              return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pageNum === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
