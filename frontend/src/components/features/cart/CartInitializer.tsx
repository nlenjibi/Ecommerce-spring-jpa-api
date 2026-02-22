'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { updateCartIcon } from '@/lib/utils/cart';

/**
 * CartInitializer component
 * Initializes cart on app startup and syncs cart icon
 * Now authentication-aware - only loads cart when user is logged in
 * Should be placed inside both AuthProvider and CartProvider
 */
export function CartInitializer() {
  const { cart, itemCount, fetchCart, isAuthenticated, items } = useCart();
  const { isAuthenticated: authIsAuthenticated } = useAuth();
  const hasInitializedRef = useRef(false);
  const lastAuthStateRef = useRef<boolean>(false);

  // Initialize cart when component mounts or auth state changes
  useEffect(() => {
    const initializeCart = async () => {
      // Check if user is authenticated
      const userIsAuthenticated = isAuthenticated || authIsAuthenticated;

      // Track auth state changes
      const authStateChanged = userIsAuthenticated !== lastAuthStateRef.current;
      lastAuthStateRef.current = userIsAuthenticated;

      // Only initialize once on mount or when user logs in
      if (!hasInitializedRef.current && userIsAuthenticated) {
        hasInitializedRef.current = true;

        try {
          console.log('🚀 Initializing cart on app startup...');
          await fetchCart();
          console.log('✅ Cart initialized successfully');
        } catch (error) {
          console.warn('⚠️ Failed to initialize cart on startup:', error);
        }
      }
      // Re-fetch cart when user logs in
      else if (authStateChanged && userIsAuthenticated) {
        try {
          console.log('🔄 User logged in, fetching cart...');
          await fetchCart();
          console.log('✅ Cart fetched after login');
        } catch (error) {
          console.warn('⚠️ Failed to fetch cart after login:', error);
        }
      }
      // Reset initialization flag when user logs out
      else if (authStateChanged && !userIsAuthenticated) {
        console.log('👋 User logged out, resetting cart initialization');
        hasInitializedRef.current = false;
        // Cart will be cleared by the CartContext automatically
      }
    };

    initializeCart();
  }, [fetchCart, isAuthenticated, authIsAuthenticated]);

  // Update cart icon whenever item count changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateCartIcon(items.length);

      // Also update document title if cart has items
      const baseTitle = document.title.split('(')[0].trim();
      if (items.length > 0) {
        document.title = `(${items.length}) ${baseTitle}`;
      } else {
        document.title = baseTitle;
      }
    }
  }, [items]);

  // Log cart state for debugging (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Cart State:', {
        isAuthenticated,
        itemCount,
        cartId: cart?.id,
        hasItems: (cart?.items?.length ?? 0) > 0,
      });
    }
  }, [cart, itemCount, isAuthenticated]);

  return null; // This component doesn't render anything
}