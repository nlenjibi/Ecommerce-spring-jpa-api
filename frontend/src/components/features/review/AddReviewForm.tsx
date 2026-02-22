'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { reviewsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { canCreateReview, getRoleStyles } from '@/lib/utils/review';
import { USER_ROLES } from '@/lib/constants/constants';

interface AddReviewFormProps {
  productId: number;
  reviewId?: number; // For edit mode
  initialData?: {
    rating: number;
    title: string;
    comment: string;
  }; // Pre-fill data for edit
  onSuccess?: () => void;
  onCancel?: () => void;
  productName?: string;
  isEditing?: boolean;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({
  productId,
  reviewId,
  initialData,
  onSuccess,
  onCancel,
  productName,
  isEditing = false,
}) => {
  const { user } = useAuth();
  const canCreate = canCreateReview(user, productId);
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxTitleLength = 100;
  const maxCommentLength = 5000;
  const titleLength = title.length;
  const commentLength = comment.length;

  const isValid = rating > 0 && title.trim().length > 0 && comment.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      setError('You must be logged in to submit a review');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing && reviewId) {
        // Update existing review
        await reviewsApi.updateReview(reviewId, {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }, user.id);
      } else {
        // Create new review
        await reviewsApi.createReview({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }, user.id);
      }

      setSuccess(true);
      if (!isEditing) {
        setRating(0);
        setTitle('');
        setComment('');
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'submit'} review`);
    } finally {
      setLoading(false);
    }
  };

  const renderStarInput = (value: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${starValue <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                  }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  // Check if user is logged in first
  if (!user) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Login Required</h3>
            <p className="text-sm text-gray-600">
              Please sign in to your account to share your experience with this product.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user can create reviews for this product
  if (!canCreate) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Review Not Available</h3>
            <p className="text-sm text-gray-600">
              {user.role === USER_ROLES.SELLER
                ? "Sellers cannot review their own products."
                : user.role === USER_ROLES.ADMIN
                  ? "Administrators should use the admin panel for moderation."
                  : "You do not have permission to write reviews at this time."
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Your Review' : 'Share Your Review'}
          </h2>
          {productName && (
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          )}
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close form"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              {isEditing ? 'Review updated!' : 'Review submitted!'}
            </h3>
            <p className="text-sm text-green-700">
              {isEditing
                ? 'Your review has been successfully updated.'
                : 'Thank you for your feedback. Your review will be visible after moderation.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            {renderStarInput(rating)}
            {rating > 0 && (
              <span className="text-sm font-medium text-gray-600">
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Good'}
                {rating === 3 && 'Average'}
                {rating === 2 && 'Poor'}
                {rating === 1 && 'Terrible'}
              </span>
            )}
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-semibold text-gray-900 mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
            placeholder="Summarize your experience in one sentence"
            maxLength={maxTitleLength}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {titleLength}/{maxTitleLength} characters
          </p>
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-semibold text-gray-900 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))}
            placeholder="Share your experience with this product. What did you like or dislike?"
            rows={5}
            maxLength={maxCommentLength}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {commentLength}/{maxCommentLength} characters
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={!isValid || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Review' : 'Submit Review')}
          </Button>

          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Helper Text */}
        {!isEditing && (
          <p className="text-xs text-gray-500 text-center">
            Your review will be reviewed by our moderation team before being published.
          </p>
        )}
      </form>
    </div>
  );
};

export default AddReviewForm;
