'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface CheckoutAuthGateProps {
  children: ReactNode;
}

/**
 * CheckoutAuthGate Component
 * 
 * Ensures user is authenticated before accessing checkout.
 * Redirects unauthenticated users to login page with return URL.
 * 
 * Usage:
 * ```tsx
 * <CheckoutAuthGate>
 *   <CheckoutForm />
 * </CheckoutAuthGate>
 * ```
 */
export default function CheckoutAuthGate({ children }: CheckoutAuthGateProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Redirect to login with return URL
    const returnUrl = '/checkout';
    router.replace(`/auth/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
