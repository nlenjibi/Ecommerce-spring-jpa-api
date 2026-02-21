package com.smart_ecomernce_api.smart_ecomernce_api.exception;

/**
 * Base authentication exception
 */
public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
