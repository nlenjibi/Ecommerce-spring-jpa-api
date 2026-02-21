package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.service;

import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.WishlistPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
public interface WishlistService {

    // ──────────────────────────────────────────────────────────────
    //  Basic CRUD
    // ──────────────────────────────────────────────────────────────

    WishlistItemDto addToWishlist(Long userId, AddToWishlistRequest request);

    List<WishlistItemDto> getUserWishlist(Long userId);

    Page<WishlistItemDto> getUserWishlistPaginated(Long userId, Pageable pageable);

    WishlistSummaryDto getWishlistSummary(Long userId);

    void removeFromWishlist(Long userId, Long productId);

    WishlistItemDto updateWishlistItem(Long userId, Long productId, UpdateWishlistItemRequest request);

    boolean isInWishlist(Long userId, Long productId);

    void clearWishlist(Long userId);

    // ──────────────────────────────────────────────────────────────
    //  Price & stock tracking
    // ──────────────────────────────────────────────────────────────

    List<WishlistItemDto> getItemsWithPriceDrops(Long userId);

    List<WishlistItemDto> getItemsNeedingStockNotification(Long userId);

    List<WishlistItemDto> getItemsBelowTargetPrice(Long userId);

    /** Scheduled job: bulk-updates lastPriceCheck for all unpurchased items. */
    void updateWishlistPrices();

    // ──────────────────────────────────────────────────────────────
    //  Collections & organisation
    // ──────────────────────────────────────────────────────────────

    List<WishlistItemDto> getWishlistByCollection(Long userId, String collectionName);

    List<String> getUserCollections(Long userId);

    void moveItemsToCollection(Long userId, List<Long> productIds, String collectionName);

    List<WishlistItemDto> getWishlistByPriority(Long userId, WishlistPriority priority);

    List<WishlistItemDto> getWishlistByTags(Long userId, List<String> tags);

    // ──────────────────────────────────────────────────────────────
    //  Purchase & cart
    // ──────────────────────────────────────────────────────────────

    WishlistItemDto markAsPurchased(Long userId, Long productId);

    void markMultipleAsPurchased(Long userId, List<Long> productIds);

    void moveToCart(Long userId, Long productId);

    void moveMultipleToCart(Long userId, List<Long> productIds);

    List<WishlistItemDto> getPurchasedItems(Long userId);

    List<WishlistItemDto> getUnpurchasedItems(Long userId);

    // ──────────────────────────────────────────────────────────────
    //  Sharing & social
    // ──────────────────────────────────────────────────────────────

    WishlistShareDto shareWishlist(Long userId, WishlistShareRequest request);

    WishlistSummaryDto getPublicWishlist(String shareToken);

    List<WishlistItemDto> getPublicWishlistItems(Long userId);

    void updateWishlistPrivacy(Long userId, boolean isPublic);

    // ──────────────────────────────────────────────────────────────
    //  Bulk operations
    // ──────────────────────────────────────────────────────────────

    List<WishlistItemDto> addMultipleToWishlist(Long userId, List<AddToWishlistRequest> requests);

    void removeMultipleFromWishlist(Long userId, List<Long> productIds);

    void updateMultipleItems(Long userId, Map<Long, UpdateWishlistItemRequest> updates);

    // ──────────────────────────────────────────────────────────────
    //  Reminders
    // ──────────────────────────────────────────────────────────────

    WishlistItemDto setReminder(Long userId, Long productId, WishlistReminderRequest request);

    List<WishlistItemDto> getItemsWithDueReminders(Long userId);

    void cancelReminder(Long userId, Long productId);

    // ──────────────────────────────────────────────────────────────
    //  Analytics & insights
    // ──────────────────────────────────────────────────────────────

    WishlistAnalyticsDto getWishlistAnalytics(Long userId);

    List<PriceHistoryDto> getPriceHistory(Long userId, Long productId);

    List<ProductRecommendationDto> getWishlistRecommendations(Long userId);

    // ──────────────────────────────────────────────────────────────
    //  Import / export
    // ──────────────────────────────────────────────────────────────

    byte[] exportWishlistToCsv(Long userId);

    byte[] exportWishlistToPdf(Long userId);

    void importWishlistFromCsv(Long userId, byte[] csvData);

    // ──────────────────────────────────────────────────────────────
    //  Comparison & shopping
    // ──────────────────────────────────────────────────────────────

    WishlistPriceComparisonDto compareWishlistPrices(Long userId);

    WishlistCostSummaryDto getWishlistCost(Long userId);

    List<WishlistItemDto> getAvailableItems(Long userId);

    List<WishlistItemDto> optimizeWishlist(Long userId, WishlistOptimizationRequest request);
}