package com.smart_ecomernce_api.smart_ecomernce_api.exception;

public class RateLimitExceededException extends Throwable {
    public RateLimitExceededException(String message) {
        super(message);
    }
}
