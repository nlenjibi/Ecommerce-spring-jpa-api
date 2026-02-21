package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.repository;

import com.smart_ecomernce_api.smart_ecomernce_api.common.base.BaseRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.WishlistItem;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.WishlistPriority;
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
 * JPA repository for {@link WishlistItem}.
 *
 * Query design principles applied here:
 *  - Derived query methods for simple lookups (Spring Data generates optimised SQL).
 *  - JPQL @Query for anything requiring JOINs or computed predicates.
 *  - @Modifying + @Query for bulk DML (avoids loading entities just to delete/update them).
 *  - EntityGraph hints on read-heavy queries to avoid N+1 on product/user associations.
 */
@Repository
public interface WishlistRepository extends BaseRepository<WishlistItem, Long> {

    // ──────────────────────────────────────────────────────────────
    //  Core lookups
    // ──────────────────────────────────────────────────────────────

    /**
     * All items for a user, newest first.
     * The composite index idx_wishlist_user_created makes this O(log n).
     */
    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product p
           LEFT JOIN FETCH p.category
           WHERE w.user.id = :userId
           ORDER BY w.createdAt DESC
           """)
    List<WishlistItem> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    /**
     * Paginated version – Spring Data automatically rewrites into a COUNT query for the total.
     */
    @Query(value = """
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product p
           LEFT JOIN FETCH p.category
           WHERE w.user.id = :userId
           """,
            countQuery = "SELECT COUNT(w) FROM WishlistItem w WHERE w.user.id = :userId")
    Page<WishlistItem> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /** Single item lookup – used by update/remove/check operations. */
    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product
           WHERE w.user.id = :userId AND w.product.id = :productId
           """)
    Optional<WishlistItem> findByUserIdAndProductId(
            @Param("userId") Long userId,
            @Param("productId") Long productId);

    /** Cheap existence check – avoids loading the entity. */
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    // ──────────────────────────────────────────────────────────────
    //  Price & stock queries
    // ──────────────────────────────────────────────────────────────

    /**
     * Items where the current price is lower than the price captured at add-time.
     * Sorted by the largest absolute saving first.
     */
    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product p
           WHERE w.user.id    = :userId
             AND w.purchased  = false
             AND p.discountPrice < w.priceWhenAdded
           ORDER BY (w.priceWhenAdded - p.discountPrice) DESC
           """)
    List<WishlistItem> findItemsWithPriceDrops(@Param("userId") Long userId);

    /**
     * Items the user wants stock alerts for that are currently available.
     */
    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product p
           WHERE w.user.id       = :userId
             AND w.notifyOnStock = true
             AND w.purchased     = false
             AND p.inventoryStatus IN ('IN_STOCK', 'LOW_STOCK')
           """)
    List<WishlistItem> findItemsNeedingStockNotification(@Param("userId") Long userId);

    /**
     * Items whose current price has fallen at or below the user's target price.
     */
    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product p
           WHERE w.user.id           = :userId
             AND w.notifyOnPriceDrop = true
             AND w.targetPrice       IS NOT NULL
             AND p.discountPrice     <= w.targetPrice
             AND w.purchased         = false
           """)
    List<WishlistItem> findItemsBelowTargetPrice(@Param("userId") Long userId);

    /**
     * Bulk price-check update: touch lastPriceCheck for all unpurchased items.
     * Called by the scheduled price-update job to avoid loading every entity.
     */
    @Modifying
    @Query("""
           UPDATE WishlistItem w
           SET w.lastPriceCheck = :now
           WHERE w.purchased = false
           """)
    int bulkUpdateLastPriceCheck(@Param("now") LocalDateTime now);

    // ──────────────────────────────────────────────────────────────
    //  Organisation: collections, priority, tags
    // ──────────────────────────────────────────────────────────────

    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product
           WHERE w.user.id         = :userId
             AND w.collectionName  = :collectionName
           ORDER BY w.createdAt DESC
           """)
    List<WishlistItem> findByUserIdAndCollectionName(
            @Param("userId") Long userId,
            @Param("collectionName") String collectionName);

    /** Distinct collection names for a user (used to populate a dropdown). */
    @Query("""
           SELECT DISTINCT w.collectionName
           FROM WishlistItem w
           WHERE w.user.id          = :userId
             AND w.collectionName   IS NOT NULL
           ORDER BY w.collectionName
           """)
    List<String> findDistinctCollectionsByUserId(@Param("userId") Long userId);

    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product
           WHERE w.user.id  = :userId
             AND w.priority = :priority
           ORDER BY w.createdAt DESC
           """)
    List<WishlistItem> findByUserIdAndPriority(
            @Param("userId") Long userId,
            @Param("priority") WishlistPriority priority);

    /**
     * Tag search: finds items whose comma-separated tags column contains any of the
     * supplied tags.  Uses LIKE for portability; switch to a full-text index when
     * the dataset grows large.
     *
     * Note: Spring Data does not support dynamic OR-LIKE lists natively, so we use
     * a native query here.  The tag list is expected to be a single comma-joined
     * string like "sale,electronics" passed from the service layer.
     */
    @Query(value = """
           SELECT * FROM wishlist_items w
           WHERE w.user_id = :userId
             AND w.tags    IS NOT NULL
             AND (
                   :tagsCsv IS NULL
                   OR w.tags REGEXP REPLACE(:tagsCsv, ',', '|')
                 )
           ORDER BY w.created_at DESC
           """, nativeQuery = true)
    List<WishlistItem> findByUserIdAndTagsContaining(
            @Param("userId") Long userId,
            @Param("tagsCsv") String tagsCsv);

    // ──────────────────────────────────────────────────────────────
    //  Bulk mutations (DML – avoid loading entities)
    // ──────────────────────────────────────────────────────────────

    /**
     * Move a set of products to a new collection in one statement.
     */
    @Modifying
    @Query("""
           UPDATE WishlistItem w
           SET w.collectionName = :collectionName
           WHERE w.user.id      = :userId
             AND w.product.id  IN :productIds
           """)
    int moveItemsToCollection(
            @Param("userId") Long userId,
            @Param("productIds") List<Long> productIds,
            @Param("collectionName") String collectionName);

    /**
     * Bulk-mark as purchased (e.g. after an order is confirmed).
     */
    @Modifying
    @Query("""
           UPDATE WishlistItem w
           SET w.purchased    = true,
               w.purchasedAt  = :now
           WHERE w.user.id   = :userId
             AND w.product.id IN :productIds
           """)
    int markMultipleAsPurchased(
            @Param("userId") Long userId,
            @Param("productIds") List<Long> productIds,
            @Param("now") LocalDateTime now);

    /**
     * Bulk remove: more efficient than loading + deleting each entity.
     */
    @Modifying
    @Query("""
           DELETE FROM WishlistItem w
           WHERE w.user.id      = :userId
             AND w.product.id  IN :productIds
           """)
    int deleteByUserIdAndProductIdIn(
            @Param("userId") Long userId,
            @Param("productIds") List<Long> productIds);

    /** Clear entire wishlist without loading items into the persistence context. */
    @Modifying
    @Query("DELETE FROM WishlistItem w WHERE w.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);

    // ──────────────────────────────────────────────────────────────
    //  Sharing / public lists
    // ──────────────────────────────────────────────────────────────

    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product
           WHERE w.user.id  = :userId
             AND w.isPublic = true
           ORDER BY w.createdAt DESC
           """)
    List<WishlistItem> findPublicItemsByUserId(@Param("userId") Long userId);

    // ──────────────────────────────────────────────────────────────
    //  Counts & projections
    // ──────────────────────────────────────────────────────────────

    long countByUserId(Long userId);

    long countByUserIdAndPurchasedFalse(Long userId);

    long countByUserIdAndPurchasedTrue(Long userId);

    /** Projection: just product IDs – cheap for "also in wishlist?" checks. */
    @Query("SELECT w.product.id FROM WishlistItem w WHERE w.user.id = :userId")
    List<Long> findProductIdsByUserId(@Param("userId") Long userId);

    // ──────────────────────────────────────────────────────────────
    //  Reminders
    // ──────────────────────────────────────────────────────────────

    @Query("""
           SELECT w FROM WishlistItem w
           JOIN FETCH w.product
           WHERE w.user.id         = :userId
             AND w.reminderEnabled = true
             AND w.reminderDate   <= :now
             AND w.purchased       = false
           """)
    List<WishlistItem> findItemsWithDueReminders(
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now);

    // ──────────────────────────────────────────────────────────────
    //  Analytics helpers
    // ──────────────────────────────────────────────────────────────

    /**
     * Per-category summary: item count + sum of current prices.
     * Returns Object[] rows [categoryName, itemCount, totalValue].
     */
    @Query("""
           SELECT p.category.name,
                  COUNT(w),
                  SUM(p.discountPrice)
           FROM WishlistItem w
           JOIN w.product p
           WHERE w.user.id   = :userId
             AND w.purchased = false
           GROUP BY p.category.name
           ORDER BY COUNT(w) DESC
           """)
    List<Object[]> findCategoryAnalyticsByUserId(@Param("userId") Long userId);

    /**
     * Total value (sum of effective prices) and total savings for a user's unpurchased list.
     * Returns Object[] row [totalValue, totalSavings].
     */
    @Query("""
           SELECT SUM(p.discountPrice),
                  SUM(CASE WHEN w.priceWhenAdded > p.discountPrice
                           THEN w.priceWhenAdded - p.discountPrice
                           ELSE 0 END)
           FROM WishlistItem w
           JOIN w.product p
           WHERE w.user.id   = :userId
             AND w.purchased = false
           """)
    Object[] findTotalValueAndSavings(@Param("userId") Long userId);

    /**
     * Items added in the current calendar month.
     */
    @Query("""
           SELECT COUNT(w)
           FROM WishlistItem w
           WHERE w.user.id    = :userId
             AND w.createdAt >= :startOfMonth
           """)
    long countItemsAddedSince(
            @Param("userId") Long userId,
            @Param("startOfMonth") LocalDateTime startOfMonth);
}
