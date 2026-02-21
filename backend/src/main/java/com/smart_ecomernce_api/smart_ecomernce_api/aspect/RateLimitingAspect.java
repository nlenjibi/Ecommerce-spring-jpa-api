package com.smart_ecomernce_api.smart_ecomernce_api.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate Limiting Aspect
 * 
 * Monitors and controls the rate of API calls to prevent abuse and ensure
 * fair resource usage across all users.
 * 
 * Features:
 * - Tracks request frequency per endpoint
 * - Monitors suspicious activity patterns
 * - Logs potential abuse attempts
 * - Provides rate limit statistics
 * - Identifies hot endpoints
 * - Detects DDoS-like patterns
 * 
 * Note: This is a monitoring/logging aspect. For actual rate limiting enforcement,
 * use a proper rate limiting library like Bucket4j or Redis-based rate limiting.
 */
@Aspect
@Component
@Slf4j
public class RateLimitingAspect {

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    // Request tracking
    private final Map<String, RequestCounter> requestCounters = new ConcurrentHashMap<>();
    
    // Thresholds for suspicious activity
    private static final int REQUESTS_PER_MINUTE_THRESHOLD = 100;
    private static final int REQUESTS_PER_SECOND_THRESHOLD = 10;

    /**
     * Pointcut for all GraphQL endpoints
     */
    @Pointcut("@annotation(org.springframework.graphql.data.method.annotation.QueryMapping) || " +
              "@annotation(org.springframework.graphql.data.method.annotation.MutationMapping)")
    public void graphqlEndpointsPointcut() {}

    /**
     * Pointcut for all REST controller endpoints
     */
    @Pointcut("@annotation(org.springframework.web.bind.annotation.GetMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.DeleteMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PatchMapping)")
    public void restEndpointsPointcut() {}

    /**
     * Combined pointcut for all API endpoints
     */
    @Pointcut("graphqlEndpointsPointcut() || restEndpointsPointcut()")
    public void apiEndpointsPointcut() {}

    /**
     * Monitor and log API request rates
     */
    @Around("apiEndpointsPointcut()")
    public Object monitorRequestRate(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String endpoint = className + "." + methodName;
        String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);

        // Get or create request counter for this endpoint
        RequestCounter counter = requestCounters.computeIfAbsent(
            endpoint, 
            k -> new RequestCounter()
        );

        // Increment request count
        counter.incrementTotal();
        counter.incrementMinute();
        counter.incrementSecond();

        // Check for suspicious activity
        checkForSuspiciousActivity(endpoint, counter);

        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;

            // Log request details
            logRequest(endpoint, counter, duration, true);

            return result;

        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - startTime;
            
            counter.incrementErrors();
            logRequest(endpoint, counter, duration, false);
            
            throw ex;
        }
    }

    /**
     * Log request with rate information
     */
    private void logRequest(String endpoint, RequestCounter counter, long duration, boolean success) {
        String status = success ? "✅" : "❌";
        
        log.debug("{} API Request: {} | Total: {} | Last min: {} | Last sec: {} | Duration: {} ms",
            status, endpoint, counter.getTotalRequests(), 
            counter.getRequestsLastMinute(), counter.getRequestsLastSecond(), duration);

        // Log if endpoint is getting hot
        if (counter.getRequestsLastMinute() > REQUESTS_PER_MINUTE_THRESHOLD / 2) {
            log.info("🔥 Hot endpoint detected: {} - {} requests/min", 
                endpoint, counter.getRequestsLastMinute());
        }
    }

    /**
     * Check for suspicious activity patterns
     */
    private void checkForSuspiciousActivity(String endpoint, RequestCounter counter) {
        int requestsPerSecond = counter.getRequestsLastSecond();
        int requestsPerMinute = counter.getRequestsLastMinute();

        // Check for burst traffic (potential DDoS)
        if (requestsPerSecond > REQUESTS_PER_SECOND_THRESHOLD) {
            StringBuilder alert = new StringBuilder();
            alert.append("\n╔═══════════════════════════════════════════════════════");
            alert.append("\n║ 🚨 SECURITY ALERT - SUSPICIOUS ACTIVITY DETECTED");
            alert.append("\n╠═══════════════════════════════════════════════════════");
            alert.append("\n║ Endpoint:        ").append(endpoint);
            alert.append("\n║ Requests/sec:    ").append(requestsPerSecond);
            alert.append("\n║ Threshold:       ").append(REQUESTS_PER_SECOND_THRESHOLD);
            alert.append("\n║ Pattern:         BURST TRAFFIC");
            alert.append("\n║ Risk Level:      HIGH");
            alert.append("\n║ Recommendation:  Investigate immediately");
            alert.append("\n╚═══════════════════════════════════════════════════════");
            
            log.error(alert.toString());
        }

        // Check for sustained high traffic
        if (requestsPerMinute > REQUESTS_PER_MINUTE_THRESHOLD) {
            log.warn("⚠️  High traffic detected on {} - {} requests/min (threshold: {})",
                endpoint, requestsPerMinute, REQUESTS_PER_MINUTE_THRESHOLD);
        }

        // Check for high error rate
        if (counter.getTotalRequests() > 10) {
            double errorRate = (double) counter.getErrorCount() / counter.getTotalRequests();
            if (errorRate > 0.5) { // More than 50% errors
                log.error("🚨 High error rate on {} - {:.1f}% errors",
                    endpoint, errorRate * 100);
            }
        }
    }

    /**
     * Get rate limit statistics for all endpoints
     */
    public Map<String, RequestStats> getStatistics() {
        Map<String, RequestStats> stats = new ConcurrentHashMap<>();
        
        requestCounters.forEach((endpoint, counter) -> {
            stats.put(endpoint, new RequestStats(
                counter.getTotalRequests(),
                counter.getRequestsLastMinute(),
                counter.getRequestsLastSecond(),
                counter.getErrorCount()
            ));
        });
        
        return stats;
    }

    /**
     * Reset all counters
     */
    public void resetCounters() {
        requestCounters.clear();
        log.info("Rate limiting counters reset");
    }

    /**
     * Request counter class
     */
    private static class RequestCounter {
        private final AtomicInteger totalRequests = new AtomicInteger(0);
        private final AtomicInteger requestsLastMinute = new AtomicInteger(0);
        private final AtomicInteger requestsLastSecond = new AtomicInteger(0);
        private final AtomicInteger errorCount = new AtomicInteger(0);
        private volatile long lastMinuteReset = System.currentTimeMillis();
        private volatile long lastSecondReset = System.currentTimeMillis();

        public void incrementTotal() {
            totalRequests.incrementAndGet();
        }

        public void incrementMinute() {
            long now = System.currentTimeMillis();
            if (now - lastMinuteReset > 60000) { // 1 minute
                requestsLastMinute.set(0);
                lastMinuteReset = now;
            }
            requestsLastMinute.incrementAndGet();
        }

        public void incrementSecond() {
            long now = System.currentTimeMillis();
            if (now - lastSecondReset > 1000) { // 1 second
                requestsLastSecond.set(0);
                lastSecondReset = now;
            }
            requestsLastSecond.incrementAndGet();
        }

        public void incrementErrors() {
            errorCount.incrementAndGet();
        }

        public int getTotalRequests() {
            return totalRequests.get();
        }

        public int getRequestsLastMinute() {
            return requestsLastMinute.get();
        }

        public int getRequestsLastSecond() {
            return requestsLastSecond.get();
        }

        public int getErrorCount() {
            return errorCount.get();
        }
    }

    /**
     * Request statistics record
     */
    public record RequestStats(
        int totalRequests,
        int requestsLastMinute,
        int requestsLastSecond,
        int errorCount
    ) {}
}
