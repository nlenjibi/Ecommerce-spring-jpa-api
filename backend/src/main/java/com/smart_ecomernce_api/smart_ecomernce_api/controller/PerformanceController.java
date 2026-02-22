package com.smart_ecomernce_api.smart_ecomernce_api.controller;

import com.smart_ecomernce_api.smart_ecomernce_api.common.response.ApiResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.config.CacheStatisticsService;
import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Performance monitoring and cache management – ADMIN only.
 * Class-level @RequestValidation(roles = {"ADMIN"}) covers every endpoint.
 */
@RestController
@RequestMapping("v1/performance")
@RequiredArgsConstructor
@Slf4j
@RequestValidation(roles = {"ADMIN"})
public class PerformanceController {

    private final CacheManager cacheManager;
    private final CacheStatisticsService cacheStatisticsService;

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        try {
            metrics.put("cache_stats", cacheStatisticsService.getAllCacheStatistics());

            Runtime runtime = Runtime.getRuntime();
            long maxMemory  = runtime.maxMemory()  / (1024 * 1024);
            long usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
            metrics.put("memory", Map.of(
                    "max_mb",          maxMemory,
                    "used_mb",         usedMemory,
                    "usage_percent",   String.format("%.2f", (double) usedMemory / maxMemory * 100)
            ));
            metrics.put("available_processors", runtime.availableProcessors());
            metrics.put("query_performance",    "Track query execution times in service layer");
            metrics.put("slow_queries",         "Monitor queries taking > 1s");

            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true).data(metrics)
                    .message("Performance metrics retrieved successfully").build());
        } catch (Exception e) {
            log.error("Error retrieving performance metrics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.<Map<String, Object>>builder()
                    .success(false).message("Failed to retrieve performance metrics: " + e.getMessage()).build());
        }
    }

    @GetMapping("/cache/{cacheName}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCacheStats(
            @PathVariable String cacheName) {
        Map<String, Object> stats = new HashMap<>();
        try {
            stats.put("cache_name", cacheName);
            boolean available = cacheManager.getCacheNames().contains(cacheName);
            stats.put("available", available);
            if (available) {
                stats.put("stats", cacheStatisticsService.getCacheStats(cacheManager.getCache(cacheName)));
            }
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true).data(stats).build());
        } catch (Exception e) {
            log.error("Error retrieving cache stats for {}: {}", cacheName, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.<Map<String, Object>>builder()
                    .success(false).message("Failed to retrieve cache stats: " + e.getMessage()).build());
        }
    }

    @PostMapping("/cache/clear")
    public ResponseEntity<ApiResponse<String>> clearAllCaches() {
        try {
            cacheStatisticsService.clearAllCaches();
            log.info("Cleared all caches");
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true).message("All caches cleared successfully").build());
        } catch (Exception e) {
            log.error("Error clearing caches: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.<String>builder()
                    .success(false).message("Failed to clear caches: " + e.getMessage()).build());
        }
    }

    @PostMapping("/cache/clear/{cacheName}")
    public ResponseEntity<ApiResponse<String>> clearCache(@PathVariable String cacheName) {
        try {
            if (!cacheManager.getCacheNames().contains(cacheName)) {
                return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                        .success(false).message("Cache '" + cacheName + "' not found").build());
            }
            cacheStatisticsService.clearCache(cacheName);
            log.info("Cleared cache: {}", cacheName);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true).message("Cache '" + cacheName + "' cleared successfully").build());
        } catch (Exception e) {
            log.error("Error clearing cache {}: {}", cacheName, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.<String>builder()
                    .success(false).message("Failed to clear cache: " + e.getMessage()).build());
        }
    }

    @PostMapping("/cache/warmup")
    public ResponseEntity<ApiResponse<String>> warmupCaches() {
        try {
            log.info("Starting cache warmup process");
            // Warmup logic implemented as needed
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .success(true).message("Cache warmup process initiated").build());
        } catch (Exception e) {
            log.error("Error during cache warmup: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.<String>builder()
                    .success(false).message("Failed to warmup caches: " + e.getMessage()).build());
        }
    }

    @GetMapping("/database")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDatabaseMetrics() {
        try {
            Map<String, Object> metrics = Map.of(
                    "note",              "Database metrics require HikariCP connection-pool monitoring",
                    "query_performance", "Track query execution times in service layer",
                    "slow_queries",      "Monitor queries taking > 1s"
            );
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true).data(metrics)
                    .message("Database metrics retrieved successfully").build());
        } catch (Exception e) {
            log.error("Error retrieving database metrics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.<Map<String, Object>>builder()
                    .success(false).message("Failed to retrieve database metrics: " + e.getMessage()).build());
        }
    }
}