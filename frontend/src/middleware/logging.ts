import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== Logging Configuration ====================

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const;

const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;

/**
 * Structured logger with different levels
 */
class RequestLogger {
  static log(level: keyof typeof LOG_LEVELS, message: string, metadata: Record<string, any> = {}) {
    if (LOG_LEVELS[level] <= CURRENT_LOG_LEVEL) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        ...metadata,
      };

      // In production, you might send this to a logging service
      if (level === 'ERROR') {
        console.error(JSON.stringify(logEntry));
      } else if (level === 'WARN') {
        console.warn(JSON.stringify(logEntry));
      } else {
        console.log(JSON.stringify(logEntry));
      }
    }
  }
}

/**
 * Generate request fingerprint for tracking
 */
function getRequestFingerprint(request: NextRequest): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const path = request.nextUrl.pathname;

  return Buffer.from(`${ip}:${userAgent}:${path}`).toString('base64').slice(0, 16);
}

/**
 * Calculate response time
 */
function calculateResponseTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Check if path should be logged (avoid logging static assets)
 */
function shouldLogPath(pathname: string): boolean {
  const excludedPaths = [
    '/_next/',
    '/favicon.ico',
    '/api/health',
    '/public/',
  ];

  return !excludedPaths.some(path => pathname.startsWith(path));
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'password',
    'token',
    'authorization',
    'cookie',
    'apiKey',
    'secret',
  ];

  const sanitized = { ...data };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
    if (sanitized.headers?.[field]) {
      sanitized.headers[field] = '***REDACTED***';
    }
  });

  return sanitized;
}

// ==================== Main Middleware ====================

export function loggingMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const fingerprint = getRequestFingerprint(request);
  const { pathname } = request.nextUrl;

  // Skip logging for static files and health checks
  if (!shouldLogPath(pathname)) {
    return NextResponse.next();
  }

  // Log request start
  RequestLogger.log('INFO', 'Request started', {
    fingerprint,
    method: request.method,
    path: pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    userAgent: request.headers.get('user-agent'),
    ip: request.ip || request.headers.get('x-forwarded-for'),
  });

  // Capture response
  const response = NextResponse.next();

  // Log response when complete
  const responseTime = calculateResponseTime(startTime);

  response.headers.set('X-Response-Time', `${responseTime}ms`);
  response.headers.set('X-Request-ID', fingerprint);

  const logMetadata = {
    fingerprint,
    method: request.method,
    path: pathname,
    status: response.status,
    responseTime: `${responseTime}ms`,
    userAgent: request.headers.get('user-agent'),
    ip: request.ip || request.headers.get('x-forwarded-for'),
  };

  if (response.status >= 500) {
    RequestLogger.log('ERROR', 'Request failed', logMetadata);
  } else if (response.status >= 400) {
    RequestLogger.log('WARN', 'Request client error', logMetadata);
  } else {
    RequestLogger.log('INFO', 'Request completed', logMetadata);
  }

  return response;
}

/**
 * Error logging utility for use in API routes
 */
export function logError(error: Error, context: Record<string, any> = {}) {
  RequestLogger.log('ERROR', error.message, {
    ...context,
    stack: error.stack,
    name: error.name,
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
