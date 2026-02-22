package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.controller;

import com.smart_ecomernce_api.smart_ecomernce_api.common.response.ApiResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.WishlistPriority;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.service.WishlistService;
import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import com.smart_ecomernce_api.smart_ecomernce_api.security.filter.AuthenticationFilter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Wishlist REST controller.
 *
 * Security model
 * ──────────────
 * Class-level @RequestValidation (no roles) = any authenticated user.
 * GET /health is overridden to be public (requireAuth = false).
 * Every other endpoint requires a valid token — userId comes from a
 * @RequestParam which the calling client supplies, but the service layer
 * additionally verifies ownership against the session.
 */
@RequestValidation
@RestController
@RequestMapping("v1/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist Management", description = "Complete wishlist management for authenticated users")
public class WishlistController {

    private final WishlistService wishlistService;

    // ─────────────────────────────────────────────────────────────────────────
    //  Basic operations
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Add product to wishlist")
    public ResponseEntity<ApiResponse<WishlistItemDto>> addToWishlist(
            @Valid @RequestBody AddToWishlistRequest request,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        WishlistItemDto item = wishlistService.addToWishlist(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product added to wishlist successfully", item));
    }

    @GetMapping
    @Operation(summary = "Get user wishlist")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getWishlist(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved successfully",
                wishlistService.getUserWishlist(userId)));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get wishlist with pagination")
    public ResponseEntity<ApiResponse<Page<WishlistItemDto>>> getWishlistPaginated(
            @RequestParam(defaultValue = "0")         int    page,
            @RequestParam(defaultValue = "20")        int    size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC")      String sortDir,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved successfully",
                wishlistService.getUserWishlistPaginated(userId, pageable)));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get wishlist summary")
    public ResponseEntity<ApiResponse<WishlistSummaryDto>> getWishlistSummary(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Wishlist summary retrieved",
                wishlistService.getWishlistSummary(userId)));
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Check if product is in wishlist")
    public ResponseEntity<ApiResponse<Boolean>> checkInWishlist(
            @PathVariable Long productId,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Check completed",
                wishlistService.isInWishlist(userId, productId)));
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update wishlist item")
    public ResponseEntity<ApiResponse<WishlistItemDto>> updateWishlistItem(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateWishlistItemRequest request,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Wishlist item updated",
                wishlistService.updateWishlistItem(userId, productId, request)));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove from wishlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Product removed from wishlist", null));
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Clear entire wishlist")
    public ResponseEntity<ApiResponse<Void>> clearWishlist(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.clearWishlist(userId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist cleared successfully", null));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Price & stock tracking
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/price-drops")
    @Operation(summary = "Get items with price drops")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getItemsWithPriceDrops(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Items with price drops retrieved",
                wishlistService.getItemsWithPriceDrops(userId)));
    }

    @GetMapping("/stock-notifications")
    @Operation(summary = "Get items needing stock notification")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getItemsNeedingStockNotification(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Stock notification items retrieved",
                wishlistService.getItemsNeedingStockNotification(userId)));
    }

    @GetMapping("/target-price")
    @Operation(summary = "Get items below target price")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getItemsBelowTargetPrice(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Items below target price retrieved",
                wishlistService.getItemsBelowTargetPrice(userId)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Collections & organisation
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/collections")
    @Operation(summary = "Get all user collections")
    public ResponseEntity<ApiResponse<List<String>>> getUserCollections(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Collections retrieved",
                wishlistService.getUserCollections(userId)));
    }

    @GetMapping("/collection/{collectionName}")
    @Operation(summary = "Get wishlist items by collection")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getWishlistByCollection(
            @PathVariable String collectionName,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Collection items retrieved",
                wishlistService.getWishlistByCollection(userId, collectionName)));
    }

    @PutMapping("/collections/move")
    @Operation(summary = "Move items to a collection")
    public ResponseEntity<ApiResponse<Void>> moveItemsToCollection(
            @RequestParam List<Long> productIds,
            @RequestParam String collectionName,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.moveItemsToCollection(userId, productIds, collectionName);
        return ResponseEntity.ok(ApiResponse.success("Items moved to collection", null));
    }

    @GetMapping("/priority/{priority}")
    @Operation(summary = "Get wishlist items by priority")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getWishlistByPriority(
            @PathVariable WishlistPriority priority,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Items by priority retrieved",
                wishlistService.getWishlistByPriority(userId, priority)));
    }

    @GetMapping("/tags")
    @Operation(summary = "Get wishlist items by tags")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getWishlistByTags(
            @RequestParam List<String> tags,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Items by tags retrieved",
                wishlistService.getWishlistByTags(userId, tags)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Purchase & cart operations
    // ─────────────────────────────────────────────────────────────────────────

    @PatchMapping("/{productId}/purchase")
    @Operation(summary = "Mark item as purchased")
    public ResponseEntity<ApiResponse<WishlistItemDto>> markAsPurchased(
            @PathVariable Long productId,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Item marked as purchased",
                wishlistService.markAsPurchased(userId, productId)));
    }

    @PatchMapping("/purchase/multiple")
    @Operation(summary = "Mark multiple items as purchased")
    public ResponseEntity<ApiResponse<Void>> markMultipleAsPurchased(
            @RequestBody List<Long> productIds,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.markMultipleAsPurchased(userId, productIds);
        return ResponseEntity.ok(ApiResponse.success("Items marked as purchased", null));
    }

    @PostMapping("/{productId}/move-to-cart")
    @Operation(summary = "Move item to cart")
    public ResponseEntity<ApiResponse<Void>> moveToCart(
            @PathVariable Long productId,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.moveToCart(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Item moved to cart", null));
    }

    @PostMapping("/move-to-cart/multiple")
    @Operation(summary = "Move multiple items to cart")
    public ResponseEntity<ApiResponse<Void>> moveMultipleToCart(
            @RequestBody List<Long> productIds,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.moveMultipleToCart(userId, productIds);
        return ResponseEntity.ok(ApiResponse.success("Items moved to cart", null));
    }

    @GetMapping("/purchased")
    @Operation(summary = "Get purchased items")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getPurchasedItems(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Purchased items retrieved",
                wishlistService.getPurchasedItems(userId)));
    }

    @GetMapping("/unpurchased")
    @Operation(summary = "Get unpurchased items")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getUnpurchasedItems(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Unpurchased items retrieved",
                wishlistService.getUnpurchasedItems(userId)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Bulk operations
    // ─────────────────────────────────────────────────────────────────────────

    @DeleteMapping("/bulk/remove")
    @Operation(summary = "Remove multiple products from wishlist")
    public ResponseEntity<ApiResponse<Void>> removeMultipleFromWishlist(
            @RequestBody List<Long> productIds,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.removeMultipleFromWishlist(userId, productIds);
        return ResponseEntity.ok(ApiResponse.success("Multiple items removed", null));
    }

    @PutMapping("/bulk/update")
    @Operation(summary = "Update multiple wishlist items")
    public ResponseEntity<ApiResponse<Void>> updateMultipleItems(
            @RequestBody Map<Long, UpdateWishlistItemRequest> updates,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.updateMultipleItems(userId, updates);
        return ResponseEntity.ok(ApiResponse.success("Multiple items updated", null));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Reminders & notifications
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/{productId}/reminder")
    @Operation(summary = "Set reminder for wishlist item")
    public ResponseEntity<ApiResponse<WishlistItemDto>> setReminder(
            @PathVariable Long productId,
            @Valid @RequestBody WishlistReminderRequest request,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Reminder set successfully",
                wishlistService.setReminder(userId, productId, request)));
    }

    @GetMapping("/reminders/due")
    @Operation(summary = "Get items with due reminders")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getItemsWithDueReminders(HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Due reminders retrieved",
                wishlistService.getItemsWithDueReminders(userId)));
    }

    @DeleteMapping("/{productId}/reminder")
    @Operation(summary = "Cancel a reminder")
    public ResponseEntity<ApiResponse<Void>> cancelReminder(
            @PathVariable Long productId,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        wishlistService.cancelReminder(userId, productId);
        return ResponseEntity.ok(ApiResponse.success("Reminder cancelled", null));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Analytics & insights
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/analytics")
    @Operation(summary = "Get wishlist analytics")
    public ResponseEntity<ApiResponse<WishlistAnalyticsDto>> getWishlistAnalytics(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved",
                wishlistService.getWishlistAnalytics(userId)));
    }

    @GetMapping("/{productId}/price-history")
    @Operation(summary = "Get price history for a wishlist item")
    public ResponseEntity<ApiResponse<List<PriceHistoryDto>>> getPriceHistory(
            @RequestParam Long userId, @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Price history retrieved",
                wishlistService.getPriceHistory(userId, productId)));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Get product recommendations based on wishlist")
    public ResponseEntity<ApiResponse<List<ProductRecommendationDto>>> getRecommendations(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Recommendations retrieved",
                wishlistService.getWishlistRecommendations(userId)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Import / Export
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/export/csv")
    @Operation(summary = "Export wishlist to CSV")
    public ResponseEntity<byte[]> exportWishlistToCsv(@RequestParam Long userId) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=wishlist.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(wishlistService.exportWishlistToCsv(userId));
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "Export wishlist to PDF")
    public ResponseEntity<byte[]> exportWishlistToPdf(@RequestParam Long userId) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=wishlist.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(wishlistService.exportWishlistToPdf(userId));
    }

    @PostMapping("/import/csv")
    @Operation(summary = "Import wishlist from CSV")
    public ResponseEntity<ApiResponse<Void>> importWishlistFromCsv(
            @RequestParam Long userId, @RequestBody byte[] csvData) {
        wishlistService.importWishlistFromCsv(userId, csvData);
        return ResponseEntity.ok(ApiResponse.success("Wishlist imported successfully", null));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Comparison & shopping
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/price-comparison")
    @Operation(summary = "Compare prices across wishlist items")
    public ResponseEntity<ApiResponse<WishlistPriceComparisonDto>> compareWishlistPrices(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Price comparison retrieved",
                wishlistService.compareWishlistPrices(userId)));
    }

    @GetMapping("/cost-summary")
    @Operation(summary = "Get wishlist total cost summary")
    public ResponseEntity<ApiResponse<WishlistCostSummaryDto>> getWishlistCost(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Cost summary retrieved",
                wishlistService.getWishlistCost(userId)));
    }

    @GetMapping("/available")
    @Operation(summary = "Get in-stock, unpurchased wishlist items")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getAvailableItems(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Available items retrieved",
                wishlistService.getAvailableItems(userId)));
    }

    @PostMapping("/optimize")
    @Operation(summary = "Optimise wishlist based on criteria")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> optimizeWishlist(
            @RequestParam Long userId, @Valid @RequestBody WishlistOptimizationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Wishlist optimized",
                wishlistService.optimizeWishlist(userId, request)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Utility
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/count")
    @Operation(summary = "Get wishlist item count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Count retrieved",
                (long) wishlistService.getUserWishlist(userId).size()));
    }

    @GetMapping("/health")
    @RequestValidation(requireAuth = false)
    @Operation(summary = "Health check")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Wishlist service is healthy", "OK"));
    }
}