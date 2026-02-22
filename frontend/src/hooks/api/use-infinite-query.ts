'use client';

import {
  useInfiniteQuery as useReactInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult
} from '@tanstack/react-query';

/**
 * Infinite Query Hook
 * 
 * Hook for infinite scrolling and pagination with automatic page management.
 */

interface InfiniteQueryConfig<TData, TError = Error> 
  extends Omit<UseInfiniteQueryOptions<TData, TError>, 'queryKey' | 'queryFn' | 'getNextPageParam'> {
  /** Enable/disable query (default: true) */
  enabled?: boolean;
  /** Stale time in milliseconds (default: 5 minutes) */
  staleTime?: number;
}

interface PageParam {
  page: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * useInfiniteQuery Hook
 * 
 * Infinite scrolling query with automatic page parameter management.
 * 
 * @param queryKey - Base query key
 * @param queryFn - Function that fetches a page of data
 * @param config - Optional configuration
 * @returns Infinite query result
 * 
 * @example
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteQuery(
 *   ['products'],
 *   ({ pageParam = 1 }) => fetchProducts(pageParam, 20)
 * );
 * 
 * <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
 *   Load More
 * </button>
 */
export function useInfiniteQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: (params: { pageParam: number }) => Promise<PaginatedResponse<TData>>,
  config?: InfiniteQueryConfig<PaginatedResponse<TData>, TError>
): UseInfiniteQueryResult<PaginatedResponse<TData>, TError> {
  return useReactInfiniteQuery<PaginatedResponse<TData>, TError>({
    queryKey,
    queryFn: ({ pageParam = 1 }) => queryFn({ pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages, hasMore } = lastPage.pagination;
      return hasMore && page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const { page } = firstPage.pagination;
      return page > 1 ? page - 1 : undefined;
    },
    staleTime: config?.staleTime ?? 5 * 60 * 1000,
    ...config,
  });
}

/**
 * useCursorInfiniteQuery Hook
 * 
 * Infinite query using cursor-based pagination.
 * 
 * @param queryKey - Base query key
 * @param queryFn - Function that fetches data using a cursor
 * @param config - Optional configuration
 * @returns Infinite query result
 * 
 * @example
 * const { data, fetchNextPage } = useCursorInfiniteQuery(
 *   ['messages'],
 *   ({ cursor }) => fetchMessages(cursor)
 * );
 */
export function useCursorInfiniteQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: (params: { cursor?: string }) => Promise<{ data: TData[]; nextCursor?: string }>,
  config?: InfiniteQueryConfig<{ data: TData[]; nextCursor?: string }, TError>
): UseInfiniteQueryResult<{ data: TData[]; nextCursor?: string }, TError> {
  return useReactInfiniteQuery<{ data: TData[]; nextCursor?: string }, TError>({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: config?.staleTime ?? 5 * 60 * 1000,
    ...config,
  });
}

/**
 * useInfiniteScroll Hook
 * 
 * Combines infinite query with intersection observer for automatic loading.
 * 
 * @param queryKey - Base query key
 * @param queryFn - Function that fetches a page of data
 * @param config - Optional configuration
 * @returns Query result with ref for intersection observer
 * 
 * @example
 * const { data, loadMoreRef } = useInfiniteScroll(
 *   ['products'],
 *   ({ pageParam }) => fetchProducts(pageParam)
 * );
 * 
 * <div ref={loadMoreRef}>Loading indicator</div>
 */
export function useInfiniteScroll<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: (params: { pageParam: number }) => Promise<PaginatedResponse<TData>>,
  config?: InfiniteQueryConfig<PaginatedResponse<TData>, TError>
) {
  const query = useInfiniteQuery(queryKey, queryFn, config);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  // Create intersection observer ref
  const loadMoreRef = (node: HTMLElement | null) => {
    if (!node || isFetchingNextPage || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  };

  return {
    ...query,
    loadMoreRef,
  };
}

/**
 * Helper to flatten infinite query pages
 * 
 * @param pages - Pages from infinite query
 * @returns Flattened array of items
 * 
 * @example
 * const { data } = useInfiniteQuery(...);
 * const items = flattenInfiniteData(data?.pages);
 */
export function flattenInfiniteData<T>(
  pages?: PaginatedResponse<T>[]
): T[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}
