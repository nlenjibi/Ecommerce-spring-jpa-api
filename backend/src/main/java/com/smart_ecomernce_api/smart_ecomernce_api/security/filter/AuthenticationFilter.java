package com.smart_ecomernce_api.smart_ecomernce_api.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart_ecomernce_api.smart_ecomernce_api.exception.AuthenticationException;
import com.smart_ecomernce_api.smart_ecomernce_api.exception.UnauthorizedException;
import com.smart_ecomernce_api.smart_ecomernce_api.security.TokenStore;
import com.smart_ecomernce_api.smart_ecomernce_api.security.UserContext;
import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Custom Authentication Filter for UUID token-based security.
 *
 * PATH MATCHING RULES (all paths are compared AFTER context-path stripping):
 *
 *   EXACT_PUBLIC_PATHS  – the normalized path must match the entry literally.
 *   PUBLIC_PREFIX_PATHS – the normalized path must start with the entry
 *                         AND either end there or be followed immediately by '/'.
 *                         This prevents "/v1/products/" from matching "/v1/products-admin/…".
 *   GRAPHQL_PATHS       – forwarded to GraphQL handler; token attached if present.
 *   SWAGGER_PATHS       – always allowed; no token required.
 *   Everything else     – evaluated against the @RequestValidation annotation
 *                         found on the matched handler method/class.
 *                         • @RequestValidation(requireAuth = false) → allow
 *                         • @RequestValidation(roles = {"X"})       → must have role X
 *                         • @RequestValidation (no roles)            → any authenticated user
 *                         • No annotation present                    → require authentication
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    private final TokenStore tokenStore;
    private final RequestMappingHandlerMapping handlerMapping;
    private final ObjectMapper objectMapper;

    // -----------------------------------------------------------------------
    // Paths that are always public – matched EXACTLY (no trailing wildcard).
    // -----------------------------------------------------------------------
    private static final List<String> EXACT_PUBLIC_PATHS = List.of(
            "/",
            "/info",
            "/auth/login",
            "/auth/register",
            "/public/health",
            "/social-links",
            "/app-download-links",
            "/v1/social-links",
            "/v1/app-download-links",
            "/v1/users/auth/login",
            "/v1/users/auth/register"
    );

    // -----------------------------------------------------------------------
    // Prefix-based public paths.
    // Rule: normalized path must equal the prefix OR start with prefix + "/".
    // DO NOT add "/" here – that would make every path public.
    // -----------------------------------------------------------------------
    private static final List<String> PUBLIC_PREFIX_PATHS = List.of(
            "/help-support",
            "/help",
            "/public",
            "/v1/products",
            "/v1/categories",
            "/v1/help",
            "/auth",
            "/v1/users/auth"
    );

    // -----------------------------------------------------------------------
    // GraphQL – always let through; security handled inside resolver layer.
    // -----------------------------------------------------------------------
    private static final List<String> GRAPHQL_PATHS = List.of(
            "/graphql",
            "/graphiql"
    );

    // -----------------------------------------------------------------------
    // Swagger / OpenAPI – always public (documentation only).
    // -----------------------------------------------------------------------
    private static final List<String> SWAGGER_PATHS = List.of(
            "/swagger-ui",
            "/v3/api-docs",
            "/webjars/"
    );

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final Set<String> ALLOWED_ORIGINS = Set.of(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:4200",
            "http://localhost:5173",
            "http://localhost:5174"
    );

    // -----------------------------------------------------------------------
    // Main filter entry point
    // -----------------------------------------------------------------------
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws IOException {

        String rawPath = request.getRequestURI();
        String method  = request.getMethod();
        log.debug("Processing request: {} {}", method, rawPath);

        try {
            String path = normalizePath(rawPath);

            // CORS preflight must pass without token; browsers do not send Authorization on OPTIONS.
            if ("OPTIONS".equalsIgnoreCase(method)) {
                log.debug("OPTIONS preflight request - skipping auth: {}", path);
                filterChain.doFilter(request, response);
                return;
            }

            // 1. Always-public paths
            if (isExactPublicPath(path) || isPrefixPublicPath(path)) {
                log.debug("Public path – skipping auth: {}", path);
                filterChain.doFilter(request, response);
                return;
            }

            // 2. GraphQL – attach context if token present; resolver enforces auth
            if (isGraphQLPath(path)) {
                attachContextIfTokenPresent(request);
                passThrough(request, response, filterChain);
                return;
            }

            // 3. Swagger / API docs
            if (isSwaggerPath(path)) {
                log.debug("Swagger path – skipping auth: {}", path);
                filterChain.doFilter(request, response);
                return;
            }

            // 4. Regular REST endpoints
            UserContext userContext = resolveUserContext(request);

            RequestValidation annotation = resolveAnnotation(request);

            if (annotation != null) {
                enforceAnnotationPolicy(userContext, annotation, path);
            } else {
                enforceDefaultPolicy(userContext, path);
            }

            // Security passed – continue
            filterChain.doFilter(request, response);

        } catch (AuthenticationException e) {
            log.warn("Authentication failed [{}]: {}", rawPath, e.getMessage());
            sendErrorResponse(request, response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Authentication required: " + e.getMessage());
        } catch (UnauthorizedException e) {
            log.warn("Authorization failed [{}]: {}", rawPath, e.getMessage());
            sendErrorResponse(request, response, HttpServletResponse.SC_FORBIDDEN,
                    "Access denied: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected filter error [{}]", rawPath, e);
            sendErrorResponse(request, response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    "Internal server error");
        }
    }

    // -----------------------------------------------------------------------
    // Path classification helpers
    // -----------------------------------------------------------------------

    /**
     * Strip the servlet context path (/api) so all comparisons use the
     * application-relative path (e.g. "/v1/products").
     */
    private String normalizePath(String rawPath) {
        // Handle accidental double context-path (e.g. /api/api/…)
        if (rawPath.startsWith("/api/api/")) {
            return rawPath.substring("/api/api".length());
        }
        if (rawPath.startsWith("/api/")) {
            return rawPath.substring("/api".length());
        }
        // Context path not present (e.g. request came in without it)
        return rawPath;
    }

    private boolean isExactPublicPath(String path) {
        return EXACT_PUBLIC_PATHS.contains(path);
    }

    /**
     * Prefix matching that avoids partial-segment false positives.
     * "/v1/products" matches "/v1/products", "/v1/products/", "/v1/products/123"
     * but NOT "/v1/products-admin/…".
     */
    private boolean isPrefixPublicPath(String path) {
        for (String prefix : PUBLIC_PREFIX_PATHS) {
            if (path.equals(prefix) || path.startsWith(prefix + "/")) {
                return true;
            }
        }
        return false;
    }

    private boolean isGraphQLPath(String path) {
        return GRAPHQL_PATHS.stream().anyMatch(path::startsWith);
    }

    private boolean isSwaggerPath(String path) {
        return SWAGGER_PATHS.stream().anyMatch(path::startsWith);
    }

    // -----------------------------------------------------------------------
    // Token / UserContext resolution
    // -----------------------------------------------------------------------

    /**
     * Extract the Bearer token, look it up in the TokenStore, and attach the
     * resulting UserContext to request attributes. Returns null when no valid
     * token is present.
     */
    private UserContext resolveUserContext(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            log.debug("No Bearer token found in request");
            return null;
        }

        UserContext ctx = tokenStore.getUser(token);
        if (ctx != null && ctx.isAuthenticated()) {
            log.debug("Authenticated user: {} role: {}", ctx.getUserId(), ctx.getRole());
            attachUserContext(request, ctx);
            return ctx;
        }

        log.warn("Token present but invalid or expired");
        return null;
    }

    /**
     * Attach token to request without enforcing authentication.
     * Used for GraphQL where per-resolver security applies.
     */
    private void attachContextIfTokenPresent(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) return;

        UserContext ctx = tokenStore.getUser(token);
        if (ctx != null && ctx.isAuthenticated()) {
            log.debug("GraphQL – authenticated user: {} role: {}", ctx.getUserId(), ctx.getRole());
            attachUserContext(request, ctx);
        } else {
            log.warn("GraphQL – invalid or expired token ignored");
        }
    }

    // -----------------------------------------------------------------------
    // Annotation resolution
    // -----------------------------------------------------------------------

    /**
     * Find @RequestValidation on the matched handler method, then (if absent)
     * on the handler class. Returns null when no annotation is found.
     *
     * Method-level annotation takes precedence over class-level annotation.
     */
    private RequestValidation resolveAnnotation(HttpServletRequest request) {
        HandlerMethod handler = resolveHandlerMethod(request);
        if (handler == null) return null;

        // Method-level wins
        RequestValidation ann = AnnotationUtils.findAnnotation(
                handler.getMethod(), RequestValidation.class);
        if (ann != null) return ann;

        // Fall back to class-level
        return AnnotationUtils.findAnnotation(handler.getBeanType(), RequestValidation.class);
    }

    private HandlerMethod resolveHandlerMethod(HttpServletRequest request) {
        try {
            HandlerExecutionChain chain = handlerMapping.getHandler(request);
            if (chain != null && chain.getHandler() instanceof HandlerMethod hm) {
                return hm;
            }
        } catch (Exception e) {
            log.debug("Could not resolve handler method: {}", e.getMessage());
        }
        return null;
    }

    // -----------------------------------------------------------------------
    // Security enforcement
    // -----------------------------------------------------------------------

    /**
     * Enforce the policy declared by a @RequestValidation annotation.
     *
     * Logic:
     *   requireAuth = false → always allow (public endpoint)
     *   requireAuth = true  → must be authenticated
     *   roles not empty     → authenticated AND role must match
     */
    private void enforceAnnotationPolicy(
            UserContext userContext,
            RequestValidation annotation,
            String path) {

        if (!annotation.requireAuth()) {
            log.debug("@RequestValidation(requireAuth=false) – skipping auth for: {}", path);
            return;
        }

        requireAuthenticated(userContext, path);

        String[] requiredRoles = annotation.roles();
        if (requiredRoles.length > 0 && !userContext.hasAnyRole(requiredRoles)) {
            log.warn("User {} lacks required role(s) {} for path: {}",
                    userContext.getUserId(), Arrays.toString(requiredRoles), path);
            throw new UnauthorizedException(
                    "Insufficient permissions. Required roles: " + Arrays.toString(requiredRoles));
        }

        log.debug("Access granted: user={} role={} path={}",
                userContext.getUserId(), userContext.getRole(), path);
    }

    /**
     * Default policy for endpoints with no @RequestValidation annotation:
     * authentication is required, but no specific role is enforced.
     */
    private void enforceDefaultPolicy(UserContext userContext, String path) {
        requireAuthenticated(userContext, path);
        log.debug("Default auth check passed for user {} at {}", userContext.getUserId(), path);
    }

    private void requireAuthenticated(UserContext userContext, String path) {
        if (userContext == null || !userContext.isAuthenticated()) {
            log.warn("Unauthenticated access attempt to protected path: {}", path);
            throw new AuthenticationException("Authentication required for this endpoint");
        }
    }

    // -----------------------------------------------------------------------
    // Utilities
    // -----------------------------------------------------------------------

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length()).trim();
            if (!token.isEmpty()) {
                log.debug("Token extracted (first 8 chars): {}…",
                        token.substring(0, Math.min(8, token.length())));
                return token;
            }
        }
        return null;
    }

    private void attachUserContext(HttpServletRequest request, UserContext ctx) {
        request.setAttribute("userContext", ctx);
        request.setAttribute("userId",      ctx.getUserId());
        request.setAttribute("userRole",    ctx.getRole());
        request.setAttribute("token",       ctx.getToken());
    }

    /** Forward the request/response through the filter chain, wrapping checked ServletException. */
    private void passThrough(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws IOException {
        try {
            chain.doFilter(request, response);
        } catch (ServletException e) {
            throw new RuntimeException("ServletException in filter chain", e);
        }
    }

    private void sendErrorResponse(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            String message)
            throws IOException {

        // Guard: if the response is already committed (e.g., from a downstream filter)
        // we can't write to it again.
        if (response.isCommitted()) {
            log.warn("Response already committed – cannot send error {}: {}", status, message);
            return;
        }

        applyCorsHeaders(request, response);
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new HashMap<>();
        body.put("status",    status);
        body.put("message",   message);
        body.put("timestamp", LocalDateTime.now().toString());

        objectMapper.writeValue(response.getWriter(), body);
    }

    private void applyCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Vary", "Origin");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Origin, X-Requested-With");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        }
    }

    // -----------------------------------------------------------------------
    // Static helpers – used by controllers / resolvers to read request context
    // -----------------------------------------------------------------------

    public static UserContext getUserContext(HttpServletRequest request) {
        Object ctx = request.getAttribute("userContext");
        return ctx instanceof UserContext uc ? uc : null;
    }

    public static Long getCurrentUserId(HttpServletRequest request) {
        UserContext ctx = getUserContext(request);
        return ctx != null ? ctx.getUserId() : null;
    }

    public static String getCurrentUserRole(HttpServletRequest request) {
        UserContext ctx = getUserContext(request);
        return ctx != null ? ctx.getRole() : null;
    }
}
