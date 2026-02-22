package com.smart_ecomernce_api.smart_ecomernce_api.exception;

public class InvalidDataException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public InvalidDataException(String message) {
        super(message);
    }

    public InvalidDataException(String message, Throwable cause) {
        super(message, cause);
    }
}