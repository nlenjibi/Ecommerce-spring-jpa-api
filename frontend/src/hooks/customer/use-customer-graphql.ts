/**
 * Customer Hooks - GraphQL Integration
 * 
 * These hooks provide GraphQL-based data fetching for customer operations.
 * 
 * API STRATEGY COMPLIANCE:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations)
 * 
 * For mutations (update profile, change password, cancel order, etc.), 
 * use the REST API or AuthContext methods.
 */

'use client';

import { useQuery, useLazyQuery } from '@apollo/client/react';
import {
  GET_CUSTOMER_ORDERS,
  GET_CUSTOMER_ORDER_BY_ID,
  GET_CUSTOMER_ORDER_STATS,
  GET_CUSTOMER_PROFILE,
  GET_CUSTOMER_ADDRESSES,
  GET_CUSTOMER_WISHLIST,
  GET_CUSTOMER_DASHBOARD,
  GET_CUSTOMER_REVIEWS,
  GET_CUSTOMER_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS_COUNT,
} from '@/lib/graphql/customer-queries';

// ==================== Customer Orders Hooks ====================

/**
 * Hook for fetching customer's orders
 * 
 * @example
 * const { orders, loading, error, totalCount } = useCustomerOrders({
 *   status: 'PENDING',
 *   page: 0,
 *   size: 10
 * });
 */
export const useCustomerOrders = (params = {}, options = {}) => {
  const { status, page = 0, size = 10 } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_ORDERS, {
    variables: {
      pagination: {
        page,
        size,
        sortBy: 'orderDate',
        direction: 'DESC'
      }
    },
    ...options,
  });

  // Extract orders from the response structure
  const orders = (data as any)?.myOrders?.content || [];
  const pageInfo = (data as any)?.myOrders?.pageInfo;
  
  // Add itemCount to each order (items already have flat structure from backend)
  const ordersWithItemCount = orders.map((order: any) => ({
    ...order,
    itemCount: order.items?.length || 0,
  }));

  return {
    orders: ordersWithItemCount,
    pageInfo: pageInfo || {
      totalElements: 0,
      totalPages: 0,
      page: page,
      size: size,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    },
    totalCount: pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a specific customer order
 * 
 * @example
 * const { order, loading, error } = useCustomerOrder(123);
 */
export const useCustomerOrder = (id, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_ORDER_BY_ID, {
    variables: { id },
    skip: !id,
    ...options,
  });

  // Order already has the correct structure from backend
  const order = (data as any)?.order || null;

  return {
    order,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching customer order statistics
 * 
 * @example
 * const { stats, loading } = useCustomerOrderStats();
 */
export const useCustomerOrderStats = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_ORDER_STATS, {
    ...options,
  });

  // Calculate stats from orders array
  const orders = (data as any)?.myOrders?.content || [];
  
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
    processingOrders: orders.filter((o: any) => o.status === 'PROCESSING').length,
    shippedOrders: orders.filter((o: any) => o.status === 'SHIPPED').length,
    deliveredOrders: orders.filter((o: any) => o.status === 'DELIVERED').length,
    cancelledOrders: orders.filter((o: any) => o.status === 'CANCELLED').length,
    totalSpent: orders.reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0),
    totalItems: orders.reduce((sum: number, o: any) => sum + (o.items?.length || 0), 0),
  };

  return {
    stats,
    loading,
    error,
    refetch,
  };
};

// ==================== Customer Profile Hooks ====================

/**
 * Hook for fetching customer profile
 * 
 * @example
 * const { profile, loading, error } = useCustomerProfile();
 */
export const useCustomerProfile = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_PROFILE, {
    ...options,
  });

  return {
    profile: data?.me,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching customer addresses
 * 
 * @example
 * const { addresses, loading, error } = useCustomerAddresses();
 */
export const useCustomerAddresses = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_ADDRESSES, {
    ...options,
  });

  return {
    addresses: data?.myAddresses || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Customer Wishlist Hooks ====================

/**
 * Hook for fetching customer wishlist
 * 
 * @example
 * const { wishlist, loading, error } = useCustomerWishlist();
 */
export const useCustomerWishlist = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_WISHLIST, {
    ...options,
  });

  return {
    wishlist: data?.myWishlist || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Customer Dashboard Hooks ====================

/**
 * Hook for fetching customer dashboard data
 * Combines user info, stats, recent orders, and notifications
 * 
 * @example
 * const { dashboard, loading, error } = useCustomerDashboard();
 */
export const useCustomerDashboard = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_DASHBOARD, {
    ...options,
  });

  return {
    dashboard: data?.customerDashboard,
    user: data?.customerDashboard?.user,
    stats: data?.customerDashboard?.stats,
    recentOrders: data?.customerDashboard?.recentOrders || [],
    notifications: data?.customerDashboard?.notifications || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Customer Reviews Hooks ====================

/**
 * Hook for fetching customer reviews
 * 
 * @example
 * const { reviews, loading, error } = useCustomerReviews();
 */
export const useCustomerReviews = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_REVIEWS, {
    ...options,
  });

  return {
    reviews: data?.myReviews || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Customer Notifications Hooks ====================

/**
 * Hook for fetching customer notifications
 * 
 * @example
 * const { notifications, loading, error, totalCount } = useCustomerNotifications({
 *   unreadOnly: true,
 *   page: 0,
 *   size: 20
 * });
 */
export const useCustomerNotifications = (params = {}, options = {}) => {
  const { unreadOnly = false, page = 0, size = 20 } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_NOTIFICATIONS, {
    variables: {
      unreadOnly,
      page,
      size,
    },
    ...options,
  });

  return {
    notifications: data?.myNotifications?.content || [],
    pageInfo: data?.myNotifications?.pageInfo,
    totalCount: data?.myNotifications?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching unread notifications count
 * 
 * @example
 * const { count, loading } = useUnreadNotificationsCount();
 */
export const useUnreadNotificationsCount = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT, {
    ...options,
  });

  return {
    count: data?.unreadNotificationsCount || 0,
    loading,
    error,
    refetch,
  };
};

// ==================== Lazy Query Hooks (For User-Triggered Actions) ====================

/**
 * Lazy hook for searching/filtering customer orders
 * 
 * @example
 * const [fetchOrders, { orders, loading }] = useLazyCustomerOrders();
 * // Later: fetchOrders({ variables: { status: 'PENDING' } });
 */
export const useLazyCustomerOrders = () => {
  const [executeQuery, { data, loading, error }] = useLazyQuery(GET_CUSTOMER_ORDERS);

  return [
    executeQuery,
    {
      orders: data?.myOrders?.content || [],
      pageInfo: data?.myOrders?.pageInfo,
      totalCount: data?.myOrders?.pageInfo?.totalElements || 0,
      loading,
      error,
    },
  ];
};

/**
 * Lazy hook for fetching customer order details
 */
export const useLazyCustomerOrder = () => {
  const [executeQuery, { data, loading, error }] = useLazyQuery(GET_CUSTOMER_ORDER_BY_ID);

  return [
    executeQuery,
    {
      order: data?.myOrder,
      loading,
      error,
    },
  ];
};

// Export all hooks as default object
export default {
  useCustomerOrders,
  useCustomerOrder,
  useCustomerOrderStats,
  useCustomerProfile,
  useCustomerAddresses,
  useCustomerWishlist,
  useCustomerDashboard,
  useCustomerReviews,
  useCustomerNotifications,
  useUnreadNotificationsCount,
  useLazyCustomerOrders,
  useLazyCustomerOrder,
};
