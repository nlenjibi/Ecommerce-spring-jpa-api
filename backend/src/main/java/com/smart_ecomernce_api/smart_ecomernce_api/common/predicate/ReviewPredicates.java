package com.smart_ecomernce_api.smart_ecomernce_api.common.predicate;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;

import java.time.LocalDateTime;

/**
 * QueryDSL Predicate builder for Review entity
 * Provides type-safe, compile-time checked queries for complex review filtering
 * 
 * Usage:
 * <pre>
 * Predicate predicate = ReviewPredicates.builder()
 *     .withProductId(123L)
 *     .withRatingGreaterThanOrEqual(4)
 *     .withVerifiedPurchase(true)
 *     .build();
 * 
 * reviewRepository.findAll(predicate, pageable);
 * </pre>
 */
public class ReviewPredicates {

    private final BooleanBuilder builder;

    public ReviewPredicates() {
        this.builder = new BooleanBuilder();
    }

    /**
     * Create a new predicate builder
     */
    public static ReviewPredicates builder() {
        return new ReviewPredicates();
    }

    /**
     * Filter by product ID
     */
    public ReviewPredicates withProductId(Long productId) {
        if (productId != null) {
            builder.and(Expressions.numberPath(Long.class, "product.id").eq(productId));
        }
        return this;
    }

    /**
     * Filter by user ID
     */
    public ReviewPredicates withUserId(Long userId) {
        if (userId != null) {
            builder.and(Expressions.numberPath(Long.class, "user.id").eq(userId));
        }
        return this;
    }

    /**
     * Filter by exact rating
     */
    public ReviewPredicates withRating(Integer rating) {
        if (rating != null) {
            builder.and(Expressions.numberPath(Integer.class, "rating").eq(rating));
        }
        return this;
    }

    /**
     * Filter by minimum rating
     */
    public ReviewPredicates withRatingGreaterThanOrEqual(Integer minRating) {
        if (minRating != null) {
            builder.and(Expressions.numberPath(Integer.class, "rating").goe(minRating));
        }
        return this;
    }

    /**
     * Filter by maximum rating
     */
    public ReviewPredicates withRatingLessThanOrEqual(Integer maxRating) {
        if (maxRating != null) {
            builder.and(Expressions.numberPath(Integer.class, "rating").loe(maxRating));
        }
        return this;
    }

    /**
     * Filter by rating range
     */
    public ReviewPredicates withRatingBetween(Integer minRating, Integer maxRating) {
        if (minRating != null && maxRating != null) {
            builder.and(Expressions.numberPath(Integer.class, "rating").between(minRating, maxRating));
        }
        return this;
    }

    /**
     * Filter by verified purchase status
     */
    public ReviewPredicates withVerifiedPurchase(Boolean verified) {
        if (verified != null) {
            builder.and(Expressions.booleanPath("verifiedPurchase").eq(verified));
        }
        return this;
    }

    /**
     * Filter by approval status
     */
    public ReviewPredicates withApproved(Boolean approved) {
        if (approved != null) {
            builder.and(Expressions.booleanPath("approved").eq(approved));
        }
        return this;
    }

    /**
     * Filter reviews with images
     */
    public ReviewPredicates withImages(Boolean hasImages) {
        if (hasImages != null) {
            builder.and(Expressions.booleanPath("hasImages").eq(hasImages));
        }
        return this;
    }

    /**
     * Filter by comment text containing
     */
    public ReviewPredicates withCommentContaining(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            builder.and(Expressions.stringPath("comment").containsIgnoreCase(keyword));
        }
        return this;
    }

    /**
     * Filter by title containing
     */
    public ReviewPredicates withTitleContaining(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            builder.and(Expressions.stringPath("title").containsIgnoreCase(keyword));
        }
        return this;
    }

    /**
     * Filter by any text content (title or comment)
     */
    public ReviewPredicates withTextContaining(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            builder.and(Expressions.stringPath("title").containsIgnoreCase(keyword).or(Expressions.stringPath("comment").containsIgnoreCase(keyword)));
        }
        return this;
    }

    /**
     * Filter reviews created after date
     */
    public ReviewPredicates withCreatedAfter(LocalDateTime date) {
        if (date != null) {
            builder.and(Expressions.dateTimePath(LocalDateTime.class, "createdAt").goe(date));
        }
        return this;
    }

    /**
     * Filter reviews created before date
     */
    public ReviewPredicates withCreatedBefore(LocalDateTime date) {
        if (date != null) {
            builder.and(Expressions.dateTimePath(LocalDateTime.class, "createdAt").loe(date));
        }
        return this;
    }

    /**
     * Filter reviews created between dates
     */
    public ReviewPredicates withCreatedBetween(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            builder.and(Expressions.dateTimePath(LocalDateTime.class, "createdAt").between(startDate, endDate));
        }
        return this;
    }

    /**
     * Filter by minimum helpful count
     */
    public ReviewPredicates withMinHelpfulCount(Integer minCount) {
        if (minCount != null && minCount >= 0) {
            builder.and(Expressions.numberPath(Integer.class, "helpfulCount").goe(minCount));
        }
        return this;
    }

    /**
     * Filter reviews with admin response
     */
    public ReviewPredicates withAdminResponse() {
        builder.and(Expressions.stringPath("adminResponse").isNotNull());
        return this;
    }

    /**
     * Filter reviews without admin response
     */
    public ReviewPredicates withoutAdminResponse() {
        builder.and(Expressions.stringPath("adminResponse").isNull());
        return this;
    }

    /**
     * Filter 5-star reviews
     */
    public ReviewPredicates withFiveStarRating() {
        builder.and(Expressions.numberPath(Integer.class, "rating").eq(5));
        return this;
    }

    /**
     * Filter 1-star reviews
     */
    public ReviewPredicates withOneStarRating() {
        builder.and(Expressions.numberPath(Integer.class, "rating").eq(1));
        return this;
    }

    /**
     * Filter negative reviews (1-2 stars)
     */
    public ReviewPredicates withNegativeRating() {
        builder.and(Expressions.numberPath(Integer.class, "rating").loe(2));
        return this;
    }

    /**
     * Filter positive reviews (4-5 stars)
     */
    public ReviewPredicates withPositiveRating() {
        builder.and(Expressions.numberPath(Integer.class, "rating").goe(4));
        return this;
    }

    /**
     * Filter reviews needing attention
     */
    public ReviewPredicates withNeedsAttention() {
        builder.and(Expressions.numberPath(Integer.class, "rating").loe(2).or(Expressions.booleanPath("verifiedPurchase").isFalse()).or(Expressions.booleanPath("approved").isFalse()));
        return this;
    }

    /**
     * Filter by product name containing
     */
    public ReviewPredicates withProductNameContaining(String productName) {
        if (productName != null && !productName.isEmpty()) {
            builder.and(Expressions.stringPath("product.name").containsIgnoreCase(productName));
        }
        return this;
    }

    /**
     * Filter by reviewer username containing
     */
    public ReviewPredicates withReviewerUsernameContaining(String username) {
        if (username != null && !username.isEmpty()) {
            builder.and(Expressions.stringPath("user.username").containsIgnoreCase(username));
        }
        return this;
    }

    /**
     * Filter active reviews only
     */
    public ReviewPredicates withActive(Boolean active) {
        if (active != null) {
            builder.and(Expressions.booleanPath("isActive").eq(active));
        } else {
            builder.and(Expressions.booleanPath("isActive").isTrue());
        }
        return this;
    }

    /**
     * Complex search combining multiple criteria
     */
    public ReviewPredicates withSearch(Long productId, Long userId, Integer rating, Boolean verifiedPurchase, Boolean approved, Boolean withImages, String keyword) {
        if (productId != null) {
            builder.and(Expressions.numberPath(Long.class, "product.id").eq(productId));
        }
        if (userId != null) {
            builder.and(Expressions.numberPath(Long.class, "user.id").eq(userId));
        }
        if (rating != null) {
            builder.and(Expressions.numberPath(Integer.class, "rating").eq(rating));
        }
        if (verifiedPurchase != null) {
            builder.and(Expressions.booleanPath("verifiedPurchase").eq(verifiedPurchase));
        }
        if (approved != null) {
            builder.and(Expressions.booleanPath("approved").eq(approved));
        }
        if (withImages != null) {
            builder.and(Expressions.booleanPath("hasImages").eq(withImages));
        }
        if (keyword != null && !keyword.isEmpty()) {
            builder.and(Expressions.stringPath("title").containsIgnoreCase(keyword).or(Expressions.stringPath("comment").containsIgnoreCase(keyword)));
        }
        return this;
    }

    /**
     * Build the predicate
     */
    public Predicate build() {
        return builder.getValue();
    }

    /**
     * Build with default active filter
     */
    public Predicate buildActiveOnly() {
        builder.and(Expressions.booleanPath("isActive").isTrue());
        return builder.getValue();
    }

    public ReviewPredicates withMinRating(Integer minRating) {
        if (minRating != null) {
            builder.and(Expressions.numberPath(Integer.class, "rating").goe(minRating));
        }
        return this;
    }

    public ReviewPredicates withMaxRating(Integer maxRating) {
        if (maxRating != null) {
            builder.and(Expressions.numberPath(Integer.class, "rating").loe(maxRating));
        }
        return this;
    }
}