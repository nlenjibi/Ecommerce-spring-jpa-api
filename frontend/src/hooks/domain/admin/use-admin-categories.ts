'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

/**
 * Admin Category Management Hooks
 * 
 * React Query hooks for CRUD operations on categories in the admin panel.
 */

/**
 * useAdminCategories Hook
 * 
 * Fetches all categories for admin management.
 * 
 * @returns React Query result with categories data
 * 
 * @example
 * const { data: categories, isLoading } = useAdminCategories();
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.getCategories(),
  });
}

/**
 * useCreateCategory Hook
 * 
 * Mutation hook for creating a new category.
 * Invalidates category queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const createCategory = useCreateCategory();
 * 
 * const handleSubmit = async (data: CategoryData) => {
 *   await createCategory.mutateAsync(data);
 * };
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created!');
    },
    onError: () => {
      toast.error('Failed to create category');
    },
  });
}

/**
 * useUpdateCategory Hook
 * 
 * Mutation hook for updating an existing category.
 * Invalidates category queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const updateCategory = useUpdateCategory();
 * 
 * const handleUpdate = async (id: number, data: Partial<Category>) => {
 *   await updateCategory.mutateAsync({ id, data });
 * };
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => 
      adminApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated!');
    },
    onError: () => {
      toast.error('Failed to update category');
    },
  });
}

/**
 * useDeleteCategory Hook
 * 
 * Mutation hook for deleting a category.
 * Invalidates category queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const deleteCategory = useDeleteCategory();
 * 
 * const handleDelete = async (id: number) => {
 *   if (confirm('Delete this category?')) {
 *     await deleteCategory.mutateAsync(id);
 *   }
 * };
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted!');
    },
    onError: () => {
      toast.error('Failed to delete category');
    },
  });
}
