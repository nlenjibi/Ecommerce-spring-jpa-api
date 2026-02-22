package com.smart_ecomernce_api.smart_ecomernce_api.security;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Authentication Service for managing user authentication and tokens
 * Handles login, logout, token generation and validation
 */
@Service
@RequiredArgsConstructor
@Getter
@Setter
@Slf4j
public class AuthenticationService {

    private final TokenStore tokenStore;

    @Value("${auth.token.expiry.hours:24}")
    private int tokenExpiryHours;

    /**
     * Generate a new UUID-based authentication token
     */
    public String generateToken(Long userId, String role) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be null or empty");
        }

        String token = UUID.randomUUID().toString();
        tokenStore.store(token, userId, role);

        log.info("Token generated for user: {} with role: {}", userId, role);
        return token;
    }

    /**
     * Validate a token and return user context
     */
    public UserContext validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("Null or empty token provided for validation");
            return UserContext.unauthenticated();
        }

        UserContext userContext = tokenStore.getUser(token);

        if (userContext.isAuthenticated()) {
            log.debug("Token validated successfully for user: {}", userContext.getUserId());
        } else {
            log.warn("Token validation failed for token: {}...",
                    token.substring(0, Math.min(8, token.length())));
        }

        return userContext;
    }

    /**
     * Check if a token is valid
     */
    public boolean isTokenValid(String token) {
        return tokenStore.isValidToken(token);
    }

    /**
     * Logout - invalidate a specific token
     */
    public void logout(String token) {
        if (token != null && !token.trim().isEmpty()) {
            tokenStore.removeToken(token);
            log.info("User logged out, token invalidated");
        }
    }

    /**
     * Logout all sessions for a specific user
     */
    public void logoutAllSessions(Long userId) {
        if (userId != null) {
            tokenStore.removeUserTokens(userId);
            log.info("All sessions logged out for user: {}", userId);
        }
    }

    /**
     * Check if user has required role
     */
    public boolean hasRole(UserContext userContext, String... requiredRoles) {
        if (requiredRoles == null || requiredRoles.length == 0) {
            return true; // No role restriction
        }

        if (userContext == null || !userContext.isAuthenticated()) {
            return false;
        }

        return userContext.hasAnyRole(requiredRoles);
    }

    /**
     * Get active token count
     */
    public int getActiveTokenCount() {
        return tokenStore.getActiveTokenCount();
    }

    /**
     * Manually clean expired tokens
     */
    public int cleanExpiredTokens() {
        int cleaned = tokenStore.cleanExpiredTokens();
        log.info("Manually cleaned {} expired tokens", cleaned);
        return cleaned;
    }

    /**
     * Scheduled task to cleanup expired tokens
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void scheduledTokenCleanup() {
        int cleaned = tokenStore.cleanExpiredTokens();
        if (cleaned > 0) {
            log.info("Scheduled cleanup removed {} expired tokens", cleaned);
        }
    }

    /**
     * Refresh a token (generate new token for same user)
     */
    public String refreshToken(String oldToken) {
        UserContext userContext = validateToken(oldToken);

        if (!userContext.isAuthenticated()) {
            throw new IllegalStateException("Cannot refresh invalid or expired token");
        }

        // Generate new token
        String newToken = generateToken(userContext.getUserId(), userContext.getRole());

        // Remove old token
        tokenStore.removeToken(oldToken);

        log.info("Token refreshed for user: {}", userContext.getUserId());
        return newToken;
    }

    /**
     * Get token expiry time
     */
    public LocalDateTime getTokenExpiry(String token) {
        // This would need to be implemented in TokenStore if needed
        log.warn("getTokenExpiry not implemented");
        return LocalDateTime.now().plusHours(tokenExpiryHours);
    }
}
