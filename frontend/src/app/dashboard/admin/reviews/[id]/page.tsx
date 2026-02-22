'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { UserReview, ReviewStatus } from '@/types';
import { reviewsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { SkeletonLoader } from '@/components/features/SkeletonLoader';

const ReviewDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const reviewId = parseInt(params.id as string);

  const [review, setReview] = useState<UserReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedComment, setEditedComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReview();
  }, []);

  const fetchReview = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch single review - may need to be adjusted based on backend
      // For now, assuming you fetch from the product reviews and filter
      // const response = await reviewsApi.getProductReviews(productId);
      // const foundReview = response.reviews.find(r => r.id === reviewId);
      
      // Alternative: Backend should support fetching single review
      // const response = await fetch(`/api/reviews/${reviewId}`);
      // const foundReview = await response.json();
      
      // Placeholder - this would need backend implementation
      setError('Single review fetch not yet implemented in API');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async () => {
    if (!review) return;
    try {
      setIsProcessing(true);
      await reviewsApi.adminUpdateReviewStatus(review.id, { status: 'APPROVED' });
      setSuccessMessage('Review approved successfully');
      setReview({ ...review, status: ReviewStatus.APPROVED });
      setTimeout(() => router.push('/admin/reviews'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectReview = async () => {
    if (!review || !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    try {
      setIsProcessing(true);
      await reviewsApi.adminUpdateReviewStatus(review.id, {
        status: 'REJECTED',
        rejectionReason,
      });
      setSuccessMessage('Review rejected successfully');
      setReview({ ...review, status: ReviewStatus.REJECTED, rejectionReason });
      setTimeout(() => router.push('/admin/reviews'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!review) return;
    try {
      setIsProcessing(true);
      await reviewsApi.adminEditReview(review.id, {
        title: editedTitle,
        comment: editedComment,
      });
      setSuccessMessage('Review updated successfully');
      setReview({
        ...review,
        title: editedTitle,
        comment: editedComment,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!review) return;
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;

    try {
      setIsProcessing(true);
      await reviewsApi.adminDeleteReview(review.id);
      setSuccessMessage('Review deleted successfully');
      setTimeout(() => router.push('/admin/reviews'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-6 h-6 rounded-full ${
            i < rating ? 'bg-yellow-400' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader count={1} variant="product" />
        <SkeletonLoader count={1} variant="product" />
        <SkeletonLoader count={1} variant="text" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/admin/reviews')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Reviews
        </button>
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">Review not found</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<ReviewStatus, { bg: string; text: string; badge: string }> = {
    [ReviewStatus.APPROVED]: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100' },
    [ReviewStatus.PENDING]: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    [ReviewStatus.REJECTED]: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
  };

  const colors = statusColors[review.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <button
        onClick={() => router.push('/admin/reviews')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Reviews
      </button>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Review Details */}
      <div className={`${colors.bg} border border-gray-200 rounded-lg p-8`}>
        {/* Header with Rating and Status */}
        <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-300">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-gray-900">
                {review.title}
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded ${colors.badge}`}>
                {review.status}
              </span>
            </div>

            {review.isVerifiedPurchase && (
              <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded w-fit">
                ✓ Verified Purchase
              </span>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Reviewer:</strong> {review.userName} ({review.userEmail})
              </p>
              <p>
                <strong>Submitted:</strong> {new Date(review.createdAt).toLocaleString()}
              </p>
              {review.updatedAt && (
                <p>
                  <strong>Last Updated:</strong> {new Date(review.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="text-right space-y-4">
            <div className="flex flex-col items-end">
              {renderStars(review.rating)}
              <span className="text-lg font-bold text-gray-900 mt-2">{review.rating} out of 5</span>
            </div>

            <div className="text-sm text-gray-600">
              <p>{review.helpfulCount} found helpful</p>
              <p>{review.unhelpfulCount} found unhelpful</p>
            </div>
          </div>
        </div>

        {/* Review Content */}
        {!isEditing ? (
          <div className="space-y-6 mb-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Review Content</h3>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {review.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`Review image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editedTitle.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Comment
              </label>
              <textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                maxLength={5000}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {editedComment.length}/5000 characters
              </p>
            </div>
          </div>
        )}

        {/* Rejection Reason (if rejected) */}
        {review.status === ReviewStatus.REJECTED && review.rejectionReason && (
          <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded">
            <h3 className="font-semibold text-red-900 mb-2">Rejection Reason</h3>
            <p className="text-red-700">{review.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-6 pt-8 border-t border-gray-300">
          {/* Approval Buttons */}
          {review.status === ReviewStatus.PENDING && !isEditing && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleApproveReview}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2"
                >
                  {isProcessing ? 'Approving...' : 'Approve Review'}
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
                >
                  Edit Review
                </Button>
              </div>

              {/* Rejection Form */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Reject Review</h3>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection (required)..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Button
                  onClick={handleRejectReview}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2"
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          )}

          {/* Edit Mode Actions */}
          {isEditing && (
            <div className="flex gap-3">
              <Button
                onClick={handleSaveEdit}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
              >
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle(review.title);
                  setEditedComment(review.comment);
                }}
                disabled={isProcessing}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-2"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Approved/Rejected Actions */}
          {review.status !== ReviewStatus.PENDING && !isEditing && (
            <div className="space-y-3">
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
              >
                Edit Review
              </Button>
              <Button
                onClick={handleDeleteReview}
                disabled={isProcessing}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isProcessing ? 'Deleting...' : 'Delete Review'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPage;
