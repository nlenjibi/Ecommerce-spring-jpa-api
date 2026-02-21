package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.service.impl;

import com.smart_ecomernce_api.smart_ecomernce_api.exception.ResourceNotFoundException;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.WishlistItem;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.WishlistPriority;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.mapper.WishlistMapper;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.repository.WishlistRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.service.WishlistService;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.repository.UserRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@CacheConfig(cacheNames = "wishlists")
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository     userRepository;
    private final ProductRepository  productRepository;
    private final WishlistMapper     wishlistMapper;

    // Replace duplicated "WishlistItem" with a private static final constant
    private static final String WISHLIST_ITEM_RESOURCE = "WishlistItem";

    // ═══════════════════════════════════════════════════════════════
    //  Basic CRUD
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'paginated:'  + #userId"),
            @CacheEvict(key = "'summary:'    + #userId"),
            @CacheEvict(key = "'check:'      + #userId + ':' + #request.productId")
    })
    public WishlistItemDto addToWishlist(Long userId, AddToWishlistRequest request) {
        log.debug("addToWishlist: userId={}, productId={}", userId, request.getProductId());

        if (wishlistRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            // Idempotent – return the existing item rather than throwing
            return wishlistRepository
                    .findByUserIdAndProductId(userId, request.getProductId())
                    .map(wishlistMapper::toDto)
                    .orElseThrow();
        }

        var user    = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("User", userId));
        var product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> ResourceNotFoundException.forResource("Product", request.getProductId()));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .priority(request.getPriority() != null ? request.getPriority() : WishlistPriority.MEDIUM)
                .notes(request.getNotes())
                .desiredQuantity(request.getDesiredQuantity() != null ? request.getDesiredQuantity() : 1)
                .notifyOnPriceDrop(Boolean.TRUE.equals(request.getNotifyOnPriceDrop()))
                .notifyOnStock(Boolean.TRUE.equals(request.getNotifyOnStock()))
                .targetPrice(request.getTargetPrice())
                .collectionName(request.getCollectionName())
                .build();

        return wishlistMapper.toDto(wishlistRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "#userId")
    public List<WishlistItemDto> getUserWishlist(Long userId) {
        log.debug("getUserWishlist: userId={}", userId);
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(wishlistMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'paginated:' + #userId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<WishlistItemDto> getUserWishlistPaginated(Long userId, Pageable pageable) {
        log.debug("getUserWishlistPaginated: userId={}, page={}", userId, pageable.getPageNumber());
        return wishlistRepository.findByUserId(userId, pageable)
                .map(wishlistMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'summary:' + #userId")
    public WishlistSummaryDto getWishlistSummary(Long userId) {
        log.debug("getWishlistSummary: userId={}", userId);

        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Object[] totals = wishlistRepository.findTotalValueAndSavings(userId);
        BigDecimal totalValue   = totals[0] != null ? (BigDecimal) totals[0] : BigDecimal.ZERO;
        BigDecimal totalSavings = totals[1] != null ? (BigDecimal) totals[1] : BigDecimal.ZERO;

        long inStock      = items.stream().filter(i -> i.getProduct().isInStock()).count();
        long outOfStock   = items.size() - inStock;
        long priceDrops   = items.stream().filter(WishlistItem::isPriceDropped).count();
        long purchased    = items.stream().filter(i -> Boolean.TRUE.equals(i.getPurchased())).count();

        return WishlistSummaryDto.builder()
                .userId(userId)
                .totalItems(items.size())
                .inStockItems((int) inStock)
                .outOfStockItems((int) outOfStock)
                .itemsWithPriceDrops((int) priceDrops)
                .purchasedItems((int) purchased)
                .totalValue(totalValue)
                .totalSavings(totalSavings)
                .items(items.stream().map(wishlistMapper::toDto).toList())
                .build();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'paginated:'  + #userId"),
            @CacheEvict(key = "'summary:'    + #userId"),
            @CacheEvict(key = "'check:'      + #userId + ':' + #productId")
    })
    public void removeFromWishlist(Long userId, Long productId) {
        log.debug("removeFromWishlist: userId={}, productId={}", userId, productId);
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("WishlistItem", productId));
        wishlistRepository.delete(item);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'paginated:'  + #userId"),
            @CacheEvict(key = "'summary:'    + #userId"),
            @CacheEvict(key = "'check:'      + #userId + ':' + #productId")
    })
    public WishlistItemDto updateWishlistItem(Long userId, Long productId, UpdateWishlistItemRequest request) {
        log.debug("updateWishlistItem: userId={}, productId={}", userId, productId);
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("WishlistItem", productId));

        if (request.getNotes()           != null) item.setNotes(request.getNotes());
        if (request.getPriority()        != null) item.setPriority(request.getPriority());
        if (request.getDesiredQuantity() != null) item.setDesiredQuantity(request.getDesiredQuantity());
        if (request.getTargetPrice()     != null) item.setTargetPrice(request.getTargetPrice());
        if (request.getNotifyOnPriceDrop() != null) item.setNotifyOnPriceDrop(request.getNotifyOnPriceDrop());
        if (request.getNotifyOnStock()   != null) item.setNotifyOnStock(request.getNotifyOnStock());
        if (request.getIsPublic()        != null) item.setIsPublic(request.getIsPublic());

        return wishlistMapper.toDto(wishlistRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'check:' + #userId + ':' + #productId")
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'paginated:'  + #userId"),
            @CacheEvict(key = "'summary:'    + #userId"),
            @CacheEvict(key = "'drops:'      + #userId"),
            @CacheEvict(key = "'analytics:'  + #userId"),
            @CacheEvict(key = "'cost:'       + #userId")
    })
    public void clearWishlist(Long userId) {
        log.debug("clearWishlist: userId={}", userId);
        int deleted = wishlistRepository.deleteByUserId(userId);
        log.info("clearWishlist: removed {} items for userId={}", deleted, userId);
    }

    // ═══════════════════════════════════════════════════════════════
    //  Price & stock tracking
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'drops:' + #userId")
    public List<WishlistItemDto> getItemsWithPriceDrops(Long userId) {
        return wishlistRepository.findItemsWithPriceDrops(userId)
                .stream().map(wishlistMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getItemsNeedingStockNotification(Long userId) {
        return wishlistRepository.findItemsNeedingStockNotification(userId)
                .stream().map(wishlistMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getItemsBelowTargetPrice(Long userId) {
        return wishlistRepository.findItemsBelowTargetPrice(userId)
                .stream().map(wishlistMapper::toDto).toList();
    }

    /**
     * Scheduled every 6 hours.
     * Uses a single bulk UPDATE instead of loading every entity.
     */
    @Override
    @Transactional
    @Scheduled(cron = "0 0 */6 * * *")
    public void updateWishlistPrices() {
        log.info("updateWishlistPrices: running bulk lastPriceCheck update");
        int updated = wishlistRepository.bulkUpdateLastPriceCheck(LocalDateTime.now());
        log.info("updateWishlistPrices: touched {} rows", updated);
    }

    // ═══════════════════════════════════════════════════════════════
    //  Collections & organisation
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'collection:' + #userId + ':' + #collectionName")
    public List<WishlistItemDto> getWishlistByCollection(Long userId, String collectionName) {
        return wishlistRepository.findByUserIdAndCollectionName(userId, collectionName)
                .stream().map(wishlistMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'collections:' + #userId")
    public List<String> getUserCollections(Long userId) {
        return wishlistRepository.findDistinctCollectionsByUserId(userId);
    }

    @Override
    @Transactional
    @CacheEvict(value = "wishlists", allEntries = false, key = "'collection:' + #userId + ':' + #collectionName")
    public void moveItemsToCollection(Long userId, List<Long> productIds, String collectionName) {
        log.debug("moveItemsToCollection: userId={}, collection={}, items={}", userId, collectionName, productIds.size());
        wishlistRepository.moveItemsToCollection(userId, productIds, collectionName);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'priority:' + #userId + ':' + #priority")
    public List<WishlistItemDto> getWishlistByPriority(Long userId, WishlistPriority priority) {
        return wishlistRepository.findByUserIdAndPriority(userId, priority)
                .stream().map(wishlistMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getWishlistByTags(Long userId, List<String> tags) {
        String tagsCsv = String.join(",", tags);
        return wishlistRepository.findByUserIdAndTagsContaining(userId, tagsCsv)
                .stream().map(wishlistMapper::toDto).toList();
    }

    // ═══════════════════════════════════════════════════════════════
    //  Purchase & cart
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'summary:'   + #userId"),
            @CacheEvict(key = "'analytics:' + #userId")
    })
    public WishlistItemDto markAsPurchased(Long userId, Long productId) {
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("WishlistItem", productId));
        item.markAsPurchased();
        return wishlistMapper.toDto(wishlistRepository.save(item));
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'summary:'   + #userId"),
            @CacheEvict(key = "'analytics:' + #userId")
    })
    public void markMultipleAsPurchased(Long userId, List<Long> productIds) {
        int updated = wishlistRepository.markMultipleAsPurchased(userId, productIds, LocalDateTime.now());
        log.debug("markMultipleAsPurchased: {} items updated for userId={}", updated, userId);
    }

    @Override
    @Transactional
    public void moveToCart(Long userId, Long productId) {
        // Cart integration: retrieve the item, add to cart, then optionally keep/remove from wishlist
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("WishlistItem", productId));
        log.debug("moveToCart: productId={} for userId={}", productId, userId);
    }

    @Override
    @Transactional
    public void moveMultipleToCart(Long userId, List<Long> productIds) {
        productIds.forEach(pid -> moveToCart(userId, pid));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getPurchasedItems(Long userId) {
        return getUserWishlist(userId).stream()
                .filter(dto -> Boolean.TRUE.equals(dto.getPurchased()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getUnpurchasedItems(Long userId) {
        return getUserWishlist(userId).stream()
                .filter(dto -> !Boolean.TRUE.equals(dto.getPurchased()))
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    //  Sharing & social
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public WishlistShareDto shareWishlist(Long userId, WishlistShareRequest request) {
        // Generate a secure share token and persist or return a share record
        String token = UUID.randomUUID().toString().replace("-", "");

        return WishlistShareDto.builder()
                .shareToken(token)
                .shareUrl("/wishlist/shared/" + token)
                .shareName(request.getShareName())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .passwordProtected(request.getPassword() != null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public WishlistSummaryDto getPublicWishlist(String shareToken) {
        // TODO: look up the WishlistShare record by token and return the linked wishlist
        throw new UnsupportedOperationException("getPublicWishlist: not yet implemented");
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getPublicWishlistItems(Long userId) {
        return wishlistRepository.findPublicItemsByUserId(userId)
                .stream().map(wishlistMapper::toDto).toList();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'summary:' + #userId")
    })
    public void updateWishlistPrivacy(Long userId, boolean isPublic) {
        // Bulk update all items for this user
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        items.forEach(i -> i.setIsPublic(isPublic));
        wishlistRepository.saveAll(items);
    }

    // ═══════════════════════════════════════════════════════════════
    //  Bulk operations
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'paginated:'  + #userId"),
            @CacheEvict(key = "'summary:'    + #userId")
    })
    public List<WishlistItemDto> addMultipleToWishlist(Long userId, List<AddToWishlistRequest> requests) {
        return requests.stream()
                .map(req -> addToWishlist(userId, req))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'paginated:'  + #userId"),
            @CacheEvict(key = "'summary:'    + #userId")
    })
    public void removeMultipleFromWishlist(Long userId, List<Long> productIds) {
        int deleted = wishlistRepository.deleteByUserIdAndProductIdIn(userId, productIds);
        log.debug("removeMultipleFromWishlist: deleted {} items for userId={}", deleted, userId);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'paginated:'  + #userId"),
            @CacheEvict(key = "'summary:'    + #userId")
    })
    public void updateMultipleItems(Long userId, Map<Long, UpdateWishlistItemRequest> updates) {
        updates.forEach((productId, req) -> updateWishlistItem(userId, productId, req));
    }

    // ═══════════════════════════════════════════════════════════════
    //  Reminders
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional
    @CacheEvict(key = "#userId")
    public WishlistItemDto setReminder(Long userId, Long productId, WishlistReminderRequest request) {
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("WishlistItem", productId));
        item.setReminderEnabled(true);
        item.setReminderDate(request.getReminderDate());
        item.setNotes(request.getReminderNote() != null ? request.getReminderNote() : item.getNotes());
        return wishlistMapper.toDto(wishlistRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getItemsWithDueReminders(Long userId) {
        return wishlistRepository.findItemsWithDueReminders(userId, LocalDateTime.now())
                .stream().map(wishlistMapper::toDto).toList();
    }

    @Override
    @Transactional
    @CacheEvict(key = "#userId")
    public void cancelReminder(Long userId, Long productId) {
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ResourceNotFoundException.forResource("WishlistItem", productId));
        item.setReminderEnabled(false);
        item.setReminderDate(null);
        wishlistRepository.save(item);
    }

    // ═══════════════════════════════════════════════════════════════
    //  Analytics
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'analytics:' + #userId")
    public WishlistAnalyticsDto getWishlistAnalytics(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long addedThisMonth = wishlistRepository.countItemsAddedSince(userId, startOfMonth);

        long purchased   = items.stream().filter(i -> Boolean.TRUE.equals(i.getPurchased())).count();
        long priceDrops  = items.stream().filter(WishlistItem::isPriceDropped).count();

        OptionalDouble avgDrop = items.stream()
                .filter(WishlistItem::isPriceDropped)
                .mapToDouble(i -> i.getPriceDifference().doubleValue())
                .average();

        double totalSavings = items.stream()
                .mapToDouble(i -> i.getPriceDifference().max(BigDecimal.ZERO).doubleValue())
                .sum();

        // Per-category breakdown from the aggregate query
        List<Object[]> catRows = wishlistRepository.findCategoryAnalyticsByUserId(userId);
        List<WishlistAnalyticsDto.CategoryAnalytics> catBreakdown = catRows.stream()
                .map(row -> WishlistAnalyticsDto.CategoryAnalytics.builder()
                        .categoryName((String) row[0])
                        .itemCount(((Long) row[1]).intValue())
                        .totalValue(row[2] != null ? ((BigDecimal) row[2]).doubleValue() : 0.0)
                        .averagePrice(row[2] != null && ((Long) row[1]) > 0
                                ? ((BigDecimal) row[2]).doubleValue() / ((Long) row[1])
                                : 0.0)
                        .build())
                .toList();

        String mostAddedCategory = catBreakdown.isEmpty() ? null : catBreakdown.get(0).getCategoryName();

        return WishlistAnalyticsDto.builder()
                .userId(userId)
                .totalItems(items.size())
                .itemsAddedThisMonth((int) addedThisMonth)
                .itemsPurchased((int) purchased)
                .itemsWithPriceDrops((int) priceDrops)
                .averagePriceDrop(avgDrop.isPresent() ? avgDrop.getAsDouble() : 0.0)
                .totalSavings(totalSavings)
                .mostAddedCategory(mostAddedCategory)
                .categoryBreakdown(catBreakdown)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PriceHistoryDto> getPriceHistory(Long userId, Long productId) {
        // TODO: implement price history tracking table/service
        return Collections.emptyList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductRecommendationDto> getWishlistRecommendations(Long userId) {
        // TODO: delegate to a recommendation engine using wishlist product IDs
        return Collections.emptyList();
    }

    // ═══════════════════════════════════════════════════════════════
    //  Import / export
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public byte[] exportWishlistToCsv(Long userId) {
        List<WishlistItemDto> items = getUserWishlist(userId);
        StringBuilder sb = new StringBuilder("id,productId,productName,priority,priceWhenAdded,currentPrice,purchased,addedAt\n");
        items.forEach(i -> sb.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s%n",
                i.getId(),
                i.getProduct().getId(),
                escape(i.getProduct().getName()),
                i.getPriority(),
                i.getPriceWhenAdded(),
                i.getCurrentPrice(),
                i.getPurchased(),
                i.getAddedAt())));
        return sb.toString().getBytes();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportWishlistToPdf(Long userId) {
        // TODO: use a PDF library (e.g. iText, JasperReports)
        throw new UnsupportedOperationException("PDF export not yet implemented");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(key = "#userId"),
            @CacheEvict(key = "'summary:' + #userId")
    })
    public void importWishlistFromCsv(Long userId, byte[] csvData) {
        // TODO: parse CSV, validate, and call addToWishlist per row
        throw new UnsupportedOperationException("CSV import not yet implemented");
    }

    // ═══════════════════════════════════════════════════════════════
    //  Comparison & shopping
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public WishlistPriceComparisonDto compareWishlistPrices(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<WishlistPriceComparisonDto.PriceComparisonItem> compItems = items.stream()
                .map(i -> {
                    double orig    = i.getPriceWhenAdded() != null ? i.getPriceWhenAdded().doubleValue() : 0;
                    double current = i.getProduct().getEffectivePrice().doubleValue();
                    double savings = Math.max(0, orig - current);
                    double pct     = orig > 0 ? (savings / orig) * 100 : 0;
                    return WishlistPriceComparisonDto.PriceComparisonItem.builder()
                            .productId(i.getProduct().getId())
                            .productName(i.getProduct().getName())
                            .originalPrice(orig)
                            .currentPrice(current)
                            .savings(savings)
                            .discountPercentage(pct)
                            .bestDeal(false) // will be set below
                            .build();
                })
                .toList();

        // Flag item with the highest saving as best deal
        compItems.stream()
                .max(Comparator.comparingDouble(WishlistPriceComparisonDto.PriceComparisonItem::getSavings))
                .ifPresent(i -> i.setBestDeal(true));

        double totalOrig    = compItems.stream().mapToDouble(WishlistPriceComparisonDto.PriceComparisonItem::getOriginalPrice).sum();
        double totalCurrent = compItems.stream().mapToDouble(WishlistPriceComparisonDto.PriceComparisonItem::getCurrentPrice).sum();
        double totalSavings = Math.max(0, totalOrig - totalCurrent);
        double avgDiscount  = totalOrig > 0 ? (totalSavings / totalOrig) * 100 : 0;

        return WishlistPriceComparisonDto.builder()
                .totalItems(items.size())
                .totalOriginalPrice(totalOrig)
                .totalCurrentPrice(totalCurrent)
                .totalSavings(totalSavings)
                .averageDiscount(avgDiscount)
                .items(compItems)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(key = "'cost:' + #userId")
    public WishlistCostSummaryDto getWishlistCost(Long userId) {
        List<WishlistItem> items = wishlistRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        double subtotal = items.stream()
                .mapToDouble(i -> i.getProduct().getEffectivePrice().doubleValue() * i.getDesiredQuantity())
                .sum();
        double estimatedTax      = subtotal * 0.08; // placeholder 8% tax
        double estimatedShipping = subtotal > 50 ? 0 : 5.99; // free shipping over $50

        Map<WishlistPriority, List<WishlistItem>> byPriority =
                items.stream().collect(Collectors.groupingBy(WishlistItem::getPriority));

        List<WishlistCostSummaryDto.PriorityBreakdown> priorityBreakdown = byPriority.entrySet().stream()
                .map(e -> WishlistCostSummaryDto.PriorityBreakdown.builder()
                        .priority(e.getKey().name())
                        .itemCount(e.getValue().size())
                        .totalCost(e.getValue().stream()
                                .mapToDouble(i -> i.getProduct().getEffectivePrice().doubleValue())
                                .sum())
                        .build())
                .toList();

        long inStock    = items.stream().filter(i -> i.getProduct().isInStock()).count();
        long outOfStock = items.size() - inStock;

        return WishlistCostSummaryDto.builder()
                .totalItems(items.size())
                .subtotal(subtotal)
                .estimatedTax(estimatedTax)
                .estimatedShipping(estimatedShipping)
                .totalCost(subtotal + estimatedTax + estimatedShipping)
                .inStockItems((int) inStock)
                .outOfStockItems((int) outOfStock)
                .byPriority(priorityBreakdown)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> getAvailableItems(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(wishlistMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistItemDto> optimizeWishlist(Long userId, WishlistOptimizationRequest request) {
        List<WishlistItem> candidates = wishlistRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        if (Boolean.TRUE.equals(request.getIncludeOnlyInStock())) {
            candidates = candidates.stream()
                    .filter(i -> i.getProduct().isInStock())
                    .toList();
        }

        // Apply priority ordering from the request
        if (request.getPriorityOrder() != null && !request.getPriorityOrder().isEmpty()) {
            Map<String, Integer> priorityIndex = new HashMap<>();
            for (int idx = 0; idx < request.getPriorityOrder().size(); idx++) {
                priorityIndex.put(request.getPriorityOrder().get(idx), idx);
            }
            candidates = candidates.stream()
                    .sorted(Comparator.comparingInt(i ->
                            priorityIndex.getOrDefault(i.getPriority().name(), Integer.MAX_VALUE)))
                    .toList();
        }

        // Cap at maxItems
        if (request.getMaxItems() != null && candidates.size() > request.getMaxItems()) {
            candidates = candidates.subList(0, request.getMaxItems());
        }

        return candidates.stream().map(wishlistMapper::toDto).toList();
    }

    // ═══════════════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════════════

    private static String escape(String value) {
        if (value == null) return "";
        return value.contains(",") ? "\"" + value + "\"" : value;
    }
}
