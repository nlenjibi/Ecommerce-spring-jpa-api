package com.smart_ecomernce_api.smart_ecomernce_api.common.base;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Base repository interface that extends JpaRepository and QuerydslPredicateExecutor
 * with common methods for all entities in the e-commerce system.
 *
 * @param <T>  Entity type
 * @param <ID> Primary key type
 */
@NoRepositoryBean
public interface BaseRepository<T extends BaseEntity, ID> extends JpaRepository<T, ID>, QuerydslPredicateExecutor<T> {

    /**
     * Find all active entities
     */
    List<T> findByIsActiveTrue();

    /**
     * Find all active entities with pagination
     */
    Page<T> findByIsActiveTrue(Pageable pageable);

    /**
     * Find entity by ID if it's active
     */
    Optional<T> findByIdAndIsActiveTrue(ID id);

    /**
     * Find entities created between dates
     */
    List<T> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find entities created between dates with pagination
     */
    Page<T> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Find entities updated between dates
     */
    List<T> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find entities updated between dates with pagination
     */
    Page<T> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Soft delete by setting isActive to false
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isActive = false WHERE e.id = :id")
    void softDeleteById(@NonNull @Param("id") ID id);

    /**
     * Soft delete multiple entities
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isActive = false WHERE e.id IN :ids")
    void softDeleteAllById(@NonNull @Param("ids") Iterable<ID> ids);

    /**
     * Restore soft-deleted entity
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.isActive = true WHERE e.id = :id")
    void restoreById(@NonNull @Param("id") ID id);

    /**
     * Find all soft-deleted entities
     */
    List<T> findByIsActiveFalse();

    /**
     * Find all soft-deleted entities with pagination
     */
    Page<T> findByIsActiveFalse(Pageable pageable);

    /**
     * Check if active entity exists by ID
     */
    boolean existsByIdAndIsActiveTrue(ID id);

    /**
     * Count all active entities
     */
    long countByIsActiveTrue();

    /**
     * Count all soft-deleted entities
     */
    long countByIsActiveFalse();

}
