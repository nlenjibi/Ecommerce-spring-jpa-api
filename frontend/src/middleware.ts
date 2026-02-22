import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==================== Helpers ====================

function getAuthData(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const userRole = request.cookies.get('user-role')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    return {
        token: token || headerToken,
        role: userRole,
        isAuthenticated: !!(token || headerToken),
    };
}

function getDashboardUrl(role: string | undefined): string {
    if (role === 'admin') return '/dashboard/admin/dashboard';
    if (role === 'seller') return '/dashboard/seller/dashboard';
    return '/dashboard/customer';
}

function loginRedirect(request: NextRequest, pathname: string) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
}

function unauthorizedRedirect(request: NextRequest) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
}

// ==================== Route Guards ====================

function handleAuthOnlyRoute(request: NextRequest, isAuthenticated: boolean, role: string | undefined) {
    if (isAuthenticated) {
        return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
    }
    return NextResponse.next();
}

function handleAdminRoute(request: NextRequest, pathname: string, isAuthenticated: boolean, role: string | undefined) {
    if (!isAuthenticated) return loginRedirect(request, pathname);
    if (role !== 'admin') return unauthorizedRedirect(request);
    return NextResponse.next();
}

function handleSellerRoute(request: NextRequest, pathname: string, isAuthenticated: boolean, role: string | undefined) {
    if (!isAuthenticated) return loginRedirect(request, pathname);
    if (role !== 'seller' && role !== 'admin') return unauthorizedRedirect(request);
    return NextResponse.next();
}

function handleProtectedRoute(request: NextRequest, pathname: string, isAuthenticated: boolean) {
    if (!isAuthenticated) return loginRedirect(request, pathname);
    return NextResponse.next();
}

// ==================== Main Middleware ====================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const { isAuthenticated, role } = getAuthData(request);

    // Auth-only routes (login, register, forgot-password)
    if (
        pathname.startsWith('/auth/login') ||
        pathname.startsWith('/auth/register') ||
        pathname.startsWith('/auth/forgot-password')
    ) {
        return handleAuthOnlyRoute(request, isAuthenticated, role);
    }

    // Admin dashboard
    if (pathname.startsWith('/dashboard/admin')) {
        return handleAdminRoute(request, pathname, isAuthenticated, role);
    }

    // Seller dashboard
    if (pathname.startsWith('/dashboard/seller')) {
        return handleSellerRoute(request, pathname, isAuthenticated, role);
    }

    // Customer dashboard + checkout
    if (pathname.startsWith('/dashboard/customer') || pathname.startsWith('/shop/checkout')) {
        return handleProtectedRoute(request, pathname, isAuthenticated);
    }

    // Generic /dashboard root — redirect to role-specific page
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
        if (!isAuthenticated) return loginRedirect(request, pathname);
        return NextResponse.redirect(new URL(getDashboardUrl(role), request.url));
    }

    return NextResponse.next();
}

// ==================== Matcher Config ====================

export const config = {
    matcher: [
        /**
         * Only match routes that genuinely need protection logic.
         * Keeping this list narrow means the Edge function runs as
         * infrequently as possible, minimising per-request overhead.
         */
        '/dashboard/:path*',
        '/shop/checkout/:path*',
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
    ],
};
