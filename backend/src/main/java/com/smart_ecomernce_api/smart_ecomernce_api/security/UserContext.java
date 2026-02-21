package com.smart_ecomernce_api.smart_ecomernce_api.security;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Security context holder for authenticated user information
 * Stores user details during the request lifecycle
 */
@Data
public class UserContext {

    /**
     * The authenticated user ID
     */
    private Long userId;

    /**
     * User role for authorization
     */
    private String role;

    /**
     * Authentication token
     */
    private String token;

    /**
     * When the context was created
     */
    private LocalDateTime createdAt;

    /**
     * Whether the authentication is valid
     */
    private boolean authenticated;

    /**
     * Authentication method used
     */
    private String authMethod;

    /**
     * Default constructor creates unauthenticated context
     */
    public UserContext() {
        this.authenticated = false;
    }

    /**
     * Create an authenticated user context
     */
    public static UserContext authenticated(Long userId, String role, String token) {
        UserContext context = new UserContext();
        context.userId = userId;
        context.role = role;
        context.token = token;
        context.authenticated = true;
        context.createdAt = LocalDateTime.now();
        context.authMethod = "TOKEN";
        return context;
    }

    /**
     * Create an unauthenticated context
     */
    public static UserContext unauthenticated() {
        UserContext context = new UserContext();
        context.authenticated = false;
        return context;
    }

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String requiredRole) {
        return this.authenticated &&
                this.role != null &&
                this.role.equalsIgnoreCase(requiredRole);
    }

    /**
     * Check if user has any of the specified roles
     */
    public boolean hasAnyRole(String... roles) {
        if (!this.authenticated || this.role == null) {
            return false;
        }

        for (String role : roles) {
            if (this.role.equalsIgnoreCase(role)) {
                return true;
            }
        }
        return false;
    }
}