'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckSquare,
  MessageSquare,
  Star
} from 'lucide-react';
import { UserReview } from '@/types';
import { reviewsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import ConfirmationDialog from '@/components/features/ConfirmationDialog';
import { formatReviewDate, getDisplayName, canModerateReviews } from '@/lib/utils/review';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES, ROLE_COLORS } from '@/lib/constants/constants';

type ReviewStatus = 'all' | 'pending' | 'approved' | 'rejected';

const AdminReviewsPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserReview | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0
  });

  // Filter reviews client-side based on statusFilter
  const filteredReviews = statusFilter === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === statusFilter.toUpperCase());
  
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    if (!canModerateReviews(user)) {
      window.location.href = '/unauthorized';
    }
  }, [user, authLoading, isAuthenticated]);

  // Fetch reviews - statusFilter is now passed to API
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchReviews();
    fetchStats();
  }, [statusFilter, searchQuery, authLoading, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page: 0, size: 50 };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Pass status filter to API
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await reviewsApi.adminGetAllReviews(params);
      
      if (response.success && response.data) {
        const reviewsData = response.data.content || response.data.reviews || [];
        const mappedReviews = reviewsData.map((r: any) => ({
          id: r.id,
          productId: r.productId,
          userId: r.user?.id || r.userId,
          userName: r.user ? `${r.user.firstName} ${r.user.lastName}` : r.userName,
          userEmail: r.user?.email || r.userEmail,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verifiedPurchase: r.verifiedPurchase || r.isVerifiedPurchase,
          helpfulCount: r.helpfulCount || 0,
          adminResponse: r.adminResponse,
          status: r.approved === true ? 'APPROVED' : r.approved === false ? 'PENDING' : r.status || 'PENDING',
          rejectionReason: r.rejectionReason,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          productName: r.productName,
          productSlug: r.productSlug,
        }));
        setReviews(mappedReviews);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const allReviewsResponse = await reviewsApi.adminGetAllReviews({ size: 1000 });
      if (allReviewsResponse.success && allReviewsResponse.data) {
        const reviewsData = allReviewsResponse.data.content || allReviewsResponse.data.reviews || [];
        const mappedReviews = reviewsData.map((r: any) => ({
          ...r,
          status: r.approved === true ? 'APPROVED' : r.approved === false ? 'PENDING' : r.status || 'PENDING',
        }));
        const statsData = {
          total: mappedReviews.length,
          pending: mappedReviews.filter((r: any) => r.status === 'PENDING').length,
          approved: mappedReviews.filter((r: any) => r.status === 'APPROVED').length,
          rejected: mappedReviews.filter((r: any) => r.status === 'REJECTED').length,
          averageRating: mappedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / mappedReviews.length || 0
        };
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedReviews.length === 0) return;

    const confirmMessages = {
      approve: `Approve ${selectedReviews.length} selected reviews?`,
      reject: `Reject ${selectedReviews.length} selected reviews?`,
      delete: `Delete ${selectedReviews.length} selected reviews permanently?`
    };

    const confirmAction = confirm(confirmMessages[action]);
    if (!confirmAction) return;

    try {
      if (action === 'approve') {
        await Promise.all(selectedReviews.map(id => 
          reviewsApi.adminUpdateReviewStatus(id, { status: 'APPROVED' })
        ));
      } else if (action === 'reject') {
        await Promise.all(selectedReviews.map(id => 
          reviewsApi.adminUpdateReviewStatus(id, { status: 'REJECTED', rejectionReason: 'Does not meet guidelines' })
        ));
      } else if (action === 'delete') {
        await Promise.all(selectedReviews.map(id => 
          reviewsApi.adminDeleteReview(id)
        ));
      }

      await fetchReviews();
      await fetchStats();
      setSelectedReviews([]);
    } catch (err) {
      setError(`Failed to ${action} reviews`);
    }
  };

  const handleStatusChange = async (reviewId: number, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      await reviewsApi.adminUpdateReviewStatus(reviewId, { 
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? 'Manual moderation' : undefined
      });
      await fetchReviews();
      await fetchStats();
    } catch (err) {
      setError('Failed to update review status');
    }
  };

  const handleDeleteReview = (review: UserReview) => {
    setDeleteTarget(review);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await reviewsApi.adminDeleteReview(deleteTarget.id);
      await fetchReviews();
      await fetchStats();
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const toggleReviewSelection = (reviewId: number) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8" style={{ color: ROLE_COLORS[USER_ROLES.ADMIN].primary }} />
                Review Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage all customer reviews and moderate content
              </p>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-5 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                <div className="text-xs text-yellow-600">Pending</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
                <div className="text-xs text-green-600">Approved</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
                <div className="text-xs text-red-600">Rejected</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-900">{stats.averageRating.toFixed(1)}</div>
                <div className="text-xs text-purple-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReviews.length > 0 && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600 mr-2">
                {selectedReviews.length} review{selectedReviews.length > 1 ? 's' : ''} selected
              </span>
              <Button
                onClick={() => handleBulkAction('approve')}
                className="bg-green-600 hover:bg-green-700 mr-2"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleBulkAction('reject')}
                className="bg-red-600 hover:bg-red-700 mr-2"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleBulkAction('delete')}
                variant="outline"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 font-medium mt-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'No reviews match your current filters.'
                : 'No reviews have been submitted yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                onChange={() => {
                  if (selectedReviews.length === filteredReviews.length) {
                    setSelectedReviews([]);
                  } else {
                    setSelectedReviews(filteredReviews.map(r => r.id));
                  }
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                Select All ({filteredReviews.length})
              </label>
            </div>

            {filteredReviews.map((review) => (
              <div 
                key={review.id} 
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  selectedReviews.includes(review.id) ? 'border-red-300 ring-2 ring-red-200' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => toggleReviewSelection(review.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {getDisplayName(review)}
                          </h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(review.status)}`}>
                            {getStatusIcon(review.status)}
                            <span>{review.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Product ID: {review.productId}</span>
                          <span>Rating: {'⭐'.repeat(review.rating)}</span>
                          <span>{formatReviewDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/shop/products/${review.productSlug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Product
                    </Button>
                    {review.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(review.id, 'APPROVED')}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {review.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(review.id, 'REJECTED')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReview(review)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>

                  {/* Review Content */}
                  <div className="mt-4 space-y-3">
                    {review.title && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                      </div>
                    )}
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    {review.adminResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h6 className="font-semibold text-blue-900 mb-1">Admin Response</h6>
                            <p className="text-sm text-blue-800">{review.adminResponse}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeleteTarget(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Review"
          message={`Are you sure you want to delete this review by ${getDisplayName(deleteTarget || {} as UserReview)}? This action cannot be undone.`}
          confirmText="Delete Review"
          cancelText="Cancel"
          variant="danger"
          loading={false}
        />
      </div>
    </div>
  );
};

export default AdminReviewsPage;