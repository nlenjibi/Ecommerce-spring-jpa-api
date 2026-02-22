'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

/**
 * Admin Product Management Hooks
 * 
 * React Query hooks for CRUD operations on products in the admin panel.
 */

interface AdminProductParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * useAdminProducts Hook
 * 
 * Fetches paginated products for admin management with search capability.
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns React Query result with products data
 * 
 * @example
 * const { data, isLoading } = useAdminProducts({
 *   page: 1,
 *   limit: 50,
 *   search: 'laptop'
 * });
 */
export function useAdminProducts(params?: AdminProductParams) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => adminApi.getProducts(params),
  });
}

/**
 * useCreateProduct Hook
 * 
 * Mutation hook for creating a new product.
 * Invalidates product queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const createProduct = useCreateProduct();
 * 
 * const handleSubmit = async (formData: FormData) => {
 *   await createProduct.mutateAsync(formData);
 * };
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });
}

/**
 * useUpdateProduct Hook
 * 
 * Mutation hook for updating an existing product.
 * Invalidates product queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const updateProduct = useUpdateProduct();
 * 
 * const handleUpdate = async (id: number, data: FormData) => {
 *   await updateProduct.mutateAsync({ id, data });
 * };
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => 
      adminApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });
}

/**
 * useDeleteProduct Hook
 * 
 * Mutation hook for deleting a product.
 * Invalidates product queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const deleteProduct = useDeleteProduct();
 * 
 * const handleDelete = async (id: number) => {
 *   if (confirm('Are you sure?')) {
 *     await deleteProduct.mutateAsync(id);
 *   }
 * };
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });
}
