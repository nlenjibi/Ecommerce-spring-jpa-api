/**
 * React Query Configuration for API Caching
 */

import { QueryClient } from '@tanstack/react-query';

// Default query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }

        // Retry up to 3 times for server errors
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      onError: (error: any) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query key factories for consistent cache keys
export const queryKeys = {
  // Auth
  auth: {
    profile: ['auth', 'profile'],
    activities: ['auth', 'activities'],
    addresses: ['auth', 'addresses'],
  },

  // Products
  products: {
    all: ['products'],
    lists: () => [...queryKeys.products.all, 'list'],
    details: () => [...queryKeys.products.all, 'detail'],
    detail: (id: number) => [...queryKeys.products.details(), id],
    featured: ['products', 'featured'],
    trending: ['products', 'trending'],
    search: (query: string) => ['products', 'search', query],
    category: (categoryId: number) => ['products', 'category', categoryId],
  },

  // Categories
  categories: {
    all: ['categories'],
    tree: ['categories', 'tree'],
    detail: (id: number) => ['categories', 'detail', id],
    products: (categoryId: number) => ['categories', 'products', categoryId],
  },

  // Cart
  cart: {
    current: ['cart'],
    items: ['cart', 'items'],
    validation: ['cart', 'validation'],
  },

  // Orders
  orders: {
    all: ['orders'],
    lists: () => [...queryKeys.orders.all, 'list'],
    details: () => [...queryKeys.orders.all, 'detail'],
    detail: (id: number) => [...queryKeys.orders.details(), id],
    tracking: (id: number) => ['orders', 'tracking', id],
  },

  // Reviews
  reviews: {
    all: ['reviews'],
    product: (productId: number) => ['reviews', 'product', productId],
    user: (userId: number) => ['reviews', 'user', userId],
    stats: (productId: number) => ['reviews', 'stats', productId],
  },

  // Wishlist
  wishlist: {
    current: ['wishlist'],
    summary: ['wishlist', 'summary'],
    analytics: ['wishlist', 'analytics'],
    priceHistory: ['wishlist', 'price-history'],
  },

  // Seller
  seller: {
    dashboard: ['seller', 'dashboard'],
    products: ['seller', 'products'],
    orders: ['seller', 'orders'],
    analytics: ['seller', 'analytics'],
    inventory: ['seller', 'inventory'],
    payouts: ['seller', 'payouts'],
    reviews: ['seller', 'reviews'],
    store: ['seller', 'store'],
  },
};

// Prefetch configuration
export const prefetchConfig = {
  // Prefetch these queries on app startup
  initialQueries: [
    queryKeys.categories.all,
    queryKeys.products.featured,
    queryKeys.auth.profile,
  ],

  // Prefetch on route navigation
  routePrefetch: {
    '/products': [queryKeys.products.all],
    '/cart': [queryKeys.cart.current],
    '/orders': [queryKeys.orders.all],
    '/wishlist': [queryKeys.wishlist.current],
    '/seller': [queryKeys.seller.dashboard],
  },
};

// Cache utilities
export const cacheUtils = {
  // Invalidate related queries when data changes
  invalidateProductQueries: (productId?: number) => {
    const invalidations = [queryKeys.products.all];

    if (productId) {
      invalidations.push(queryKeys.products.detail(productId));
      invalidations.push(queryKeys.reviews.product(productId));
    }

    return queryClient.invalidateQueries(invalidations);
  },

  invalidateOrderQueries: (orderId?: number) => {
    const invalidations = [queryKeys.orders.all];

    if (orderId) {
      invalidations.push(queryKeys.orders.detail(orderId));
    }

    return queryClient.invalidateQueries(invalidations);
  },

  invalidateCartQueries: () => {
    return queryClient.invalidateQueries([queryKeys.cart.current]);
  },

  // Optimistic updates
  optimisticUpdate: <T>(
    queryKey: any[],
    updater: (oldData: T) => T
  ) => {
    return queryClient.setQueryData(queryKey, updater);
  },

  // Prefetch data
  prefetch: async (queryKey: any[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery(queryKey, queryFn);
  },
};

export default queryClient;
