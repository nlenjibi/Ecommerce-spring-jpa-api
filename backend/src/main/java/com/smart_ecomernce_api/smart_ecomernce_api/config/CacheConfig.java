package com.smart_ecomernce_api.smart_ecomernce_api.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Project-specific Cache Configuration using Caffeine
 */
@Slf4j
@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    // ====== Project-wide cache names ======
    public static final String PRODUCTS_CACHE = "products";
    public static final String CATEGORIES_CACHE = "categories";
    public static final String USERS_CACHE = "users";
    public static final String ORDERS_CACHE = "orders";
    public static final String CARTS_CACHE = "carts";
    public static final String FEATURED_PRODUCTS_CACHE = "featured-products";
    public static final String BESTSELLER_PRODUCTS_CACHE = "bestseller-products";
    public static final String NEW_PRODUCTS_CACHE = "new-products";
    public static final String DISCOUNTED_PRODUCTS_CACHE = "discounted-products";
    public static final String REVIEWS_CACHE = "reviews";
    public static final String WISHLIST_CACHE = "wishlists";
    public static final String DASHBOARD_CACHE = "admin-dashboard";

    @Bean
    @Primary
    @ConditionalOnProperty(name = "spring.cache.type", havingValue = "caffeine", matchIfMissing = true)
    public CacheManager caffeineCacheManager() {
        log.info("Configuring Caffeine cache manager for project");
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(List.of(
                buildCaffeineCache(PRODUCTS_CACHE, 2000, 60),
                buildCaffeineCache(CATEGORIES_CACHE, 500, 180),

                buildCaffeineCache(USERS_CACHE, 1000, 60),
                buildCaffeineCache(ORDERS_CACHE, 2000, 30),
                buildCaffeineCache(CARTS_CACHE, 3000, 15),
                buildCaffeineCache(FEATURED_PRODUCTS_CACHE, 200, 120),
                buildCaffeineCache(BESTSELLER_PRODUCTS_CACHE, 200, 60),
                buildCaffeineCache(NEW_PRODUCTS_CACHE, 200, 60),
                buildCaffeineCache(DISCOUNTED_PRODUCTS_CACHE, 300, 30),
                buildCaffeineCache(REVIEWS_CACHE, 2000, 60),
                buildCaffeineCache(WISHLIST_CACHE, 1000, 60),
                buildCaffeineCache(DASHBOARD_CACHE, 10, 10),
                // ProductServiceImpl cache names
                buildCaffeineCache("products-page", 1000, 60),
                buildCaffeineCache("products-search", 1000, 60),
                buildCaffeineCache("products-category", 1000, 60),
                buildCaffeineCache("products-category-name", 1000, 60),
                buildCaffeineCache("products-price-range", 1000, 60),
                buildCaffeineCache("products-discounted", 1000, 60),
                buildCaffeineCache("products-featured", 1000, 60),
                buildCaffeineCache("products-new", 1000, 60),
                buildCaffeineCache("products-bestseller", 1000, 60),
                buildCaffeineCache("products-top-rated", 1000, 60),
                buildCaffeineCache("products-trending", 1000, 60),
                buildCaffeineCache("products-status", 1000, 60),
                buildCaffeineCache("products-reorder", 1000, 60),
                buildCaffeineCache("products-predicate", 1000, 60),
                buildCaffeineCache("products-filter", 1000, 60),
                // UserServiceImpl cache names
                buildCaffeineCache("users-page", 1000, 60),
                buildCaffeineCache("users-search", 1000, 60),
                buildCaffeineCache("users-role", 1000, 60),
                buildCaffeineCache("users-active", 1000, 60),
                buildCaffeineCache("users-predicate", 1000, 60),
                // ReviewServiceImpl cache names
                buildCaffeineCache("reviews", 2000, 60),
                buildCaffeineCache("review", 1000, 60),
                buildCaffeineCache("reviews-predicate", 1000, 60),
                buildCaffeineCache("review-stats", 1000, 60),
                buildCaffeineCache("rating-distribution", 1000, 60),
                buildCaffeineCache("review-trends", 1000, 60),
                buildCaffeineCache("top-rated-products", 500, 60),
                buildCaffeineCache("most-reviewed-products", 500, 60),
                buildCaffeineCache("user-reviews", 1000, 60),
                buildCaffeineCache("review-lists", 1000, 60),
                buildCaffeineCache("user-review-stats", 1000, 60),
                buildCaffeineCache("review-pros-cons", 1000, 60),
                buildCaffeineCache("admin-reviews", 500, 60),
                buildCaffeineCache("review-validation", 1000, 60),
                buildCaffeineCache("purchase-validation", 1000, 60),
                // OrderServiceImpl cache names
                buildCaffeineCache(ORDERS_CACHE, 2000, 60),
                buildCaffeineCache("order", 1000, 60),
                buildCaffeineCache("orders-predicate", 1000, 60),
                buildCaffeineCache("orders-search", 1000, 60),
                buildCaffeineCache("orders-filter", 1000, 60),
                buildCaffeineCache("order-stats", 1000, 60),
                buildCaffeineCache("user-orders", 1000, 60),
                buildCaffeineCache("order-counts", 1000, 60),

                buildCaffeineCache("categories-list", 1000, 60),
                buildCaffeineCache("categories-paged", 1000, 60),
                buildCaffeineCache("categories-search", 1000, 60),
                buildCaffeineCache("categories-filter", 1000, 60),
                buildCaffeineCache("categories-stats", 1000, 60),
                // WishlistServiceImpl cache names
                buildCaffeineCache("wishlists", 1000, 60),
                buildCaffeineCache("collections", 500, 60),
                buildCaffeineCache("collection", 500, 60),
                buildCaffeineCache("priority", 500, 60),
                buildCaffeineCache("paginated", 1000, 60),
                buildCaffeineCache("summary", 1000, 60),
                buildCaffeineCache("check", 1000, 60),
                buildCaffeineCache("drops", 500, 60),
                buildCaffeineCache("analytics", 500, 60),
                buildCaffeineCache("cost", 500, 60)
        ));
        return cacheManager;
    }

    private Cache buildCaffeineCache(String name, int maxSize, int ttlMinutes) {
        return new CaffeineCache(name, Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
                .recordStats()
                .build());
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.error("Cache GET error in cache '{}' for key '{}': {}", cache.getName(), key, exception.getMessage());
            }
            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.error("Cache PUT error in cache '{}' for key '{}': {}", cache.getName(), key, exception.getMessage());
            }
            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.error("Cache EVICT error in cache '{}' for key '{}': {}", cache.getName(), key, exception.getMessage());
            }
            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.error("Cache CLEAR error in cache '{}': {}", cache.getName(), exception.getMessage());
            }
        };
    }


}
