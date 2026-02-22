'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Trash2, Edit } from 'lucide-react';
import { UserReview, User } from '@/types';
import { Button } from '@/components/ui/Button';
import ReviewResponse from '@/components/features/review/ReviewResponse';
import ConfirmationDialog from '@/components/features/ConfirmationDialog';
import { useAuth } from '@/context/AuthContext';
import {
  canEditReview,
  canDeleteReview,
  formatReviewDate,
  getDisplayName,
  canRespondToReview as canRespondToReviewLegacy,
  getRoleStyles
} from '@/lib/utils/review';
import { reviewsApi } from '@/lib/api';

interface ReviewItemProps {
  review: UserReview;
  onDelete?: () => void;
  onMarkHelpful?: () => void;
  onMarkUnhelpful?: () => void;
  onEdit?: (review: UserReview) => void;
  showDeleteButton?: boolean;
  isAdmin?: boolean;
  currentUserId?: number;
  isVerifiedPurchase?: boolean; // Override for current user's reviews
  onResponseAdded?: () => void; // Refresh after response
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onDelete,
  onMarkHelpful,
  onMarkUnhelpful,
  onEdit,
  showDeleteButton = false,
  isAdmin = false,
  currentUserId,
  isVerifiedPurchase: propVerifiedPurchase,
  onResponseAdded,
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Check permissions
  const canEdit = onEdit && canEditReview(review, user);
  const canDelete = onDelete && canDeleteReview(review, user);
  const canRespond = canRespondToReviewLegacy(user);
  const showActions = canEdit || canDelete || canRespond;

  // Use verified purchase status from props (for current user) or from review
  const isVerified = propVerifiedPurchase !== undefined ? propVerifiedPurchase : review.isVerifiedPurchase;

  // Get role-based styling
  const roleStyles = getRoleStyles(user);
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.();
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResponseSubmit = async (reviewId: number, response: string) => {
    try {
      if (!user?.id) throw new Error('User ID is required to respond');
      await reviewsApi.addReviewResponse(reviewId, response, user.id);
      onResponseAdded?.();
    } catch (error) {
      throw error;
    }
  };

  const statusColors: Record<string, string> = {
    APPROVED: 'text-green-600 bg-green-50',
    PENDING: 'text-yellow-600 bg-yellow-50',
    REJECTED: 'text-red-600 bg-red-50',
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow duration-300 ${roleStyles?.borderColor || 'border-gray-200'
      }`}>
      {/* Header with reviewer info and date */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div>
              <p className="font-semibold text-gray-900">
                {getDisplayName(review)}
              </p>
              {isVerified && (
                <span className="text-xs text-green-600 font-medium">✓ Verified Purchase</span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">{formatReviewDate(review.createdAt)}</p>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => onEdit?.(review)}
                className={`p-2 hover:rounded-full transition-colors ${roleStyles?.buttonColor?.includes('blue')
                    ? 'text-blue-500 hover:bg-blue-50'
                    : roleStyles?.buttonColor?.includes('green')
                      ? 'text-green-600 hover:bg-green-50'
                      : roleStyles?.buttonColor?.includes('red')
                        ? 'text-red-500 hover:bg-red-50'
                        : 'text-gray-500 hover:bg-gray-50'
                  }`}
                title="Edit review"
                aria-label="Edit this review"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-2 hover:rounded-full transition-colors disabled:opacity-50 ${roleStyles?.buttonColor?.includes('red')
                    ? 'text-red-500 hover:bg-red-50'
                    : roleStyles?.buttonColor?.includes('blue')
                      ? 'text-blue-500 hover:bg-blue-50'
                      : roleStyles?.buttonColor?.includes('green')
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-500 hover:bg-gray-50'
                  }`}
                title="Delete review"
                aria-label="Delete this review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-2">
        {renderStars(review.rating)}
        <span className="text-sm text-gray-600 ml-1">{review.rating.toFixed(1)} out of 5</span>
      </div>

      {/* Review Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2 text-base">{review.title}</h4>
      )}

      {/* Review Status Badge (Admin only) */}
      {isAdmin && (
        <div className={`inline-block px-2.5 py-1 rounded text-xs font-semibold mb-2 ${statusColors[review.status] || 'text-gray-600 bg-gray-50'}`}>
          {review.status}
        </div>
      )}

      {/* Review Comment */}
      <p className="text-gray-700 mb-4 leading-relaxed text-sm">{review.comment}</p>

      {/* Review Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {review.images.map((image, idx) => (
            <img
              key={idx}
              src={image}
              alt={`Review image ${idx + 1}`}
              className="w-16 h-16 object-cover rounded border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      )}

      {/* Helpful/Unhelpful buttons and rejection reason (admin) */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={onMarkHelpful}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            aria-label="Mark as helpful"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs">{review.helpfulCount}</span>
          </button>
          <button
            onClick={onMarkUnhelpful}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            aria-label="Mark as unhelpful"
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-xs">{review.unhelpfulCount}</span>
          </button>
        </div>

        {/* Rejection Reason (Admin) */}
        {isAdmin && review.rejectionReason && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            Rejected: {review.rejectionReason}
          </div>
        )}
      </div>

      {/* Admin/Seller Response */}
      {(review.adminResponse || canRespond) && (
        <ReviewResponse
          reviewId={review.id}
          existingResponse={review.adminResponse}
          onResponseSubmit={handleResponseSubmit}
          currentUserId={user?.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone and will permanently remove your review from the product page."
        confirmText="Delete Review"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default ReviewItem;
