'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { getAuthToken as getAuthTokenUtil, isAuthenticated as isAuthenticatedUtil } from '@/lib/utils/auth';

// ==================== Types ====================

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string | { name: string };
  imageUrl?: string;
  inStock?: boolean;
  stockQuantity?: number;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
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

export interface CartSummary {
  id: number;
  status: string;
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
  discount: number;
  totalPrice: number;
  couponCode?: string;
}

export interface ValidationIssue {
  type: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PRICE_CHANGED' | 'ITEM_UNAVAILABLE';
  productId: number;
  productName: string;
  message: string;
  requestedQuantity?: number;
  availableQuantity?: number;
  oldPrice?: number;
  newPrice?: number;
}

export interface CartValidationResult {
  valid: boolean;
  message: string;
  issues: ValidationIssue[];
  originalTotal: number;
  updatedTotal: number;
  priceChanged: boolean;
  stockChanged: boolean;
}

export interface ShippingOption {
  method: string;
  name: string;
  cost: number;
  minDays: number;
  maxDays: number;
  description: string;
}

export interface ShippingEstimate {
  cost: number;
  currency: string;
  estimatedDays: number;
  method: string;
  availableOptions: ShippingOption[];
}

// ==================== Context Type ====================

interface CartContextType {
  // Cart state
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  total: number;
  subtotal: number;
  discount: number;
  loading: boolean;
  cartId: number | null;
  isAuthenticated: boolean;

  // Cart operations
  fetchCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  addToCart: (productId: number) => Promise<void>;
  isAddingToCart: boolean;
  bulkAddToCart: (items: Array<{ productId: number; quantity: number }>) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // Coupon operations
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;

  // Validation
  validateCart: () => Promise<CartValidationResult | null>;
  validationResult: CartValidationResult | null;

  // Shipping
  estimateShipping: (address: {
    country: string;
    state: string;
    postalCode: string;
    city?: string;
    shippingMethod?: string;
  }) => Promise<ShippingEstimate | null>;
  shippingEstimate: ShippingEstimate | null;

  // Advanced features
  shareCart: () => Promise<string | null>;
  saveForLater: () => Promise<void>;

  // Checkout
  checkout: () => Promise<any>;

  // Summary (lightweight)
  fetchSummary: () => Promise<CartSummary | null>;
}

// ==================== Context ====================

const CartContext = createContext<CartContextType | undefined>(undefined);

// ==================== API Configuration ====================

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

// ==================== Helper Functions ====================

const getUsername = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.email || user.username || null;
    }
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
  }

  return null;
};

// ==================== Provider ====================

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [validationResult, setValidationResult] = useState<CartValidationResult | null>(null);
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(null);

  // Use a stable local copy of authentication state for the cart context
  // This avoids circular dependencies with useAuth()
  const isAuthenticated = useCallback(() => {
    return isAuthenticatedUtil();
  }, []);

  const getStoredCartId = useCallback((): number | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('cartId');
    return stored ? parseInt(stored, 10) : null;
  }, []);

  const storeCartId = useCallback((cartId: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartId', cartId.toString());
    }
  }, []);

  // ==================== API Calls ====================

  const apiCall = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    const token = getAuthTokenUtil();

    if (!token) {
      if (options.method === 'GET' || !options.method) return null;
      throw new Error('Authentication required. Please log in to continue.');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        console.warn('Cart API: Authentication token expired or invalid');
        return null;
      }

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
        throw error;
      }

      const data = await response.json();
      return data.success !== undefined && data.data !== undefined ? data.data : data;
    } catch (error) {
      if (options.method === 'GET' || !options.method) {
        console.error(`Cart API error (${endpoint}):`, error);
        return null;
      }
      throw error;
    }
  }, []);

  // ==================== Operations ====================

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const storedCartId = getStoredCartId();
      if (storedCartId) {
        const cartData = await apiCall(`/v1/carts/${storedCartId}`);
        if (cartData && cartData.id) {
          setCart(cartData);
        } else {
          setCart(null);
        }
      } else {
        setCart(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [apiCall, getStoredCartId, isAuthenticated]);

  const loadCart = fetchCart;

  const initializeCart = useCallback(async () => {
    try {
      if (isAuthenticated()) {
        await fetchCart();
      } else {
        setCart(null);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Failed to initialize cart:', error);
      setLoading(false);
    }
  }, [fetchCart, isAuthenticated]);

  const checkAuthAndShowMessage = useCallback((): boolean => {
    if (!isAuthenticated()) {
      return false;
    }
    return true;
  }, [isAuthenticated]);

  const addToCart = useCallback(
    async (productId: number) => {
      if (!isAuthenticated()) {
        toast.error('Please log in to add items to your cart', {
          duration: 4000,
          icon: '🔒',
        });
        return;
      }

      if (!cart) {
        toast.error('Failed to initialize cart. Please try again.');
        return;
      }

      try {
        setIsAddingToCart(true);
        let currentCart = cart;

        // If no cart, try to create one or use existing if found on server
        if (!currentCart) {
          currentCart = await apiCall('/v1/carts', { method: 'POST' });
          if (currentCart?.id) storeCartId(currentCart.id);
        }

        if (!currentCart?.id) throw new Error('Invalid cart data');

        const existingItem = currentCart.items?.find(
          (item: CartItem) => item.product?.id === productId
        );

        if (existingItem) {
          const newQuantity = (existingItem.quantity || 0) + 1;
          const updatedCart = await apiCall(`/v1/carts/${currentCart.id}/items/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: newQuantity }),
          });
          setCart(updatedCart || currentCart);
          toast.success('Item quantity updated');
        } else {
          const updatedCart = await apiCall(`/v1/carts/${currentCart.id}/items`, {
            method: 'POST',
            body: JSON.stringify({ productId }),
          });
          setCart(updatedCart || currentCart);
          toast.success('Item added to cart');
        }
        await fetchCart();
      } catch (error: any) {
        toast.error(error.message || 'Failed to add item');
      } finally {
        setIsAddingToCart(false);
      }
    },
    [cart, checkAuthAndShowMessage, apiCall, fetchCart, storeCartId]
  );

  const bulkAddToCart = useCallback(
    async (items: Array<{ productId: number; quantity: number }>) => {
      if (!checkAuthAndShowMessage()) return;
      try {
        setLoading(true);
        let currentCart = cart || await apiCall('/v1/carts', { method: 'POST' });
        if (currentCart?.id) storeCartId(currentCart.id);

        const updatedCart = await apiCall(`/v1/carts/${currentCart.id}/items/bulk`, {
          method: 'POST',
          body: JSON.stringify({ items }),
        });
        setCart(updatedCart || currentCart);
        toast.success(`${items.length} items added`);
        await fetchCart();
      } catch (error: any) {
        toast.error('Failed to add items');
      } finally {
        setLoading(false);
      }
    },
    [cart, checkAuthAndShowMessage, apiCall, fetchCart, storeCartId]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!checkAuthAndShowMessage() || !cart) return;
      try {
        const updatedCart = await apiCall(`/v1/carts/${cart.id}/items/${productId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity }),
        });
        setCart(updatedCart || cart);
        await fetchCart();
      } catch (error: any) {
        toast.error('Failed to update quantity');
      }
    },
    [cart, checkAuthAndShowMessage, apiCall, fetchCart]
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      if (!checkAuthAndShowMessage() || !cart) return;
      try {
        await apiCall(`/v1/carts/${cart.id}/items/${productId}`, {
          method: 'DELETE',
        });
        toast.success('Item removed');
        await fetchCart();
      } catch (error: any) {
        toast.error('Failed to remove item');
      }
    },
    [cart, checkAuthAndShowMessage, apiCall, fetchCart]
  );

  const clearCart = useCallback(async () => {
    if (!checkAuthAndShowMessage() || !cart) return;
    try {
      setLoading(true);
      await apiCall(`/v1/carts/${cart.id}/items`, { method: 'DELETE' });
      toast.success('Cart cleared');
      await fetchCart();
    } catch (error: any) {
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  }, [cart, checkAuthAndShowMessage, apiCall, fetchCart]);

  const applyCoupon = useCallback(
    async (couponCode: string) => {
      if (!checkAuthAndShowMessage() || !cart) return;
      try {
        setLoading(true);
        const updatedCart = await apiCall(`/v1/carts/${cart.id}/coupons`, {
          method: 'POST',
          body: JSON.stringify({ couponCode }),
        });
        setCart(updatedCart);
        toast.success('Coupon applied!');
      } catch (error: any) {
        toast.error(error.message || 'Invalid coupon');
      } finally {
        setLoading(false);
      }
    },
    [cart, checkAuthAndShowMessage, apiCall]
  );

  const removeCoupon = useCallback(async () => {
    if (!checkAuthAndShowMessage() || !cart) return;
    try {
      setLoading(true);
      const updatedCart = await apiCall(`/v1/carts/${cart.id}/coupons`, { method: 'DELETE' });
      setCart(updatedCart);
      toast.success('Coupon removed');
    } catch (error: any) {
      toast.error('Failed to remove coupon');
    } finally {
      setLoading(false);
    }
  }, [cart, checkAuthAndShowMessage, apiCall]);

  const validateCart = useCallback(async () => {
    if (!cart) return null;
    try {
      const result = await apiCall(`/v1/carts/${cart.id}/validate`, { method: 'POST' });
      setValidationResult(result);
      if (!result.valid) toast.error(`Cart has ${result.issues.length} issue(s)`);
      return result;
    } catch (error: any) {
      toast.error('Failed to validate cart');
      return null;
    }
  }, [cart, apiCall]);

  const estimateShipping = useCallback(
    async (address: any) => {
      if (!cart) return null;
      try {
        const estimate = await apiCall(`/v1/carts/${cart.id}/estimate-shipping`, {
          method: 'POST',
          body: JSON.stringify(address),
        });
        setShippingEstimate(estimate);
        return estimate;
      } catch (error: any) {
        toast.error('Failed to estimate shipping');
        return null;
      }
    },
    [cart, apiCall]
  );

  const shareCart = useCallback(async () => {
    if (!checkAuthAndShowMessage() || !cart) return null;
    try {
      const response = await apiCall(`/v1/carts/${cart.id}/share`, { method: 'POST' });
      const shareUrl = `${window.location.origin}/cart/shared/${response.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
      return shareUrl;
    } catch (error: any) {
      toast.error('Failed to share cart');
      return null;
    }
  }, [cart, checkAuthAndShowMessage, apiCall]);

  const saveForLater = useCallback(async () => {
    if (!checkAuthAndShowMessage() || !cart) return;
    try {
      setLoading(true);
      const username = getUsername();
      await apiCall(`/v1/carts/${cart.id}/save-for-later?username=${encodeURIComponent(username!)}`, {
        method: 'POST',
      });
      toast.success('Saved to wishlist');
      await fetchCart();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }, [cart, checkAuthAndShowMessage, apiCall, fetchCart]);

  const fetchSummary = useCallback(async () => {
    if (!cart) return null;
    try {
      return await apiCall(`/v1/carts/${cart.id}/summary`);
    } catch (error: any) {
      return null;
    }
  }, [cart, apiCall]);

  const checkout = useCallback(async () => {
    if (!checkAuthAndShowMessage()) throw new Error('Auth required');
    try {
      setLoading(true);
      const validation = await validateCart();
      if (!validation?.valid) throw new Error('Resolve cart issues first');
      return await apiCall(`/v1/carts/${cart!.id}/checkout`, { method: 'POST' });
    } finally {
      setLoading(false);
    }
  }, [cart, checkAuthAndShowMessage, apiCall, validateCart]);

  // Initial load
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  const contextValue = useMemo(() => ({
    cart,
    items: cart?.items || [],
    itemCount: cart?.itemCount || 0,
    total: cart?.totalPrice || 0,
    subtotal: cart?.subtotal || 0,
    discount: cart?.discount || 0,
    loading,
    cartId: cart?.id || null,
    isAuthenticated: isAuthenticated(),
    fetchCart,
    loadCart,
    addToCart,
    isAddingToCart,
    bulkAddToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    validateCart,
    validationResult,
    estimateShipping,
    shippingEstimate,
    shareCart,
    saveForLater,
    checkout,
    fetchSummary,
  }), [
    cart, loading, isAuthenticated, fetchCart, addToCart, isAddingToCart,
    bulkAddToCart, updateQuantity, removeFromCart, clearCart,
    applyCoupon, removeCoupon, validateCart, validationResult,
    estimateShipping, shippingEstimate, shareCart, saveForLater, checkout, fetchSummary
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}