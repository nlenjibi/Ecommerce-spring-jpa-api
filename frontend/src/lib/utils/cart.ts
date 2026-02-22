/**
 * Optimized Cart Utilities for Guest and Authenticated Users
 * 
 * This module provides utility functions for cart operations that properly
 * handle both guest users and authenticated users using the correct API endpoints.
 */

'use client';

// API Configuration
const _rawApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9190';
const API_BASE_URL = (() => {
  try {
    let u = _rawApiBase.trim();
    if (u.endsWith('/')) u = u.slice(0, -1);
    if (u.toLowerCase().endsWith('/api')) return u;
    return `${u}/api`;
  } catch (e) {
    return 'http://localhost:9190/api';
  }
})();

// Storage Keys
const CART_ID_KEY = 'cart_id';
const USERNAME_KEY = 'username';
const AUTH_TOKEN_KEY = 'auth_token';

// ==================== Types ====================

export interface CartResponse {
  id: number;
  status: string;
  dateCreated: string;
  updatedAt: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  totalPrice: number;
  couponCode?: string;
}

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    stockQuantity?: number;
    inStock?: boolean;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}



const isBrowser = typeof window !== 'undefined';

/**
 * Get stored cart ID from localStorage
 */
export function getCartId(): number | null {
  if (!isBrowser) return null;
  const cartId = localStorage.getItem(CART_ID_KEY);
  return cartId ? parseInt(cartId, 10) : null;
}

/**
 * Save cart ID to localStorage
 */
export function saveCartId(cartId: number): void {
  if (!isBrowser) return;
  localStorage.setItem(CART_ID_KEY, cartId.toString());
  console.log('💾 Saved cart ID:', cartId);
}

/**
 * Clear cart ID from localStorage
 */
export function clearCartId(): void {
  if (!isBrowser) return;
  localStorage.removeItem(CART_ID_KEY);
  console.log('🗑️ Cleared cart ID');
}

/**
 * Get username from localStorage
 */
export function getUsername(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(USERNAME_KEY);
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getUsername();
}

/**
 * Make API call with proper headers and error handling
 */
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'An error occurred' };
    }

    const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  const data = await response.json();

  // Handle wrapped responses
  if (data.success !== undefined && data.data !== undefined) {
    return data.data;
  }

  return data;
}

// ==================== Cart Operations ====================

/**
 * Create a new cart (guest or authenticated)
 */
export async function createCart(): Promise<CartResponse> {
  console.log('🆕 Creating new cart...');
  
  const username = getUsername();
  const endpoint = username
    ? `/v1/carts?username=${encodeURIComponent(username)}`
    : '/v1/carts';

  const cart = await apiCall<CartResponse>(endpoint, { method: 'POST' });
  saveCartId(cart.id);
  
  console.log('✅ Cart created:', cart.id);
  return cart;
}

/**
 * Get cart by ID
 */
export async function getCart(cartId?: number): Promise<CartResponse | null> {
  const targetCartId = cartId || getCartId();

  if (!targetCartId) {
    console.log('📦 No cart ID found');
    return null;
  }

  try {
    console.log('📦 Fetching cart:', targetCartId);
    const cart = await apiCall<CartResponse>(`/v1/carts/${targetCartId}`);
    console.log('✅ Cart retrieved:', cart);
    return cart;
  } catch (error: any) {
    console.warn('⚠️ Failed to get cart:', error);

    if (error.status === 404) {
      console.log('🗑️ Cart not found, clearing invalid ID');
      clearCartId();
    }

    return null;
  }
}

/**
 * Get authenticated user's cart
 */
export async function getUserCart(): Promise<CartResponse | null> {
  const username = getUsername();

  if (!username) {
    console.warn('⚠️ Cannot get user cart: not authenticated');
    return null;
  }

  try {
    console.log('📦 Fetching user cart for:', username);
    const cart = await apiCall<CartResponse>(
      `/v1/carts/me?username=${encodeURIComponent(username)}`
    );
    
    saveCartId(cart.id);
    console.log('✅ User cart retrieved:', cart);
    return cart;
  } catch (error: any) {
    console.warn('⚠️ Failed to get user cart:', error);
    
    // User has no cart yet - will be created when item is added
    if (error.status === 404) {
      console.log('ℹ️ User has no cart yet');
      return null;
    }
    
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  productId: number,
  quantity: number = 1
): Promise<CartResponse> {
  console.log('🛒 Adding to cart:', { productId, quantity });

  let cartId = getCartId();

  // Create cart if it doesn't exist
  if (!cartId) {
    const newCart = await createCart();
    cartId = newCart.id;
  }

  const updatedCart = await apiCall<CartResponse>(`/v1/carts/${cartId}/items`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });

  console.log('✅ Item added to cart');
  return updatedCart;
}

/**
 * Bulk add items to cart
 */
export async function bulkAddToCart(
  items: Array<{ productId: number; quantity: number }>
): Promise<CartResponse> {
  console.log('🛒 Bulk adding to cart:', items);

  let cartId = getCartId();

  if (!cartId) {
    const newCart = await createCart();
    cartId = newCart.id;
  }

  const updatedCart = await apiCall<CartResponse>(
    `/v1/carts/${cartId}/items/bulk`,
    {
      method: 'POST',
      body: JSON.stringify({ items }),
    }
  );

  console.log('✅ Items added to cart');
  return updatedCart;
}

/**
 * Update item quantity
 */
export async function updateCartItem(
  productId: number,
  quantity: number
): Promise<CartResponse> {
  const cartId = getCartId();

  if (!cartId) {
    throw new Error('No cart found');
  }

  console.log('🔄 Updating cart item:', { productId, quantity });

  const updatedCart = await apiCall<CartResponse>(
    `/v1/carts/${cartId}/items/${productId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }
  );

  console.log('✅ Cart item updated');
  return updatedCart;
}

/**
 * Remove item from cart
 */
export async function removeCartItem(productId: number): Promise<CartResponse> {
  const cartId = getCartId();

  if (!cartId) {
    throw new Error('No cart found');
  }

  console.log('🗑️ Removing cart item:', productId);

  const updatedCart = await apiCall<CartResponse>(
    `/v1/carts/${cartId}/items/${productId}`,
    { method: 'DELETE' }
  );

  console.log('✅ Cart item removed');
  return updatedCart;
}

/**
 * Clear entire cart
 */
export async function clearCart(): Promise<void> {
  const cartId = getCartId();

  if (!cartId) {
    return;
  }

  console.log('🗑️ Clearing cart:', cartId);

  await apiCall(`/v1/carts/${cartId}/items`, { method: 'DELETE' });

  console.log('✅ Cart cleared');
}

/**
 * Apply coupon to cart
 */
export async function applyCoupon(couponCode: string): Promise<CartResponse> {
  const cartId = getCartId();

  if (!cartId) {
    throw new Error('No cart found');
  }

  console.log('🎟️ Applying coupon:', couponCode);

  const updatedCart = await apiCall<CartResponse>(`/v1/carts/${cartId}/coupons`, {
    method: 'POST',
    body: JSON.stringify({ couponCode }),
  });

  console.log('✅ Coupon applied');
  return updatedCart;
}

/**
 * Remove coupon from cart
 */
export async function removeCoupon(): Promise<CartResponse> {
  const cartId = getCartId();

  if (!cartId) {
    throw new Error('No cart found');
  }

  console.log('🎟️ Removing coupon');

  const updatedCart = await apiCall<CartResponse>(`/v1/carts/${cartId}/coupons`, {
    method: 'DELETE',
  });

  console.log('✅ Coupon removed');
  return updatedCart;
}

/**
 * Share cart and get share link
 */
export async function shareCart(): Promise<{ shareToken: string; shareUrl: string }> {
  const cartId = getCartId();

  if (!cartId) {
    throw new Error('No cart found');
  }

  console.log('🔗 Sharing cart');

  const response = await apiCall<{ shareToken: string; shareUrl: string }>(
    `/v1/carts/${cartId}/share`,
    { method: 'POST' }
  );

  console.log('✅ Cart shared:', response);
  return response;
}

/**
 * Merge guest cart with user cart (call after login)
 */
export async function mergeGuestCart(guestCartId: number): Promise<CartResponse> {
  const username = getUsername();

  if (!username) {
    throw new Error('User must be authenticated to merge carts');
  }

  console.log('🔀 Merging carts:', { guestCartId, username });

  const mergedCart = await apiCall<CartResponse>(
    `/v1/carts/merge?username=${encodeURIComponent(username)}`,
    {
      method: 'POST',
      body: JSON.stringify({ guestCartId }),
    }
  );

  saveCartId(mergedCart.id);
  console.log('✅ Carts merged');
  return mergedCart;
}

/**
 * Save cart items to wishlist
 */
export async function saveForLater(): Promise<void> {
  const cartId = getCartId();
  const username = getUsername();

  if (!cartId || !username) {
    throw new Error('Authentication required to save for later');
  }

  console.log('💾 Saving cart for later');

  await apiCall(
    `/v1/carts/${cartId}/save-for-later?username=${encodeURIComponent(username)}`,
    { method: 'POST' }
  );

  console.log('✅ Cart saved to wishlist');
}

/**
 * Initialize cart on app startup
 */
export async function initializeCart(): Promise<CartResponse | null> {
  console.log('🚀 Initializing cart...');

  try {
    // If authenticated, try to get user's cart
    if (isAuthenticated()) {
      const userCart = await getUserCart();
      if (userCart) {
        return userCart;
      }
    }

    // Otherwise, check for existing cart ID
    const storedCartId = getCartId();
    if (storedCartId) {
      const cart = await getCart(storedCartId);
      if (cart) {
        return cart;
      }
    }

    // No cart exists yet - will be created when item is added
    console.log('ℹ️ No cart exists yet');
    return null;
  } catch (error) {
    console.error('❌ Failed to initialize cart:', error);
    return null;
  }
}

/**
 * Handle user login - merge carts if needed
 */
export async function handleLoginCartMerge(): Promise<CartResponse | null> {
  const guestCartId = getCartId();

  if (!guestCartId) {
    // No guest cart to merge, just get user cart
    return await getUserCart();
  }

  try {
    // Try to merge guest cart with user cart
    console.log('🔀 Attempting to merge guest cart on login');
    const mergedCart = await mergeGuestCart(guestCartId);
    return mergedCart;
  } catch (error) {
    console.warn('⚠️ Failed to merge carts, getting user cart instead:', error);
    // Fallback: Just get user cart
    return await getUserCart();
  }
}

/**
 * Update cart icon badge with item count
 */
export function updateCartIcon(count: number): void {
  if (!isBrowser) return;

  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.innerText = count.toString();
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

/**
 * Check if user has an existing cart
 */
export function hasExistingCart(): boolean {
  return !!getCartId();
}