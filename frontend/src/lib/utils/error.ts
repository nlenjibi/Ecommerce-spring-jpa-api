/**
 * Error Handling Utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fieldErrors: Record<string, string> = {},
    public details?: any
  ) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'ServerError';
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timed out') {
    super(message, 'TIMEOUT_ERROR', 408);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

// Error type guard
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isAuthorizationError = (error: unknown): error is AuthorizationError => {
  return error instanceof AuthorizationError;
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

// Error handler
export const handleError = (error: unknown): { message: string; code?: string; status?: number; details?: any } => {
  console.error('Error handled:', error);

  if (isAppError(error)) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500,
  };
};

// Error boundary helper
export const getErrorDisplayMessage = (error: unknown): string => {
  const handled = handleError(error);

  // User-friendly messages
  const messageMap: Record<string, string> = {
    'NETWORK_ERROR': 'Please check your internet connection and try again.',
    'AUTHENTICATION_ERROR': 'Please log in to continue.',
    'AUTHORIZATION_ERROR': "You don't have permission to perform this action.",
    'NOT_FOUND': 'The requested resource was not found.',
    'RATE_LIMIT_ERROR': 'Too many requests. Please try again later.',
    'TIMEOUT_ERROR': 'The request took too long. Please try again.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
  };

  const baseMessage = handled.message;
  const friendlyMessage = messageMap[handled.code || ''] || baseMessage;

  return friendlyMessage;
};

// Error logging
export const logError = (error: unknown, context?: string): void => {
  const timestamp = new Date().toISOString();
  const errorInfo = handleError(error);

  console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
  console.error('Timestamp:', timestamp);
  console.error('Message:', errorInfo.message);
  console.error('Code:', errorInfo.code);
  console.error('Status:', errorInfo.status);
  console.error('Details:', errorInfo.details);

  if (error instanceof Error && error.stack) {
    console.error('Stack:', error.stack);
  }
  console.groupEnd();

  // In production, you would send this to an error tracking service
  // Sentry.captureException(error, { extra: { context, ...errorInfo } });
};

// Error recovery strategies
export const shouldRetry = (error: unknown): boolean => {
  if (isNetworkError(error) || isTimeoutError(error) || isServerError(error)) {
    return true;
  }

  if (isRateLimitError(error)) {
    // Only retry if retryAfter is reasonable
    return error.retryAfter !== undefined && error.retryAfter < 300; // 5 minutes max
  }

  return false;
};

export const getRetryDelay = (error: unknown, attempt: number): number => {
  if (isRateLimitError(error) && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to milliseconds
  }

  // Exponential backoff with jitter
  const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
  const jitter = Math.random() * 1000; // Add up to 1 second jitter
  return baseDelay + jitter;
};

// Error boundary props
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export const getErrorBoundaryState = (error: Error, errorInfo: any): ErrorBoundaryState => {
  return {
    hasError: true,
    error,
    errorInfo,
  };
};

// Default export
export default {
  // Error Classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  NetworkError,
  ServerError,
  TimeoutError,
  RateLimitError,

  // Type Guards
  isAppError,
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isNetworkError,

  // Handlers
  handleError,
  getErrorDisplayMessage,
  logError,

  // Recovery
  shouldRetry,
  getRetryDelay,

  // Boundary
  getErrorBoundaryState,
};
