'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Eye, 
  Edit, 
  Trash2,
  TrendingUp,
  Users,
  Star,
  Package
} from 'lucide-react';
import { UserReview, User } from '@/types';
import { reviewsApi, productsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import ConfirmationDialog from '@/components/features/ConfirmationDialog';
import { formatReviewDate, getDisplayName, isSellerProduct } from '@/lib/utils/review';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES, ROLE_COLORS } from '@/lib/constants/constants';

type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest' | 'rating_asc' | 'rating_desc';
type ReviewStatus = 'all' | 'pending' | 'approved' | 'rejected';

const SellerReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserReview | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    totalResponses: 0,
    lastResponseDate: null as string | null
  });

  // Check seller permissions
  useEffect(() => {
    if (!user || user.role !== USER_ROLES.SELLER) {
      window.location.href = '/unauthorized';
    }
  }, [user]);

  // Fetch seller's products and reviews
  useEffect(() => {
    fetchMyProducts();
    fetchReviews();
    fetchStats();
  }, [statusFilter, sortBy, searchQuery]);

  const fetchMyProducts = async () => {
    try {
      const response = await productsApi.getBySellerId(user?.id || 0);
      if (response.success && response.data) {
        setMyProducts(response.data.content || []);
      }
    } catch (err) {
      console.error('Failed to fetch seller products:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page: 0, size: 50 };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase();
      }
      
      if (sortBy) {
        const [sortField, sortOrder] = sortBy.split('_');
        params.sortBy = sortField;
        params.direction = sortOrder === 'asc' ? 'asc' : 'desc';
      }
      
      const response = await reviewsApi.getProductReviews(0, params); // Using product 0 as placeholder
      
      if (response.success && response.data) {
        setReviews(response.data.content || []);
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
      // This would need a seller-specific stats endpoint
      // For now, calculate from current reviews
      const statsData = {
        total: reviews.length,
        averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
        totalResponses: reviews.filter(r => r.adminResponse).length,
        lastResponseDate: reviews.filter(r => r.adminResponse).length > 0 
          ? Math.max(...reviews.filter(r => r.adminResponse).map(r => new Date(r.updatedAt || ''))).toISOString()
          : null
      };
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDeleteReview = (review: UserReview) => {
    setDeleteTarget(review);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await reviewsApi.deleteReview(deleteTarget.id, user?.id || 0);
      await fetchReviews();
      await fetchStats();
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const handleResponseSubmit = async (reviewId: number, response: string) => {
    try {
      await reviewsApi.addReviewResponse(reviewId, response);
      await fetchReviews();
      await fetchStats();
    } catch (err) {
      setError('Failed to submit response');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'APPROVED': return <Package className="w-4 h-4 text-green-600" />;
      case 'REJECTED': return <Edit className="w-4 h-4 text-red-600" />;
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
                <MessageSquare className="w-8 h-8" style={{ color: ROLE_COLORS[USER_ROLES.SELLER].primary }} />
                Seller Review Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage reviews for your products and respond to customer feedback
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-xs text-blue-600">Total Reviews</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-900">{stats.averageRating.toFixed(1)}</div>
              <div className="text-xs text-yellow-600">Average Rating</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-900">{stats.totalResponses}</div>
              <div className="text-xs text-green-600">Your Responses</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-900">
                {stats.lastResponseDate 
                  ? formatReviewDate(stats.lastResponseDate)
                  : 'No responses'
                }
              </div>
              <div className="text-xs text-gray-600">Last Response</div>
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

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="rating_desc">Rating (High to Low)</option>
              <option value="rating_asc">Rating (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Edit className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
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
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'No reviews match your current filters.'
                : 'Your products have no reviews yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedReviews.length === reviews.length && reviews.length > 0}
                onChange={() => {
                  if (selectedReviews.length === reviews.length) {
                    setSelectedReviews([]);
                  } else {
                    setSelectedReviews(reviews.map(r => r.id));
                  }
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                Select All ({reviews.length})
              </label>
            </div>

            {reviews.map((review) => (
              <div 
                key={review.id} 
                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
                  selectedReviews.includes(review.id) ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getDisplayName(review)}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
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
                      onClick={() => window.open(`/products/${review.productId}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Product
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResponseSubmit(review.id, 'Thank you for your feedback. We appreciate your input!')}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-300"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Respond
                    </Button>
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
                            <h6 className="font-semibold text-blue-900 mb-1">Your Response</h6>
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

export default SellerReviewsPage;