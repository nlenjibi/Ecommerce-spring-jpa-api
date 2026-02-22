'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

/**
 * Product Hooks
 * 
 * React Query hooks for fetching and managing product data.
 * These hooks provide automatic caching, background refetching,
 * and optimistic updates for product-related operations.
 */

interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

/**
 * useProducts Hook
 * 
 * Fetches a paginated list of products with optional filtering.
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns React Query result with products data
 * 
 * @example
 * const { data, isLoading, error } = useProducts({
 *   page: 1,
 *   limit: 20,
 *   category: 'electronics',
 *   search: 'laptop'
 * });
 */
export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
  });
}

/**
 * useProduct Hook
 * 
 * Fetches a single product by its slug.
 * 
 * @param slug - The product slug identifier
 * @returns React Query result with product data
 * 
 * @example
 * const { data: product, isLoading } = useProduct('wireless-headphones');
 */
export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * useFeaturedProducts Hook
 * 
 * Fetches the list of featured products.
 * 
 * @returns React Query result with featured products
 * 
 * @example
 * const { data: featured } = useFeaturedProducts();
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getFeatured(),
  });
}
