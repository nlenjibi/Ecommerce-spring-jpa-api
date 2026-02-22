'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAuthToken } from '@/lib/utils/auth';

/**
 * Shopping Cart Hook
 * 
 * Provides cart management with mixed API strategy:
 * - REST for mutations (commands)
 * GraphQL for data fetching (queries)
 */

// Interfaces for cart data
interface CartItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    imageUrl?: string;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  itemCount: number;
  couponCode?: string;
}

interface UseCartReturn {
  cartData: Cart | null;
  isLoading: boolean;
  error: Error | null;
  itemCount: number;
  totalAmount: number;
  isAddingToCart: boolean;
  addToCart: (input: { productId: number; quantity?: number }) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (input: { itemId: number; quantity: number }) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9190/api';

/**
 * Hook for cart operations using mixed API strategy
 */
export function useCart(): UseCartReturn {
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState<string | null>(null);

  // Get auth token
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  // Get cart ID from localStorage
  useEffect(() => {
    if (typeof globalThis.window !== 'undefined') {
      const storedCartId = globalThis.window.localStorage.getItem('cart_id');
      setCartId(storedCartId);
    }
  }, []);

  // GraphQL query for cart details
  const { data: cartData, isLoading, error } = useQuery({
    queryKey: ['cart', cartId],
    queryFn: async () => {
      if (!cartId) return null;

      const response = await fetch(`${API_URL}/v1/carts/${cartId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          localStorage.removeItem('cart_id');
          setCartId(null);
          return null;
        }
        if (response.status === 401) {
          throw new Error('Please login to view your cart');
        }
        throw new Error('Failed to fetch cart');
      }

      return response.json();
    },
    enabled: !!cartId,
    staleTime: 5 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

  // REST mutations for cart operations
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity?: number }) => {
      if (!cartId) {
        throw new Error('No cart found. Please refresh the page.');
      }

      const response = await fetch(`${API_URL}/v1/carts/${cartId}/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId,
          quantity: quantity || 1
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to add items to cart');
        }
        throw new Error('Failed to add to cart');
      }

      const result = await response.json();

      toast.success('Added to cart!');
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', cartId], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      if (!cartId) {
        throw new Error('No cart found');
      }
      const response = await fetch(`${API_URL}/v1/carts/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cartId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to remove items from cart');
        }
        throw new Error('Failed to remove from cart');
      }

      const result = await response.json();

      toast.success('Removed from cart');
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', cartId], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      if (!cartId) {
        throw new Error('No cart found');
      }
      const response = await fetch(`${API_URL}/v1/carts/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cartId,
          itemId,
          quantity,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to update cart');
        }
        throw new Error('Failed to update cart item');
      }

      const result = await response.json();

      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cart', cartId], data);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!cartId) return;

      const response = await fetch(`${API_URL}/v1/carts/${cartId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to clear cart');
        }
        throw new Error('Failed to clear cart');
      }

      const result = await response.json();

      queryClient.invalidateQueries({ queryKey: ['cart'] });

      toast.success('Cart cleared');
      return result;
    },
  });

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!cartId) {
        throw new Error('No cart found');
      }
      const response = await fetch(`${API_URL}/v1/carts/coupon`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cartId, code
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to apply coupon');
        }
        throw new Error('Failed to apply coupon');
      }

      const result = await response.json();

      queryClient.invalidateQueries({ queryKey: ['cart'] });

      toast.success('Coupon applied!');
      return result;
    },
  });

  const removeCouponMutation = useMutation({
    mutationFn: async () => {
      if (!cartId) return;

      const response = await fetch(`${API_URL}/v1/carts/coupon`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cartId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to remove coupon');
        }
        throw new Error('Failed to remove coupon');
      }

      const result = response.json();

      // Invalidate GraphQL cache after mutation
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      toast.success('Coupon removed');
      return result;
    },
  });

  // Wrapper functions
  const addToCart = useCallback(
    async (input: { productId: number; quantity?: number }) => {
      await addToCartMutation.mutateAsync({
        productId: input.productId,
        quantity: input.quantity ?? 1
      });
    },
    [addToCartMutation]
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      await removeFromCartMutation.mutateAsync(itemId);
    },
    [removeFromCartMutation]
  );

  const updateQuantity = useCallback(
    async (input: { itemId, quantity }) => {
      await updateQuantityMutation.mutateAsync(input);
    },
    [updateQuantityMutation]
  );

  const clearCart = useCallback(async () => {
    await clearCartMutation.mutateAsync();
  }, [clearCartMutation]
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      await applyCouponMutation.mutateAsync(code);
    },
    [applyCouponMutation]
  );

  const removeCoupon = useCallback(
    async () => {
      await removeCouponMutation.mutateAsync();
    },
    [removeCouponMutation]
  );

  return {
    cartData,
    isLoading,
    error,
    itemCount: cartData?.itemCount || 0,
    totalAmount: cartData?.totalAmount || 0,
    isAddingToCart: addToCartMutation.isPending,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
  };
}
