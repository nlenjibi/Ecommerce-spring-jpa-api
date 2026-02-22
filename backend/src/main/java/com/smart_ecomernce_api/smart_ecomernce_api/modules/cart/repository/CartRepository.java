package com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.repository;

import com.smart_ecomernce_api.smart_ecomernce_api.common.base.BaseRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.entity.Cart;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Cart entity
 */
@Repository
public interface CartRepository extends BaseRepository<Cart, Long> {

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.id = :id")
    Optional<Cart> findByIdWithItems(@Param("id") Long id);


    @Query("SELECT c FROM Cart c WHERE c.createdAt < :cutoffDate AND SIZE(c.items) > 0")
    List<Cart> findAbandonedCartsBefore(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT c FROM Cart c WHERE c.isActive = true AND SIZE(c.items) > 0")
    List<Cart> findActiveCartsWithItems();

    @Query("SELECT c FROM Cart c WHERE c.isActive = true AND c.createdAt < :cutoffDate " + "AND SIZE(c.items) = 0")
    List<Cart> findEmptyCartsBefore(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Use inherited method from BaseRepository: findByCreatedAtBetween

    @Query("SELECT COUNT(c) FROM Cart c WHERE c.isActive = true")
    long countActiveCarts();

    @Query("SELECT COUNT(c) FROM Cart c WHERE c.isActive = false")
    long countInactiveCarts();

    @Query("SELECT DISTINCT c FROM Cart c JOIN c.items ci WHERE ci.product.id = :productId")
    List<Cart> findCartsContainingProduct(@Param("productId") Long productId);

    @Query("SELECT c FROM Cart c JOIN c.items ci GROUP BY c HAVING SUM(ci.quantity) >= :minQuantity")
    List<Cart> findCartsWithQuantityAbove(@Param("minQuantity") Integer minQuantity);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.isActive = false AND c.createdAt < :cutoffDate")
    int deleteInactiveCartsBefore(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Modifying
    @Query("UPDATE Cart c SET c.isActive = false WHERE c.isActive = true AND c.updatedAt < :cutoffDate")
    int deactivateOldCarts(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Find carts abandoned for more than X days (inactive and has items)
    @Query("SELECT c FROM Cart c WHERE c.updatedAt < :abandonedDate AND SIZE(c.items) > 0 AND c.isActive = true")
    List<Cart> findAbandonedCarts(@Param("abandonedDate") LocalDateTime abandonedDate);

    // Calculate total cart value for all active carts
    @Query("SELECT COALESCE(SUM(c.discountAmount), 0) FROM Cart c WHERE c.isActive = true")
    BigDecimal calculateTotalDiscountAmount();


}
