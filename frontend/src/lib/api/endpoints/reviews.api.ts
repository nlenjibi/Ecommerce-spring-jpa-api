import { request } from '../core/client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api';
import { Review, ReviewStats } from '@/types/database';

/**
 * Reviews API Implementation
 * Uses the /v1/reviews prefix to match current backend implementation.
 */

export type { Review, ReviewStats };

export interface ReviewFilters {
  rating?: number;
  verifiedOnly?: boolean;
}

export interface CreateReviewData {
  productId: number;
  rating: number;
  title: string;
  comment: string;
  recommended?: boolean;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  recommended?: boolean;
  images?: string[];
}

export type ReviewsResponse = PaginatedApiResponse<Review>;

export const reviewsApi = {
  /**
   * Create a new review
   */
  async createReview(data: CreateReviewData, userId: number): Promise<ApiResponse<Review>> {
    return request({
      method: 'POST',
      url: '/v1/reviews',
      params: { userId },
      data,
    });
  },

  /**
   * Update an existing review
   */
  async updateReview(reviewId: number, data: UpdateReviewData, userId: number): Promise<ApiResponse<Review>> {
    return request({
      method: 'PUT',
      url: `/v1/reviews/${reviewId}`,
      params: { userId },
      data,
    });
  },

  /**
   * Get all reviews for a product
   */
  async getProductReviews(
    productId: number,
    params: {
      page?: number;
      size?: number;
      sortBy?: string;
      direction?: string;
      rating?: number;
      verifiedOnly?: boolean;
      // Aliases
      sort?: string;
      limit?: number;
    } = {}
  ): Promise<ReviewsResponse> {
    const finalParams = {
      productId,
      page: params.page ?? 0,
      size: params.size ?? params.limit ?? 10,
      sortBy: params.sortBy ?? params.sort ?? 'createdAt',
      sortDir: params.direction ?? 'desc',
      rating: params.rating,
      verifiedOnly: params.verifiedOnly,
    };

    return request({
      method: 'GET',
      url: '/v1/reviews',
      params: finalParams,
    });
  },

  /**
   * Get review statistics for a product
   */
  async getReviewStats(productId: number): Promise<ApiResponse<ReviewStats>> {
    try {
      return await request({
        method: 'GET',
        url: `/v1/reviews/product/${productId}/stats`,
        suppressErrorLog: true,
      });
    } catch (error) {
      // Return a graceful failure instead of throwing to avoid UI crashes
      // the component has fallbacks from the product object
      return {
        success: false,
        message: 'Review stats currently unavailable',
        data: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      } as ApiResponse<ReviewStats>;
    }
  },

  /**
   * Get product rating (Alias for getReviewStats)
   */
  async getProductRating(productId: number): Promise<ApiResponse<ReviewStats>> {
    return this.getReviewStats(productId);
  },

  /**
   * Mark a review as helpful
   */
  async markHelpful(reviewId: number): Promise<ApiResponse<any>> {
    return request({
      method: 'POST',
      url: `/v1/reviews/${reviewId}/helpful`,
    });
  },

  /**
   * Mark a review as unhelpful
   */
  async markUnhelpful(reviewId: number): Promise<ApiResponse<any>> {
    return request({
      method: 'POST',
      url: `/v1/reviews/${reviewId}/unhelpful`,
    });
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: number, userId: number): Promise<ApiResponse<any>> {
    return request({
      method: 'DELETE',
      url: `/v1/reviews/${reviewId}`,
      params: { userId },
    });
  },

  /**
   * Get user's review for a product
   */
  async getUserReviewForProduct(productId: number, userId: number): Promise<ApiResponse<Review | null>> {
    return request({
      method: 'GET',
      url: `/v1/reviews/user/${userId}/product/${productId}`,
    });
  },

  /**
   * Admin: Add a response to a review
   */
  async addReviewResponse(reviewId: number, response: string, adminId: number): Promise<ApiResponse<Review>> {
    return request({
      method: 'POST',
      url: `/v1/reviews/${reviewId}/admin-response`,
      params: { adminId },
      data: { response },
    });
  },

  /**
   * Admin: Get all reviews with optional filtering
   */
  async adminGetAllReviews(params: {
    page?: number;
    size?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    direction?: string;
  } = {}): Promise<ApiResponse<any>> {
    let approved: boolean | undefined;
    
    if (params.status === 'approved') {
      approved = true;
    } else if (params.status === 'rejected') {
      approved = false;
    } else if (params.status === 'pending') {
      approved = false;
    }

    const finalParams: Record<string, any> = {
      page: params.page ?? 0,
      size: params.size ?? 50,
      sortBy: params.sortBy ?? 'createdAt',
      sortDir: params.direction ?? 'desc',
    };

    if (params.search) {
      finalParams.searchText = params.search;
    }

    if (approved !== undefined) {
      finalParams.approved = approved;
    }

    return request({
      method: 'GET',
      url: '/v1/reviews',
      params: finalParams,
    });
  },

  /**
   * Admin: Update review status (approve/reject)
   */
  async adminUpdateReviewStatus(
    reviewId: number,
    data: { status: string; rejectionReason?: string }
  ): Promise<ApiResponse<any>> {
    if (data.status === 'APPROVED') {
      return request({
        method: 'PUT',
        url: `/v1/reviews/${reviewId}/approve`,
      });
    } else if (data.status === 'REJECTED') {
      return request({
        method: 'PUT',
        url: `/v1/reviews/${reviewId}/reject`,
        data: { reason: data.rejectionReason },
      });
    }
    return request({
      method: 'PATCH',
      url: `/v1/reviews/${reviewId}/status`,
      params: { status: data.status.toLowerCase() },
    });
  },

  /**
   * Admin: Delete a review
   */
  async adminDeleteReview(reviewId: number): Promise<ApiResponse<null>> {
    return request({
      method: 'DELETE',
      url: `/v1/reviews/${reviewId}`,
    });
  },

  /**
   * Admin: Edit a review
   */
  async adminEditReview(
    reviewId: number,
    data: { rating?: number; title?: string; comment?: string }
  ): Promise<ApiResponse<any>> {
    return request({
      method: 'PUT',
      url: `/v1/reviews/${reviewId}`,
      data,
    });
  },

  /**
   * Admin: Bulk update review status
   */
  async adminBulkUpdateStatus(
    reviewIds: number[],
    status: string,
    reason?: string
  ): Promise<ApiResponse<any>> {
    if (status === 'APPROVED') {
      return request({
        method: 'POST',
        url: '/v1/reviews/bulk-approve',
        data: { ids: reviewIds },
      });
    } else if (status === 'REJECTED') {
      return request({
        method: 'POST',
        url: '/v1/reviews/bulk-reject',
        data: { ids: reviewIds, reason: reason || 'Does not meet guidelines' },
      });
    }
    return {
      success: false,
      message: 'Invalid status',
      data: null
    };
  },

  /**
   * Admin: Set review as featured
   */
  async adminSetFeaturedReview(
    reviewId: number,
    featured: boolean
  ): Promise<ApiResponse<any>> {
    return request({
      method: 'POST',
      url: `/v1/reviews/${reviewId}/featured`,
      data: { featured },
    });
  },
};

export default reviewsApi;
