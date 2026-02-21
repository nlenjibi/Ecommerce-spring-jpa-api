package com.smart_ecomernce_api.smart_ecomernce_api.security;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory token store for development and testing
 * For production, consider using Redis or database-backed storage
 */
@Component
@Slf4j
public class TokenStore {

    private final Map<String, TokenInfo> tokenStore = new ConcurrentHashMap<>();

    /**
     * Store a token with user information
     */
    public void store(String token, Long userId, String role) {
        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }

        TokenInfo tokenInfo = new TokenInfo(userId, role);
        tokenStore.put(token, tokenInfo);

        log.info("Token stored for user: {} with role: {}", userId, role);
        log.debug("Total active tokens: {}", tokenStore.size());
    }

    /**
     * Retrieve user context from token
     */
    public UserContext getUser(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("Null or empty token provided");
            return UserContext.unauthenticated();
        }

        TokenInfo tokenInfo = tokenStore.get(token);
        if (tokenInfo == null) {
            log.warn("Token not found: {}...", token.substring(0, Math.min(8, token.length())));
            return UserContext.unauthenticated();
        }

        // Check if token is expired (24 hours)
        if (tokenInfo.isExpired()) {
            log.warn("Expired token for user: {}", tokenInfo.getUserId());
            tokenStore.remove(token); // Clean up expired token
            return UserContext.unauthenticated();
        }

        log.debug("Token validated for user: {} with role: {}", tokenInfo.getUserId(), tokenInfo.getRole());
        return UserContext.authenticated(tokenInfo.getUserId(), tokenInfo.getRole(), token);
    }

    /**
     * Check if token exists and is valid
     */
    public boolean isValidToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        TokenInfo tokenInfo = tokenStore.get(token);
        if (tokenInfo == null) {
            return false;
        }

        return !tokenInfo.isExpired();
    }

    /**
     * Remove a token (for logout)
     */
    public void removeToken(String token) {
        if (token != null) {
            TokenInfo removed = tokenStore.remove(token);
            if (removed != null) {
                log.info("Token removed for user: {}", removed.getUserId());
                log.debug("Remaining active tokens: {}", tokenStore.size());
            }
        }
    }

    /**
     * Remove all tokens for a specific user
     */
    public void removeUserTokens(Long userId) {
        int removedCount = 0;
        var iterator = tokenStore.entrySet().iterator();
        while (iterator.hasNext()) {
            var entry = iterator.next();
            if (entry.getValue().getUserId().equals(userId)) {
                iterator.remove();
                removedCount++;
            }
        }
        log.info("{} tokens removed for user: {}", removedCount, userId);
    }

    /**
     * Get all active tokens (for admin purposes)
     */
    public Map<String, TokenInfo> getAllTokens() {
        return new HashMap<>(tokenStore);
    }

    /**
     * Get count of active tokens
     */
    public int getActiveTokenCount() {
        return (int) tokenStore.values().stream()
                .filter(token -> !token.isExpired())
                .count();
    }

    /**
     * Clean expired tokens
     */
    public int cleanExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int initialSize = tokenStore.size();

        // Remove the expired tokens
        tokenStore.entrySet().removeIf(entry ->
                entry.getValue().isExpired()
        );

        int removed = initialSize - tokenStore.size();
        if (removed > 0) {
            log.info("Cleaned {} expired tokens. Remaining: {}", removed, tokenStore.size());
        }

        return removed;
    }

    /**
     * Clear all tokens (for testing)
     */
    public void clearAll() {
        int size = tokenStore.size();
        tokenStore.clear();
        log.info("All {} tokens cleared", size);
    }

    /**
     * Token information holder
     */
    @Data
    public static class TokenInfo {
        private final Long userId;
        private final String role;
        private final LocalDateTime createdAt;
        private final LocalDateTime expiryTime;

        public TokenInfo(Long userId, String role) {
            this.userId = userId;
            this.role = role;
            this.createdAt = LocalDateTime.now();
            this.expiryTime = this.createdAt.plusHours(24); // 24-hour expiry
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryTime);
        }
    }
}
