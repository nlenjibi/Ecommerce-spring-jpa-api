'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Order Hooks
 * 
 * React Query hooks for fetching and managing customer orders.
 */

interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * useOrders Hook
 * 
 * Fetches a paginated list of orders with optional filtering.
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns React Query result with orders data
 * 
 * @example
 * const { data: orders, isLoading } = useOrders({
 *   page: 1,
 *   limit: 10,
 *   status: 'pending'
 * });
 */
export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getAll(params),
  });
}

/**
 * useOrder Hook
 * 
 * Fetches a single order by its ID.
 * 
 * @param id - The order ID
 * @returns React Query result with order data
 * 
 * @example
 * const { data: order, isLoading } = useOrder(123);
 */
export function useOrder(id: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
}

/**
 * useCreateOrder Hook
 * 
 * Mutation hook for creating a new order.
 * Automatically invalidates order and cart queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const createOrder = useCreateOrder();
 * 
 * const handleCheckout = async () => {
 *   await createOrder.mutateAsync(orderData);
 * };
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Order placed successfully!');
    },
    onError: () => {
      toast.error('Failed to place order');
    },
  });
}
