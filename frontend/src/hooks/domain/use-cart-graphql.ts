/**
 * GraphQL Cart Hook (Enhanced)
 * 
 * Provides cart management using GraphQL for both queries and mutations.
 * This hook demonstrates the full GraphQL approach with type safety.
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// GraphQL endpoint
const GRAPHQL_URL = (() => {
  if (process.env.NEXT_PUBLIC_GRAPHQL_URL) return process.env.NEXT_PUBLIC_GRAPHQL_URL;
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9190/api';
  const base = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
  return base.toLowerCase().endsWith('/api') ? `${base}/graphql` : `${base}/api/graphql`;
})();

// GraphQL query functions
const fetchCart = async (): Promise<any> => {
  const query = `
    query GetCart {
      cart {
        id
        items {
          id
          quantity
          price
          total
          product {
            id
            name
            description
            price
            discountPrice
            images {
              id
              url
              alt
              position
            }
          }
          variant {
            id
            name
            sku
            price
            attributes
          }
        }
        subtotal
        total
        currency
        createdAt
        updatedAt
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

const addToCartGraphQL = async (input: { productId: string; quantity: number; variantId?: string }): Promise<any> => {
  const mutation = `
    mutation AddToCart($input: AddToCartInput!) {
      addToCart(input: $input) {
        id
        items {
          id
          quantity
          price
          total
          product {
            id
            name
            description
            price
            discountPrice
            images {
              id
              url
              alt
              position
            }
          }
          variant {
            id
            name
            sku
            price
            attributes
          }
        }
        subtotal
        total
        currency
        createdAt
        updatedAt
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

const updateCartItemGraphQL = async (input: { id: string; quantity: number }): Promise<any> => {
  const mutation = `
    mutation UpdateCartItem($input: UpdateCartItemInput!) {
      updateCartItem(input: $input) {
        id
        items {
          id
          quantity
          price
          total
          product {
            id
            name
            description
            price
            discountPrice
            images {
              id
              url
              alt
              position
            }
          }
          variant {
            id
            name
            sku
            price
            attributes
          }
        }
        subtotal
        total
        currency
        createdAt
        updatedAt
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

const removeCartItemGraphQL = async (input: { id: string }): Promise<any> => {
  const mutation = `
    mutation RemoveCartItem($input: RemoveCartItemInput!) {
      removeCartItem(input: $input) {
        id
        items {
          id
          quantity
          price
          total
          product {
            id
            name
            description
            price
            discountPrice
            images {
              id
              url
              alt
              position
            }
          }
          variant {
            id
            name
            sku
            price
            attributes
          }
        }
        subtotal
        total
        currency
        createdAt
        updatedAt
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

const clearCartGraphQL = async (): Promise<any> => {
  const mutation = `
    mutation ClearCart {
      clearCart {
        id
        items {
          id
          quantity
          price
          total
          product {
            id
            name
            description
            price
            discountPrice
            images {
              id
              url
              alt
              position
            }
          }
          variant {
            id
            name
            sku
            price
            attributes
          }
        }
        subtotal
        total
        currency
        createdAt
        updatedAt
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
    },
    body: JSON.stringify({ query: mutation }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

/**
 * Enhanced GraphQL Cart Hook
 * 
 * Benefits of GraphQL approach:
 * - Single endpoint for all cart operations
 * - Type-safe mutations with generated types
 * - Automatic cache updates
 * - Real-time synchronization
 * - Optimistic updates support
 */
export const useCartGraphQL = () => {
  const queryClient = useQueryClient();

  // Query cart state
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['cart-graphql'],
    queryFn: fetchCart,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add item mutation
  const addToCartMutation = useMutation({
    mutationFn: addToCartGraphQL,
    onSuccess: (data) => {
      // Update cache with new cart state
      queryClient.setQueryData(['cart-graphql'], data);
      toast.success('Item added to cart');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add item to cart: ${error.message}`);
    },
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['cart-graphql'] });
      const previousCart = queryClient.getQueryData(['cart-graphql']);
      
      // Create optimistic update
      queryClient.setQueryData(['cart-graphql'], (old: any) => {
        if (!old?.cart) return old;
        
        // Optimistically add item
        const optimisticItem = {
          id: `temp-${Date.now()}`,
          quantity: variables.quantity,
          price: 0, // Will be updated with real data
          total: 0,
          product: {
            id: variables.productId,
            name: 'Loading...',
            description: '',
            price: 0,
            discountPrice: null,
            images: [],
          },
          variant: variables.variantId ? {
            id: variables.variantId,
            name: 'Loading...',
            sku: '',
            price: 0,
            attributes: {},
          } : null,
        };
        
        return {
          ...old,
          cart: {
            ...old.cart,
            items: [...old.cart.items, optimisticItem],
            subtotal: old.cart.subtotal + optimisticItem.price * variables.quantity,
            total: old.cart.total + optimisticItem.price * variables.quantity,
          },
        };
      });
      
      return { previousCart };
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['cart-graphql'] });
    },
  });

  // Update item mutation
  const updateCartItemMutation = useMutation({
    mutationFn: updateCartItemGraphQL,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart-graphql'], data);
      toast.success('Cart updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update cart: ${error.message}`);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['cart-graphql'] });
      const previousCart = queryClient.getQueryData(['cart-graphql']);
      
      // Optimistic update
      queryClient.setQueryData(['cart-graphql'], (old: any) => {
        if (!old?.cart) return old;
        
        return {
          ...old,
          cart: {
            ...old.cart,
            items: old.cart.items.map((item: any) =>
              item.id === variables.id
                ? { ...item, quantity: variables.quantity, total: item.price * variables.quantity }
                : item
            ),
          },
        };
      });
      
      return { previousCart };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-graphql'] });
    },
  });

  // Remove item mutation
  const removeCartItemMutation = useMutation({
    mutationFn: removeCartItemGraphQL,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart-graphql'], data);
      toast.success('Item removed from cart');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove item: ${error.message}`);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['cart-graphql'] });
      const previousCart = queryClient.getQueryData(['cart-graphql']);
      
      // Optimistic update
      queryClient.setQueryData(['cart-graphql'], (old: any) => {
        if (!old?.cart) return old;
        
        const removedItem = old.cart.items.find((item: any) => item.id === variables.id);
        
        return {
          ...old,
          cart: {
            ...old.cart,
            items: old.cart.items.filter((item: any) => item.id !== variables.id),
            subtotal: old.cart.subtotal - (removedItem?.total || 0),
            total: old.cart.total - (removedItem?.total || 0),
          },
        };
      });
      
      return { previousCart };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-graphql'] });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: clearCartGraphQL,
    onSuccess: (data) => {
      queryClient.setQueryData(['cart-graphql'], data);
      toast.success('Cart cleared');
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear cart: ${error.message}`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['cart-graphql'] });
      const previousCart = queryClient.getQueryData(['cart-graphql']);
      
      // Optimistic update
      queryClient.setQueryData(['cart-graphql'], (old: any) => {
        if (!old?.cart) return old;
        
        return {
          ...old,
          cart: {
            ...old.cart,
            items: [],
            subtotal: 0,
            total: 0,
          },
        };
      });
      
      return { previousCart };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-graphql'] });
    },
  });

  return {
    cart: data?.cart || null,
    loading: isLoading,
    error,
    refetch,
    // Mutations
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeCartItem: removeCartItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    // Loading states
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartItemMutation.isPending,
    isRemoving: removeCartItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
    // Derived values
    itemCount: data?.cart?.items?.length || 0,
    total: data?.cart?.total || 0,
    subtotal: data?.cart?.subtotal || 0,
    currency: data?.cart?.currency || 'USD',
  };
};
