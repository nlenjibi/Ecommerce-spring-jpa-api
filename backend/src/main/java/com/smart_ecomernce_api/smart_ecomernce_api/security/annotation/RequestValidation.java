package com.smart_ecomernce_api.smart_ecomernce_api.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares the authentication and authorisation policy for a REST endpoint
 * or GraphQL resolver method / class.
 *
 * <h3>Evaluation order (AuthenticationFilter)</h3>
 * <ol>
 *   <li>Method-level annotation wins over class-level annotation.</li>
 *   <li>{@code requireAuth = false} → always allowed, no token required.</li>
 *   <li>{@code requireAuth = true} (default) → valid, authenticated token required.</li>
 *   <li>{@code roles} non-empty → token must also carry one of the listed roles.</li>
 *   <li>No annotation on handler → default policy: authentication required, any role.</li>
 * </ol>
 *
 * <h3>Quick-reference examples</h3>
 * <pre>
 * // Any authenticated user
 * &#64;RequestValidation
 * public ResponseEntity&lt;?&gt; myProfile() { ... }
 *
 * // Admin or manager only
 * &#64;RequestValidation(roles = {"ADMIN", "MANAGER"})
 * public ResponseEntity&lt;?&gt; listAllUsers() { ... }
 *
 * // Public – no token required
 * &#64;RequestValidation(requireAuth = false)
 * public ResponseEntity&lt;?&gt; productCatalogue() { ... }
 *
 * // Class-level default – every method inherits unless a method overrides it
 * &#64;RequestValidation(roles = {"ADMIN"})
 * public class AdminController { ... }
 * </pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequestValidation {

    /**
     * Roles the authenticated principal must hold (at least one).
     * Empty (default) means any authenticated user is permitted.
     * Compared case-sensitively against {@code UserContext#getRole()}.
     */
    String[] roles() default {};

    /**
     * Whether a valid authentication token is required at all.
     * Set {@code false} to mark the endpoint as publicly accessible.
     * Defaults to {@code true}.
     */
    boolean requireAuth() default true;

    /**
     * Optional human-readable note about what this annotation is protecting.
     * No runtime effect – used only for inline documentation.
     */
    String description() default "";
}