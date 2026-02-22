'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';

/**
 * Category Hooks
 * 
 * React Query hooks for fetching and managing product categories.
 */

/**
 * useCategories Hook
 * 
 * Fetches all product categories.
 * 
 * @returns React Query result with categories data
 * 
 * @example
 * const { data: categories, isLoading } = useCategories();
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });
}
