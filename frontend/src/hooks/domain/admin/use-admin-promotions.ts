'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

/**
 * Admin Promotion Management Hooks
 * 
 * React Query hooks for CRUD operations on promotions/discounts in the admin panel.
 */

/**
 * useAdminPromotions Hook
 * 
 * Fetches all promotions for admin management.
 * 
 * @returns React Query result with promotions data
 * 
 * @example
 * const { data: promotions, isLoading } = useAdminPromotions();
 */
export function useAdminPromotions() {
  return useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: () => adminApi.getPromotions(),
  });
}

/**
 * useCreatePromotion Hook
 * 
 * Mutation hook for creating a new promotion.
 * Invalidates promotion queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const createPromotion = useCreatePromotion();
 * 
 * const handleSubmit = async (data: PromotionData) => {
 *   await createPromotion.mutateAsync(data);
 * };
 */
export function useCreatePromotion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success('Promotion created!');
    },
    onError: () => {
      toast.error('Failed to create promotion');
    },
  });
}

/**
 * useUpdatePromotion Hook
 * 
 * Mutation hook for updating an existing promotion.
 * Invalidates promotion queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const updatePromotion = useUpdatePromotion();
 * 
 * const handleUpdate = async (id: number, data: Partial<Promotion>) => {
 *   await updatePromotion.mutateAsync({ id, data });
 * };
 */
export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => 
      adminApi.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success('Promotion updated!');
    },
    onError: () => {
      toast.error('Failed to update promotion');
    },
  });
}

/**
 * useDeletePromotion Hook
 * 
 * Mutation hook for deleting a promotion.
 * Invalidates promotion queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const deletePromotion = useDeletePromotion();
 * 
 * const handleDelete = async (id: number) => {
 *   if (confirm('Delete this promotion?')) {
 *     await deletePromotion.mutateAsync(id);
 *   }
 * };
 */
export function useDeletePromotion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
      toast.success('Promotion deleted!');
    },
    onError: () => {
      toast.error('Failed to delete promotion');
    },
  });
}
