'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

/**
 * Admin Order Management Hooks
 * 
 * React Query hooks for managing orders in the admin panel.
 */

interface AdminOrderParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

/**
 * useAdminOrders Hook
 * 
 * Fetches paginated orders for admin management with filtering.
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns React Query result with orders data
 * 
 * @example
 * const { data, isLoading } = useAdminOrders({
 *   page: 1,
 *   status: 'pending',
 *   search: 'ORD-123'
 * });
 */
export function useAdminOrders(params?: AdminOrderParams) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminApi.getOrders(params),
  });
}

/**
 * useUpdateOrderStatus Hook
 * 
 * Mutation hook for updating an order's status.
 * Invalidates order queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const updateStatus = useUpdateOrderStatus();
 * 
 * const handleStatusChange = async (id: number, status: string) => {
 *   await updateStatus.mutateAsync({ id, status });
 * };
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated!');
    },
    onError: () => {
      toast.error('Failed to update order status');
    },
  });
}

/**
 * useRefundOrder Hook
 * 
 * Mutation hook for processing order refunds.
 * Invalidates order queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const refundOrder = useRefundOrder();
 * 
 * const handleRefund = async (id: number, reason?: string) => {
 *   await refundOrder.mutateAsync({ id, reason });
 * };
 */
export function useRefundOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) => 
      adminApi.refundOrder(id, 0, reason ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order refunded successfully!');
    },
    onError: () => {
      toast.error('Failed to refund order');
    },
  });
}
