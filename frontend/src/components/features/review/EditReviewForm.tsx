'use client';

import React, { useState } from 'react';
import { Star, Edit, AlertCircle, CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ConfirmationDialog from '@/components/features/ConfirmationDialog';
import { useAuth } from '@/context/AuthContext';
import { reviewsApi } from '@/lib/api';

interface EditReviewFormProps {
  productId: number;
  initialData?: {
    rating: number;
    title: string;
    comment: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  productName?: string;
  isEditing?: boolean;
}

const EditReviewForm: React.FC<EditReviewFormProps> = ({
  productId,
  initialData,
  onSuccess,
  onCancel,
  productName,
  isEditing = false,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const characterLimits = {
    title: 100,
    comment: 1000,
  };

  const resetForm = () => {
    setRating(initialData?.rating || 0);
    setHoverRating(0);
    setTitle(initialData?.title || '');
    setComment(initialData?.comment || '');
    setError(null);
    setIsSubmitting(false);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      setError('Please log in to submit a review');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const reviewData = {
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      };

      const response = await reviewsApi.updateReview(productId, reviewData, user.id);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = rating > 0 && title.trim().length > 0 && comment.trim().length > 0;

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        className="p-1 transition-colors"
        onClick={() => setRating(i + 1)}
        onMouseEnter={() => setHoverRating(i + 1)}
        onMouseLeave={() => setHoverRating(0)}
        aria-label={`Rate ${i + 1} stars`}
      >
        <Star
          className={`w-6 h-6 ${
            i < (hoverRating || rating) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-200'
          }`}
        />
      </button>
    ));
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Updated!</h3>
          <p className="text-gray-600">Your review has been successfully updated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h2>
        {productName && (
          <p className="text-sm text-gray-600">
            of {productName}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="ml-3 text-sm text-gray-600">
              {rating > 0 ? `${rating} out of 5 stars` : 'Please select a rating'}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, characterLimits.title))}
            placeholder="Summarize your experience"
            maxLength={characterLimits.title}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/{characterLimits.title} characters
          </p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, characterLimits.comment))}
            placeholder="Share your experience with this product..."
            maxLength={characterLimits.comment}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/{characterLimits.comment} characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="min-w-24"
          >
            {isSubmitting ? 'Saving...' : 'Save Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { EditReviewForm };