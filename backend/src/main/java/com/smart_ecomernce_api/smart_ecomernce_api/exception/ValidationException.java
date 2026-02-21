package com.smart_ecomernce_api.smart_ecomernce_api.exception;

import java.util.HashMap;
import java.util.Map;

public class ValidationException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final Map<String, String> errors = new HashMap<>();

    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors.putAll(errors);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}