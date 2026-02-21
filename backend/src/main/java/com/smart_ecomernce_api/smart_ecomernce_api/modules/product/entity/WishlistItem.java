package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity;

import com.smart_ecomernce_api.smart_ecomernce_api.common.base.BaseEntity;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Enhanced Wishlist Item Entity with Guest Support.
 * Supports both authenticated users and guest sessions.
 *
 * Caching strategy: Entities are cached at the service layer via Spring Cache.
 * JPA second-level cache (Hibernate) is applied here via @Cache.
 */
@Entity
@Table(name = "wishlist_items", indexes = {
        @Index(name = "idx_wishlist_user", columnList = "user_id"),
        @Index(name = "idx_wishlist_guest_session", columnList = "guest_session_id"),
        @Index(name = "idx_wishlist_product", columnList = "product_id"),
        @Index(name = "idx_wishlist_created", columnList = "created_at"),
        @Index(name = "idx_wishlist_priority", columnList = "priority"),
        @Index(name = "idx_wishlist_purchased", columnList = "purchased"),
        // Composite index speeds up the most common query: all items for a user, sorted
        // newest-first
        @Index(name = "idx_wishlist_user_created", columnList = "user_id, created_at DESC")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_product", columnNames = { "user_id", "product_id" }),
        @UniqueConstraint(name = "uk_guest_product", columnNames = { "guest_session_id", "product_id" })
})
// Hibernate L2 cache – requires cache provider (e.g. Caffeine/EHCache) on the
// classpath
// and `spring.jpa.properties.hibernate.cache.use_second_level_cache=true`
@org.hibernate.annotations.Cache(usage = org.hibernate.annotations.CacheConcurrencyStrategy.READ_WRITE)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class WishlistItem extends BaseEntity {

    // ──────────────────────── Ownership ────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // ──────────────────────── Product ────────────────────────

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // ──────────────────────── Meta ────────────────────────

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20, nullable = false)
    @Builder.Default
    private WishlistPriority priority = WishlistPriority.MEDIUM;

    @Column(name = "desired_quantity", nullable = false)
    @Builder.Default
    private Integer desiredQuantity = 1;

    // ──────────────────────── Price tracking ────────────────────────

    @Column(name = "price_when_added", precision = 10, scale = 2)
    private BigDecimal priceWhenAdded;

    @Column(name = "target_price", precision = 10, scale = 2)
    private BigDecimal targetPrice;

    @Column(name = "price_drop_count", nullable = false)
    @Builder.Default
    private Integer priceDropCount = 0;

    @Column(name = "last_price_check")
    private LocalDateTime lastPriceCheck;

    // ──────────────────────── Notifications ────────────────────────

    @Column(name = "notify_on_price_drop", nullable = false)
    @Builder.Default
    private Boolean notifyOnPriceDrop = false;

    @Column(name = "notify_on_stock", nullable = false)
    @Builder.Default
    private Boolean notifyOnStock = false;

    // ──────────────────────── Purchase ────────────────────────

    @Column(name = "purchased", nullable = false)
    @Builder.Default
    private Boolean purchased = false;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    // ──────────────────────── Sharing ────────────────────────

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    // ──────────────────────── Organisation ────────────────────────

    @Column(name = "collection_name", length = 100)
    private String collectionName;

    /**
     * Comma-separated tag values stored as a single column (avoids join table
     * overhead).
     */
    @Column(name = "tags", length = 500)
    private String tags;

    // ──────────────────────── Reminders ────────────────────────

    @Column(name = "reminder_enabled", nullable = false)
    @Builder.Default
    private Boolean reminderEnabled = false;

    @Column(name = "reminder_date")
    private LocalDateTime reminderDate;

    // ──────────────────────── Guest extras ────────────────────────

    @Column(name = "guest_email", length = 255)
    private String guestEmail;

    @Column(name = "guest_session_expires_at")
    private LocalDateTime guestSessionExpiresAt;

    // ═══════════════════════════════════════════════════════════════
    // Business logic
    // ═══════════════════════════════════════════════════════════════

    public boolean isUserItem() {
        return user != null;
    }

    public boolean isPriceDropped() {
        if (priceWhenAdded == null || product == null)
            return false;
        return product.getEffectivePrice().compareTo(priceWhenAdded) < 0;
    }

    public BigDecimal getPriceDifference() {
        if (priceWhenAdded == null || product == null)
            return BigDecimal.ZERO;
        return priceWhenAdded.subtract(product.getEffectivePrice());
    }

    public BigDecimal getPriceDropPercentage() {
        if (priceWhenAdded == null
                || priceWhenAdded.compareTo(BigDecimal.ZERO) == 0
                || product == null) {
            return BigDecimal.ZERO;
        }
        return getPriceDifference()
                .divide(priceWhenAdded, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public boolean shouldNotifyPriceDrop() {
        if (!Boolean.TRUE.equals(notifyOnPriceDrop) || product == null)
            return false;
        if (targetPrice != null)
            return product.getEffectivePrice().compareTo(targetPrice) <= 0;
        return isPriceDropped();
    }

    public boolean shouldNotifyStock() {
        return Boolean.TRUE.equals(notifyOnStock)
                && product != null
                && product.isInStock()
                && !Boolean.TRUE.equals(purchased);
    }

    public void markAsPurchased() {
        this.purchased = true;
        this.purchasedAt = LocalDateTime.now();
    }

    public boolean isReminderDue() {
        return Boolean.TRUE.equals(reminderEnabled)
                && reminderDate != null
                && LocalDateTime.now().isAfter(reminderDate);
    }

    /** Convenience: parse the comma-separated tags column into a list. */
    public List<String> getTagList() {
        if (tags == null || tags.isBlank())
            return Collections.emptyList();
        return Arrays.asList(tags.split(","));
    }

    /** Convenience: write a list back to the comma-separated column. */
    public void setTagList(List<String> tagList) {
        this.tags = tagList == null ? null : String.join(",", tagList);
    }

    // ═══════════════════════════════════════════════════════════════
    // JPA lifecycle callbacks
    // ═══════════════════════════════════════════════════════════════

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();

        if (user == null) {
            throw new IllegalStateException(
                    "WishlistItem must belong to either a registered user or a guest session.");
        }

        if (priceWhenAdded == null && product != null) {
            priceWhenAdded = product.getEffectivePrice();
        }

    }

    @PreUpdate
    @Override
    protected void onUpdate() {
        super.onUpdate();

        // Increment counter only when price actually dropped since last check
        if (lastPriceCheck != null && isPriceDropped()) {
            priceDropCount = (priceDropCount == null ? 0 : priceDropCount) + 1;
        }
        lastPriceCheck = LocalDateTime.now();
    }
}