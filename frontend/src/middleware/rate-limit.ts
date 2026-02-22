import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== Rate Limit Configuration ====================

const RATE_LIMITS = {
  // Strict limits for authentication endpoints
  AUTH: {
    max: 5,      // 5 requests
    window: 60,  // per 60 seconds
    paths: ['/auth/login', '/auth/register', '/auth/forgot-password'],
  },

  // General API limits
  API: {
    max: 100,    // 100 requests
    window: 60,  // per 60 seconds
    paths: ['/api/'],
  },

  // Public endpoints
  PUBLIC: {
    max: 200,    // 200 requests
    window: 60,  // per 60 seconds
    paths: ['/shop/products', 'search/categories', '/shop/search'],
  },
} as const;

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Generate a unique key for rate limiting based on IP and path
 */
function getRateLimitKey(request: NextRequest, category: keyof typeof RATE_LIMITS): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  return `${category}:${ip}:${request.nextUrl.pathname}`;
}

/**
 * Check if request should be rate limited
 */
function isRateLimited(key: string, max: number, window: number): boolean {
  const now = Date.now();
  const windowMs = window * 1000;

  const limit = rateLimitStore.get(key);

  if (!limit) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (limit.count >= max) {
    return true;
  }

  limit.count++;
  return false;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Add rate limit headers to response
 */
function withRateLimitHeaders(
  response: NextResponse,
  key: string,
  max: number,
  window: number
): NextResponse {
  const limit = rateLimitStore.get(key);
  const remaining = limit ? Math.max(0, max - limit.count) : max;

  response.headers.set('X-RateLimit-Limit', max.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset',
    limit ? Math.ceil(limit.resetTime / 1000).toString() : Math.ceil(Date.now() / 1000).toString()
  );

  return response;
}

// ==================== Main Middleware ====================

export function rateLimitMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip rate limiting for static files and health checks
  if (pathname.startsWith('/_next/') || pathname === '/health') {
    return NextResponse.next();
  }

  // Check each rate limit category
  for (const [category, config] of Object.entries(RATE_LIMITS)) {
    if (config.paths.some(path => pathname.startsWith(path))) {
      const key = getRateLimitKey(request, category as keyof typeof RATE_LIMITS);

      if (isRateLimited(key, config.max, config.window)) {
        const response = NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${config.window} seconds.`
          },
          { status: 429 }
        );

        return withRateLimitHeaders(response, key, config.max, config.window);
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      return withRateLimitHeaders(response, key, config.max, config.window);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
