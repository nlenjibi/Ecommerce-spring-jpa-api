package com.smart_ecomernce_api.smart_ecomernce_api.modules.review.service;

import com.querydsl.core.types.Predicate;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.review.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.review.entity.ProductRatingStats;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Service interface for review operations
 * Provides business logic for managing product reviews
 */
public interface ReviewService {

    // ==================== Basic CRUD Operations ====================

    ReviewResponse createReview(ReviewCreateRequest request, Long userId);

    ReviewResponse updateReview(Long reviewId, ReviewUpdateRequest request, Long userId);

    void deleteReview(Long reviewId, Long userId);

    ReviewResponse getReview(Long reviewId);

    ReviewResponse restoreReview(Long reviewId, Long userId);

    // ==================== Query Operations ====================

    Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable);

    Page<ReviewResponse> getProductReviewsWithFilters(Long productId, ReviewFilterRequest filters, Pageable pageable);

    Page<ReviewResponse> getVerifiedReviews(Long productId, Pageable pageable);

    Page<ReviewResponse> getUserReviews(Long userId, Pageable pageable);

    Page<ReviewResponse> getReviewsByRating(Long productId, Integer rating, Pageable pageable);

    List<ReviewResponse> getMostHelpfulReviews(Long productId, int limit);

    List<ReviewResponse> getRecentReviews(Long productId, int limit);

    Page<ReviewResponse> getReviewsWithImages(Long productId, Pageable pageable);

    Page<ReviewResponse> searchReviews(Long productId, String keyword, Pageable pageable);

    // ==================== Statistics & Analytics ====================

    ReviewSummaryResponse getProductRatingStats(Long productId);

    Map<String, Object> getUserReviewStats(Long userId);

    Map<Integer, Map<String, Object>> getRatingDistribution(Long productId);

    List<Map<String, Object>> getReviewTrends(Long productId, int months);

    List<Map<String, Object>> getMostCommonPros(Long productId, int limit);

    List<Map<String, Object>> getMostCommonCons(Long productId, int limit);

    List<Map<String, Object>> getTopRatedProducts(int limit);

    List<Map<String, Object>> getMostReviewedProducts(int limit);

    // ==================== Voting Operations ====================

    void markHelpful(Long reviewId);

    void markNotHelpful(Long reviewId);

    // ==================== Admin Operations ====================

    ReviewResponse approveReview(Long reviewId);

    ReviewResponse rejectReview(Long reviewId, String reason);

    ReviewResponse addAdminResponse(Long reviewId, AdminResponseRequest request, Long adminId);

    ReviewResponse removeAdminResponse(Long reviewId);

    Page<ReviewResponse> getPendingReviews(Pageable pageable);

    Page<ReviewResponse> getFlaggedReviews(Pageable pageable);

    int bulkApproveReviews(List<Long> reviewIds);

    int bulkRejectReviews(List<Long> reviewIds, String reason);

    // ==================== Utility Operations ====================

    boolean canUserReviewProduct(Long productId, Long userId);

    int updateVerificationStatusFromOrders(Long productId);

    boolean hasUserPurchasedProduct(Long productId, Long userId);

    // ==================== Advanced Querying with Predicates ====================

    /**
     * Find reviews with QueryDSL predicate for advanced filtering
     */
    Page<ReviewResponse> findReviewsWithPredicate(Predicate predicate, Pageable pageable);
}
