package com.smart_ecomernce_api.smart_ecomernce_api.modules.user.repository;

import com.querydsl.core.types.Predicate;
import com.smart_ecomernce_api.smart_ecomernce_api.common.base.BaseRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.Role;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for User entity
 */
@Repository
public interface UserRepository extends BaseRepository<User, Long> {

    /**
     * Find user by username
     */
    Optional<User> findByUsernameAndIsActiveTrue(String username);

    /**
     * Find user by email
     */
    Optional<User> findByEmailAndIsActiveTrue(String email);

    /**
     * Find user by phone number
     */
    Optional<User> findByPhoneNumberAndIsActiveTrue(String phoneNumber);

    /**
     * Check if username exists
     */
    boolean existsByUsernameAndIsActiveTrue(String username);

    /**
     * Check if email exists
     */
    boolean existsByEmailAndIsActiveTrue(String email);

    /**
     * Find users by role
     */
    Page<User> findByRoleAndIsActiveTrue(Role role, Pageable pageable);

    /**
     * Find users by first name (case insensitive)
     */
    Page<User> findByFirstNameContainingIgnoreCaseAndIsActiveTrue(String firstName, Pageable pageable);

    /**
     * Find users by last name (case insensitive)
     */
    Page<User> findByLastNameContainingIgnoreCaseAndIsActiveTrue(String lastName, Pageable pageable);

    /**
     * Search users by first name or last name or email
     */
    @Query("SELECT u FROM User u WHERE u.isActive = true AND " +
           "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find users created between dates
     */
    Page<User> findByCreatedAtBetweenAndIsActiveTrue(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Find recently registered users
     */
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.createdAt >= :sinceDate ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(@Param("sinceDate") LocalDateTime sinceDate);

    /**
     * Find recently registered users with pagination
     */
    @Query("SELECT u FROM User u WHERE u.isActive = true AND u.createdAt >= :sinceDate ORDER BY u.createdAt DESC")
    Page<User> findRecentUsers(@Param("sinceDate") LocalDateTime sinceDate, Pageable pageable);

    /**
     * Count users by role
     */
    long countByRoleAndIsActiveTrue(Role role);

    /**
     * Count active users
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();

    /**
     * Count inactive users
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = false")
    long countInactiveUsers();

    /**
     * Deactivate user (soft delete)
     */
    @Modifying
    @Query("UPDATE User u SET u.isActive = false, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :userId")
    int deactivateUser(@Param("userId") Long userId);

    /**
     * Reactivate user
     */
    @Modifying
    @Query("UPDATE User u SET u.isActive = true, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :userId")
    int reactivateUser(@Param("userId") Long userId);

    /**
     * Find all users matching a QueryDSL Predicate (for advanced filtering)
     */
    Page<User> findAll(Predicate predicate, Pageable pageable);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String username);

    Page<User> findByRole(String role, Pageable pageable);

    /**
     * Find user by id with addresses eagerly loaded
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.addresses WHERE u.id = :id")
    Optional<User> findByIdWithAddresses(@Param("id") Long id);
}