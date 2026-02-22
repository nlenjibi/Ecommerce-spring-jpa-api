package com.smart_ecomernce_api.smart_ecomernce_api.common.performance;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Cache Performance Monitor
 *
 * Monitors cache hit/miss ratios and performance metrics.
 * Tracks cache effectiveness and identifies optimization opportunities.
 */
@Slf4j
@Component
public class CachePerformanceMonitor {

    private final CacheManager cacheManager;

    // Cache statistics
    private final Map<String, CacheStats> statsMap = new ConcurrentHashMap<>();

    public CachePerformanceMonitor(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Record a cache hit
     */
    public void recordHit(String cacheName) {
        getStats(cacheName).recordHit();
    }

    /**
     * Record a cache miss
     */
    public void recordMiss(String cacheName) {
        getStats(cacheName).recordMiss();
    }

    /**
     * Record cache eviction
     */
    public void recordEviction(String cacheName) {
        getStats(cacheName).recordEviction();
    }

    /**
     * Record cache put
     */
    public void recordPut(String cacheName) {
        getStats(cacheName).recordPut();
    }

    /**
     * Get statistics for a cache
     */
    private CacheStats getStats(String cacheName) {
        return statsMap.computeIfAbsent(cacheName, k -> new CacheStats(k));
    }

    /**
     * Get performance report for all caches
     */
    public CachePerformanceReport generateReport() {
        CachePerformanceReport report = new CachePerformanceReport();

        statsMap.forEach((name, stats) -> {
            report.addCacheStats(stats);
        });

        return report;
    }

    /**
     * Get current cache statistics
     */
    public Map<String, CacheStatistics> getCacheStatistics() {
        Map<String, CacheStatistics> result = new HashMap<>();

        cacheManager.getCacheNames().forEach(cacheName -> {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                CacheStats stats = statsMap.get(cacheName);
                if (stats != null) {
                    result.put(cacheName, stats.toStatistics());
                }
            }
        });

        return result;
    }

    /**
     * Reset all statistics
     */
    public void resetStats() {
        statsMap.clear();
        log.info("Cache performance statistics reset");
    }

    /**
     * Log cache summary
     */
    public void logCacheSummary() {
        CachePerformanceReport report = generateReport();

        log.info("=== CACHE PERFORMANCE SUMMARY ===");
        log.info("Total caches monitored: {}", report.getCacheStats().size());

        report.getCacheStats().forEach(stats -> {
            double hitRatio = stats.getHitRatio() * 100;
            String performance = hitRatio > 80 ? "EXCELLENT" : hitRatio > 60 ? "GOOD" : hitRatio > 40 ? "FAIR" : "POOR";

            log.info("Cache '{}': Hit Ratio: {}% ({}), Hits: {}, Misses: {}, Evictions: {}",
                    stats.getCacheName(),
                    String.format("%.2f", hitRatio),
                    performance,
                    stats.getHits(),
                    stats.getMisses(),
                    stats.getEvictions());
        });
    }

    /**
     * Inner class for cache statistics
     */
    public static class CacheStats {
        private final String cacheName;
        private final AtomicLong hits = new AtomicLong(0);
        private final AtomicLong misses = new AtomicLong(0);
        private final AtomicLong evictions = new AtomicLong(0);
        private final AtomicLong puts = new AtomicLong(0);

        public CacheStats(String cacheName) {
            this.cacheName = cacheName;
        }

        public void recordHit() {
            hits.incrementAndGet();
        }

        public void recordMiss() {
            misses.incrementAndGet();
        }

        public void recordEviction() {
            evictions.incrementAndGet();
        }

        public void recordPut() {
            puts.incrementAndGet();
        }

        public String getCacheName() {
            return cacheName;
        }

        public long getHits() {
            return hits.get();
        }

        public long getMisses() {
            return misses.get();
        }

        public long getEvictions() {
            return evictions.get();
        }

        public long getPuts() {
            return puts.get();
        }

        public long getTotalRequests() {
            return hits.get() + misses.get();
        }

        public double getHitRatio() {
            long total = getTotalRequests();
            return total > 0 ? (double) hits.get() / total : 0;
        }

        public CacheStatistics toStatistics() {
            return new CacheStatistics(
                    cacheName,
                    hits.get(),
                    misses.get(),
                    evictions.get(),
                    puts.get(),
                    getHitRatio());
        }
    }

    /**
     * Cache performance report
     */
    public static class CachePerformanceReport {
        private final java.util.List<CacheStats> cacheStats = new java.util.ArrayList<>();

        public void addCacheStats(CacheStats stats) {
            cacheStats.add(stats);
        }

        public java.util.List<CacheStats> getCacheStats() {
            return cacheStats;
        }

        public double getOverallHitRatio() {
            long totalHits = cacheStats.stream().mapToLong(CacheStats::getHits).sum();
            long totalRequests = cacheStats.stream().mapToLong(CacheStats::getTotalRequests).sum();
            return totalRequests > 0 ? (double) totalHits / totalRequests : 0;
        }
    }

    /**
     * Cache statistics record
     */
    public record CacheStatistics(
            String cacheName,
            long hits,
            long misses,
            long evictions,
            long puts,
            double hitRatio) {
    }
}
