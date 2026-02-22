import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== Route Definitions ====================

const ROUTES = {
  // Public routes that don't require authentication
  PUBLIC: [
    '/',
    '/shop/products',
    '/shop/categories',
    '/marketing/about',
    '/marketing/contact',
    '/marketing/faq',
    '/marketing/help',
    '/shop/deals',
    '/shop/new-arrivals',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ],

  // Routes accessible only to non-authenticated users
  AUTH_ONLY: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ],

  // Routes that require authentication
  PROTECTED: [
    '/dashboard',
    '/dashboard/customer',
    '/dashboard/customer/profile',
    '/dashboard/customer/orders',
    '/shop/checkout',
    '/shop/wishlist',
  ],

  // Role-based routes
  ADMIN: [
    '/dashboard/admin',
    '/dashboard/admin/dashboard',
    '/dashboard/admin/products',
    '/dashboard/admin/orders',
    '/dashboard/admin/users',
  ],

  SELLER: [
    '/dashboard/seller',
    '/dashboard/seller/dashboard',
    '/dashboard/seller/products',
    '/dashboard/seller/orders',
  ],

  CUSTOMER: [
    '/dashboard/customer',
    '/dashboard/customer/profile',
    '/dashboard/customer/orders',
    '/dashboard/customer/wishlist',
  ],

  // Special routes with custom logic
  WISHLIST: '/shop/wishlist',
  CART: '/shop/cart',
} as const;

// ==================== Helper Functions ====================

/**
 * Check if pathname matches any route in the array
 */
function matchesRoute(pathname: string, routes: string[] | string): boolean {
  if (typeof routes === 'string') {
    return pathname.startsWith(routes);
  }
  return routes.some(route => pathname.startsWith(route));
}

/**
 * Extract authentication tokens from request
 */
function getAuthData(request: NextRequest) {
  // Check cookies first (most common)
  const token = request.cookies.get('auth-token')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  const userId = request.cookies.get('user-id')?.value;

  // Fallback to Authorization header for API calls
  const authHeader = request.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  return {
    token: token || headerToken,
    role: userRole,
    userId,
    isAuthenticated: !!(token || headerToken),
  };
}

/**
 * Create redirect response with callback URL
 */
function createRedirect(url: string, request: NextRequest, callbackPath?: string) {
  const redirectUrl = new URL(url, request.url);

  if (callbackPath) {
    redirectUrl.searchParams.set('callbackUrl', encodeURIComponent(callbackPath));
  }

  return NextResponse.redirect(redirectUrl);
}

/**
 * Get appropriate dashboard URL based on user role
 */
function getDashboardUrl(role: string | undefined): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin/dashboard';
    case 'seller':
      return '/dashboard/seller/dashboard';
    case 'customer':
      return '/dashboard/customer';
    default:
      return '/dashboard';
  }
}

/**
 * Check if user has required role for route
 */
function hasRequiredRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;

  // Allow multiple role mappings
  const roleMappings: Record<string, string[]> = {
    admin: ['admin'],
    seller: ['seller', 'admin'],
    customer: ['customer', 'user', 'admin'], // Allow both 'customer' and 'user' roles
    user: ['customer', 'user', 'admin'],
  };

  return requiredRoles.some(requiredRole =>
    roleMappings[requiredRole]?.includes(userRole)
  );
}

// ==================== Route Handlers ====================

function handlePublicRoute(pathname: string, authData: ReturnType<typeof getAuthData>) {
  // Allow access to all public routes
  return NextResponse.next();
}

function handleAuthOnlyRoute(pathname: string, authData: ReturnType<typeof getAuthData>, request: NextRequest) {
  // Redirect to dashboard if already authenticated
  if (authData.isAuthenticated) {
    return createRedirect(getDashboardUrl(authData.role), request);
  }
  return NextResponse.next();
}

function handleProtectedRoute(pathname: string, authData: ReturnType<typeof getAuthData>, request: NextRequest) {
  if (!authData.isAuthenticated) {
    return createRedirect('/auth/login', request, pathname);
  }
  return NextResponse.next();
}

function handleRoleRoute(
  pathname: string,
  authData: ReturnType<typeof getAuthData>,
  requiredRoles: string[],
  request: NextRequest
) {
  if (!authData.isAuthenticated) {
    return createRedirect('/auth/login', request, pathname);
  }

  if (!hasRequiredRole(authData.role, requiredRoles)) {
    return createRedirect('/unauthorized', request);
  }

  return NextResponse.next();
}

function handleWishlistRoute(pathname: string, authData: ReturnType<typeof getAuthData>) {
  // Wishlist is accessible to both authenticated and guest users
  return NextResponse.next();
}

function handleCartRoute(pathname: string, authData: ReturnType<typeof getAuthData>, request: NextRequest) {
  // Cart is accessible to all, but checkout requires authentication
  if (pathname.includes('/checkout') && !authData.isAuthenticated) {
    return createRedirect('/auth/login', request, pathname);
  }
  return NextResponse.next();
}

// ==================== Main Middleware ====================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authData = getAuthData(request);

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Route-specific handling
  if (matchesRoute(pathname, ROUTES.WISHLIST)) {
    return handleWishlistRoute(pathname, authData);
  }

  if (matchesRoute(pathname, ROUTES.CART)) {
    return handleCartRoute(pathname, authData, request);
  }

  if (matchesRoute(pathname, ROUTES.AUTH_ONLY)) {
    return handleAuthOnlyRoute(pathname, authData, request);
  }

  if (matchesRoute(pathname, ROUTES.ADMIN)) {
    return handleRoleRoute(pathname, authData, ['admin'], request);
  }

  if (matchesRoute(pathname, ROUTES.SELLER)) {
    return handleRoleRoute(pathname, authData, ['seller'], request);
  }

  if (matchesRoute(pathname, ROUTES.CUSTOMER)) {
    return handleRoleRoute(pathname, authData, ['customer'], request);
  }

  if (matchesRoute(pathname, ROUTES.PROTECTED)) {
    return handleProtectedRoute(pathname, authData, request);
  }

  // Allow public routes by default
  if (matchesRoute(pathname, ROUTES.PUBLIC)) {
    return handlePublicRoute(pathname, authData);
  }

  // Default: allow access (could be 404 handled by Next.js)
  return NextResponse.next();
}

// ==================== Configuration ====================

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes
     * - Static files
     * - Image optimization
     * - Favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
