package com.smart_ecomernce_api.smart_ecomernce_api.common.predicate;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.Role;

import java.time.LocalDateTime;

/**
 * QueryDSL Predicate builder for User entity
 * Provides type-safe, compile-time checked queries for complex user filtering
 * 
 * Usage:
 * <pre>
 * Predicate predicate = UserPredicates.builder()
 *     .withUsernameContaining("john")
 *     .withRole(Role.USER)
 *     .withCreatedAfter(LocalDateTime.now().minusDays(30))
 *     .build();
 * 
 * userRepository.findAll(predicate, pageable);
 * </pre>
 */
public class UserPredicates {

    private final BooleanBuilder builder;

    public UserPredicates() {
        this.builder = new BooleanBuilder();
    }

    /**
     * Create a new predicate builder
     */
    public static UserPredicates builder() {
        return new UserPredicates();
    }

    /**
     * Filter by username containing (case-insensitive)
     */
    public UserPredicates withUsernameContaining(String username) {
        if (username != null && !username.isEmpty()) {
            builder.and(Expressions.stringPath("username")
                .containsIgnoreCase(username));
        }
        return this;
    }

    /**
     * Filter by email containing (case-insensitive)
     */
    public UserPredicates withEmailContaining(String email) {
        if (email != null && !email.isEmpty()) {
            builder.and(Expressions.stringPath("email")
                .containsIgnoreCase(email));
        }
        return this;
    }

    /**
     * Filter by first name containing (case-insensitive)
     */
    public UserPredicates withFirstNameContaining(String firstName) {
        if (firstName != null && !firstName.isEmpty()) {
            builder.and(Expressions.stringPath("firstName")
                .containsIgnoreCase(firstName));
        }
        return this;
    }

    /**
     * Filter by last name containing (case-insensitive)
     */
    public UserPredicates withLastNameContaining(String lastName) {
        if (lastName != null && !lastName.isEmpty()) {
            builder.and(Expressions.stringPath("lastName")
                .containsIgnoreCase(lastName));
        }
        return this;
    }

    /**
     * Filter by name containing (first OR last name)
     */
    public UserPredicates withNameContaining(String name) {
        if (name != null && !name.isEmpty()) {
            builder.and(
                Expressions.stringPath("firstName").containsIgnoreCase(name)
                    .or(Expressions.stringPath("lastName").containsIgnoreCase(name))
            );
        }
        return this;
    }

    /**
     * Filter by username OR email containing
     */
    public UserPredicates withUsernameOrEmailContaining(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            builder.and(
                Expressions.stringPath("username").containsIgnoreCase(keyword)
                    .or(Expressions.stringPath("email").containsIgnoreCase(keyword))
            );
        }
        return this;
    }

    /**
     * Filter by exact role
     */
    public UserPredicates withRole(Role role) {
        if (role != null) {
            builder.and(Expressions.enumPath(Role.class, "role").eq(role));
        }
        return this;
    }

    /**
     * Filter by phone number containing
     */
    public UserPredicates withPhoneNumberContaining(String phoneNumber) {
        if (phoneNumber != null && !phoneNumber.isEmpty()) {
            builder.and(Expressions.stringPath("phoneNumber").contains(phoneNumber));
        }
        return this;
    }

    /**
     * Filter users created after date
     */
    public UserPredicates withCreatedAfter(LocalDateTime date) {
        if (date != null) {
            builder.and(Expressions.dateTimePath(LocalDateTime.class, "createdAt")
                .goe(date));
        }
        return this;
    }

    /**
     * Filter users created before date
     */
    public UserPredicates withCreatedBefore(LocalDateTime date) {
        if (date != null) {
            builder.and(Expressions.dateTimePath(LocalDateTime.class, "createdAt")
                .loe(date));
        }
        return this;
    }

    /**
     * Filter users created between dates
     */
    public UserPredicates withCreatedBetween(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            builder.and(Expressions.dateTimePath(LocalDateTime.class, "createdAt")
                .between(startDate, endDate));
        }
        return this;
    }

    /**
     * Filter users with last login after date
     */
    public UserPredicates withLastLoginAfter(LocalDateTime date) {
        if (date != null) {
            builder.and(Expressions.dateTimePath(LocalDateTime.class, "lastLoginAt")
                .goe(date));
        }
        return this;
    }

    /**
     * Filter users who never logged in
     */
    public UserPredicates withNeverLoggedIn() {
        builder.and(Expressions.dateTimePath(LocalDateTime.class, "lastLoginAt").isNull());
        return this;
    }

    /**
     * Filter by email verified status
     */
    public UserPredicates withEmailVerified(Boolean verified) {
        if (verified != null) {
            builder.and(Expressions.booleanPath("emailVerified").eq(verified));
        }
        return this;
    }

    /**
     * Filter by phone verified status
     */
    public UserPredicates withPhoneVerified(Boolean verified) {
        if (verified != null) {
            builder.and(Expressions.booleanPath("phoneVerified").eq(verified));
        }
        return this;
    }

    /**
     * Filter active users only
     */
    public UserPredicates withActive(Boolean active) {
        if (active != null) {
            builder.and(Expressions.booleanPath("isActive").eq(active));
        } else {
            // Default to active only
            builder.and(Expressions.booleanPath("isActive").isTrue());
        }
        return this;
    }

    /**
     * Filter users with minimum order count
     */
    public UserPredicates withMinOrders(Integer minOrders) {
        if (minOrders != null && minOrders > 0) {
            // This assumes there's an orderCount field or requires a subquery
            // For now, using a simplified approach with a subquery placeholder
            builder.and(Expressions.numberPath(Integer.class, "orderCount").goe(minOrders));
        }
        return this;
    }

    /**
     * Filter users who have made at least one order
     */
    public UserPredicates withOrders() {
        builder.and(Expressions.numberPath(Integer.class, "orderCount").gt(0));
        return this;
    }

    /**
     * Filter users with no orders
     */
    public UserPredicates withNoOrders() {
        builder.and(Expressions.numberPath(Integer.class, "orderCount").eq(0));
        return this;
    }

    /**
     * Complex search across multiple fields
     */
    public UserPredicates withSearch(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            builder.and(
                Expressions.stringPath("username").containsIgnoreCase(keyword)
                    .or(Expressions.stringPath("email").containsIgnoreCase(keyword))
                    .or(Expressions.stringPath("firstName").containsIgnoreCase(keyword))
                    .or(Expressions.stringPath("lastName").containsIgnoreCase(keyword))
            );
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
}
