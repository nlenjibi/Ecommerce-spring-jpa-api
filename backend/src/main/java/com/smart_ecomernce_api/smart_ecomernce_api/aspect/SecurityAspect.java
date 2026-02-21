package com.smart_ecomernce_api.smart_ecomernce_api.aspect;

import com.smart_ecomernce_api.smart_ecomernce_api.exception.UnauthorizedException;
import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.AnnotationUtils;

import org.springframework.stereotype.Component;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Security aspect for role-based authorization and ownership validation
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityAspect {
    
    @Around("@annotation(com.smart_ecomernce_api.smart_ecomernce_api.security.RequestValidation)")
    public Object validateRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        
        // Extract the annotation
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        RequestValidation annotation = AnnotationUtils.findAnnotation(
                methodSignature.getMethod(),
                RequestValidation.class);
        
        if (annotation == null) {
            log.debug("No @RequestValidation annotation on method: {}", joinPoint.getSignature().getName());
            return joinPoint.proceed();
        }
        
        // Get current user context from request
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        Object userContextObj = attributes.getAttribute("userContext", RequestAttributes.SCOPE_REQUEST);
        
        if (userContextObj == null || !(userContextObj instanceof com.smart_ecomernce_api.smart_ecomernce_api.security.UserContext)) {
            log.warn("No user context found for request validation");
            throw new UnauthorizedException("Authentication required for this endpoint");
        }
        
        com.smart_ecomernce_api.smart_ecomernce_api.security.UserContext userContext =
                (com.smart_ecomernce_api.smart_ecomernce_api.security.UserContext) userContextObj;
        
        if (!userContext.isAuthenticated()) {
            log.warn("Unauthenticated user attempting to access protected resource: {}", 
                     joinPoint.getSignature().getName());
            throw new UnauthorizedException("User not authenticated");
        }
        
        // Check role-based access
        String[] requiredRoles = annotation.roles();
        String userRole = userContext.getRole();
        
        if (requiredRoles.length > 0 && !hasRequiredRole(userRole, requiredRoles)) {
            log.warn("User with role {} attempted to access resource requiring {}: {}", 
                     userRole, java.util.Arrays.toString(requiredRoles));
            throw new UnauthorizedException(
                    "Insufficient permissions. Required roles: " + java.util.Arrays.toString(requiredRoles));
        }
        
        log.debug("Security validation passed for user: {} accessing method: {}", 
                 userRole, joinPoint.getSignature().getName());
        
        // Continue with the request
        Object result = joinPoint.proceed();
        
        // Log successful access
        Object[] args = joinPoint.getArgs();
        if (args != null && args.length > 0) {
            log.info("User {} successfully accessed method {} with {} parameters", 
                     userRole, joinPoint.getSignature().getName(), args.length);
        } else {
            log.info("User {} successfully accessed method {}", userRole, joinPoint.getSignature().getName());
        }
        
        return result;
    }
    
    /**
     * Check if user has any of the required roles
     */
    private boolean hasRequiredRole(String userRole, String[] requiredRoles) {
        for (String requiredRole : requiredRoles) {
            if (userRole.equalsIgnoreCase(requiredRole)) {
                return true;
            }
        }
        return false;
    }
}