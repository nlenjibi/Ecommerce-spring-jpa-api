'use client';

import { 
  useQuery as useReactQuery, 
  UseQueryOptions,
  UseQueryResult 
} from '@tanstack/react-query';

/**
 * API Query Hook
 * 
 * Enhanced wrapper around React Query's useQuery with opinionated defaults.
 * Provides automatic error handling, retry logic, and stale time configuration.
 */

interface QueryConfig<TData, TError = Error> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  /** Enable/disable query execution (default: true) */
  enabled?: boolean;
  /** Stale time in milliseconds (default: 5 minutes) */
  staleTime?: number;
  /** Cache time in milliseconds (default: 10 minutes) */
  cacheTime?: number;
  /** Number of retries on failure (default: 3) */
  retry?: boolean | number;
  /** Whether to refetch on window focus (default: true) */
  refetchOnWindowFocus?: boolean;
}

/**
 * useQuery Hook
 * 
 * Custom query hook with sensible defaults for data fetching.
 * 
 * @param queryKey - Unique key for the query
 * @param queryFn - Async function that fetches the data
 * @param config - Optional configuration overrides
 * @returns React Query result
 * 
 * @example
 * const { data, isLoading, error } = useQuery(
 *   ['users', userId],
 *   () => fetchUser(userId),
 *   { enabled: !!userId }
 * );
 */
export function useQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  config?: QueryConfig<TData, TError>
): UseQueryResult<TData, TError> {
  return useReactQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: config?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    cacheTime: config?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
    retry: config?.retry ?? 3,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? true,
    ...config,
  });
}

/**
 * usePaginatedQuery Hook
 * 
 * Query hook optimized for paginated data with keepPreviousData enabled.
 * 
 * @param queryKey - Unique key including page number
 * @param queryFn - Async function that fetches paginated data
 * @param config - Optional configuration
 * @returns React Query result
 * 
 * @example
 * const { data, isLoading } = usePaginatedQuery(
 *   ['products', { page, limit }],
 *   () => fetchProducts(page, limit)
 * );
 */
export function usePaginatedQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  config?: QueryConfig<TData, TError>
): UseQueryResult<TData, TError> {
  return useReactQuery<TData, TError>({
    queryKey,
    queryFn,
    staleTime: config?.staleTime ?? 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true,
    ...config,
  });
}

/**
 * usePollingQuery Hook
 * 
 * Query hook that automatically refetches at a specified interval.
 * Useful for real-time data that needs periodic updates.
 * 
 * @param queryKey - Unique key for the query
 * @param queryFn - Async function that fetches the data
 * @param interval - Polling interval in milliseconds (default: 5000)
 * @param config - Optional configuration
 * @returns React Query result
 * 
 * @example
 * const { data } = usePollingQuery(
 *   ['order-status', orderId],
 *   () => fetchOrderStatus(orderId),
 *   3000 // Poll every 3 seconds
 * );
 */
export function usePollingQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  interval: number = 5000,
  config?: QueryConfig<TData, TError>
): UseQueryResult<TData, TError> {
  return useReactQuery<TData, TError>({
    queryKey,
    queryFn,
    refetchInterval: interval,
    refetchIntervalInBackground: false,
    ...config,
  });
}
