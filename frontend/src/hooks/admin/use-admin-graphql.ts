/**
 * Admin Hooks - GraphQL Integration
 * 
 * These hooks provide GraphQL-based data fetching for admin operations.
 * 
 * API STRATEGY COMPLIANCE:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations)
 * 
 * For mutations, use the admin REST API from @/lib/api/endpoints/admin.api
 */

'use client';

import { useQuery, useLazyQuery } from '@apollo/client/react';
import {
  GET_ADMIN_DASHBOARD_STATS,
  GET_ADMIN_PRODUCTS,
  GET_ADMIN_PRODUCT_BY_ID,
  GET_ADMIN_PRODUCT_STATISTICS,
  GET_LOW_STOCK_PRODUCTS,
  GET_OUT_OF_STOCK_PRODUCTS,
  GET_PRODUCTS_NEEDING_REORDER,
  GET_ADMIN_ORDERS,
  GET_ADMIN_ORDER_BY_ID,
  GET_ORDER_STATISTICS,
  GET_ADMIN_USERS,
  GET_ADMIN_USER_BY_ID,
  GET_USER_STATISTICS,
  GET_ADMIN_CATEGORIES,
  GET_ADMIN_CATEGORY_BY_ID,
  GET_ADMIN_REVIEWS,
  GET_REVIEW_STATISTICS,
  GET_ADMIN_ANALYTICS,
  GET_SALES_REPORT,
  GET_INVENTORY_SUMMARY,
  GET_INVENTORY_HISTORY,
} from '@/lib/graphql/admin-queries';

// ==================== Dashboard Hooks ====================

/**
 * Hook for fetching admin dashboard statistics
 * 
 * @example
 * const { stats, loading, error } = useAdminDashboardStats();
 */
export const useAdminDashboardStats = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_DASHBOARD_STATS, {
    ...options,
  });

  const dashboard = data?.adminDashboard;

  return {
    stats: dashboard
      ? {
          totalRevenue: dashboard.totalRevenue ?? 0,
          totalOrders: dashboard.totalOrders ?? 0,
          totalProducts: dashboard.totalProducts ?? 0,
          totalUsers: dashboard.totalUsers ?? 0,
          pendingOrders: dashboard.pendingOrders ?? 0,
          activeUsers: dashboard.activeUsers ?? dashboard.totalUsers ?? 0,
          totalInventoryValue: 0,
          lowStockCount: dashboard.lowStockProducts ?? 0,
          recentOrders: [],
          salesByCategory: [],
          topProducts: [],
        }
      : null,
    loading,
    error,
    refetch,
  };
};

// ==================== Product Management Hooks ====================

/**
 * Hook for fetching admin products with filtering and pagination
 * 
 * @example
 * const { products, loading, error, totalCount } = useAdminProducts({
 *   filter: { featured: true, inventoryStatus: 'IN_STOCK' },
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useAdminProducts = (params = {}, options = {}) => {
  const { filter = {}, pagination = {} } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_PRODUCTS, {
    variables: {
      filter,
      pagination: {
        page: pagination.page || 0,
        size: pagination.size || 20,
        ...pagination,
      },
    },
    ...options,
  });

  return {
    products: data?.products?.content || [],
    pageInfo: data?.products?.pageInfo,
    totalCount: data?.products?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a single product by ID
 * 
 * @example
 * const { product, loading, error } = useAdminProduct(123);
 */
export const useAdminProduct = (id, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_PRODUCT_BY_ID, {
    variables: { id },
    skip: !id,
    ...options,
  });

  return {
    product: data?.product,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching product statistics
 * 
 * @example
 * const { statistics, loading } = useAdminProductStatistics();
 */
export const useAdminProductStatistics = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_PRODUCT_STATISTICS, {
    ...options,
  });

  return {
    statistics: data?.productStatistics,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching low stock products
 * 
 * @example
 * const { products, loading } = useLowStockProducts();
 */
export const useLowStockProducts = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_LOW_STOCK_PRODUCTS, {
    ...options,
  });

  return {
    products: data?.lowStockProducts || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching out of stock products
 * 
 * @example
 * const { products, loading } = useOutOfStockProducts();
 */
export const useOutOfStockProducts = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_OUT_OF_STOCK_PRODUCTS, {
    ...options,
  });

  return {
    products: data?.outOfStockProducts || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching products needing reorder
 * 
 * @example
 * const { products, loading } = useProductsNeedingReorder({ page: 0, size: 20 });
 */
export const useProductsNeedingReorder = (pagination = {}, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_NEEDING_REORDER, {
    variables: {
      pagination: {
        page: pagination.page || 0,
        size: pagination.size || 20,
        ...pagination,
      },
    },
    ...options,
  });

  return {
    products: data?.productsNeedingReorder?.content || [],
    pageInfo: data?.productsNeedingReorder?.pageInfo,
    totalCount: data?.productsNeedingReorder?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

// ==================== Order Management Hooks ====================

/**
 * Hook for fetching admin orders with filtering
 * 
 * @example
 * const { orders, loading, totalCount } = useAdminOrders({
 *   filter: { status: 'PENDING' },
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useAdminOrders = (params = {}, options = {}) => {
  const { filter = {}, pagination = {} } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ORDERS, {
    variables: {
      pagination: {
        page: pagination.page || 0,
        size: pagination.size || 20,
        ...pagination,
      },
    },
    ...options,
  });

  const rawOrders = data?.allOrders?.content || [];
  const normalizedFilter = filter || {};
  const filteredOrders = rawOrders.filter((order: any) => {
    const statusFilter = normalizedFilter.status;
    const searchFilter = (normalizedFilter.search || '').toString().trim().toLowerCase();

    if (statusFilter && String(order?.status || '').toUpperCase() !== String(statusFilter).toUpperCase()) {
      return false;
    }

    if (searchFilter) {
      const haystack = [
        order?.orderNumber,
        order?.customerName,
        order?.customerEmail,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchFilter)) {
        return false;
      }
    }

    return true;
  });

  return {
    orders: filteredOrders,
    pageInfo: data?.allOrders?.pageInfo,
    totalCount: data?.allOrders?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a single order by ID
 * 
 * @example
 * const { order, loading, error } = useAdminOrder(456);
 */
export const useAdminOrder = (id, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ORDER_BY_ID, {
    variables: { id },
    skip: !id,
    ...options,
  });

  return {
    order: data?.order?.order,
    errors: data?.order?.errors || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching order statistics
 * 
 * @example
 * const { statistics, loading } = useOrderStatistics();
 */
export const useOrderStatistics = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ORDER_STATISTICS, {
    ...options,
  });

  return {
    statistics: data?.orderStatistics?.stats,
    errors: data?.orderStatistics?.errors || [],
    loading,
    error,
    refetch,
  };
};

// ==================== User Management Hooks ====================

/**
 * Hook for fetching admin users with filtering
 * 
 * @example
 * const { users, loading, totalCount } = useAdminUsers({
 *   filter: { role: 'ADMIN', search: 'john' },
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useAdminUsers = (params = {}, options = {}) => {
  const { filter = {}, pagination = {} } = params;
  const { role: _ignoredRole, ...graphqlFilter } = (filter as any) || {};
  
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_USERS, {
    variables: {
      filter: graphqlFilter,
      pagination: {
        page: pagination.page || 0,
        size: pagination.size || 20,
        ...pagination,
      },
    },
    errorPolicy: 'all',
    ...options,
  });

  return {
    users: (data?.users?.content || []).filter(Boolean),
    pageInfo: data?.users?.pageInfo,
    totalCount: data?.users?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a single user by ID
 * 
 * @example
 * const { user, loading, error } = useAdminUser(789);
 */
export const useAdminUser = (id, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_USER_BY_ID, {
    variables: { id },
    skip: !id,
    ...options,
  });

  return {
    user: data?.user,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching user statistics
 * 
 * @example
 * const { statistics, loading } = useUserStatistics();
 */
export const useUserStatistics = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_USER_STATISTICS, {
    ...options,
  });

  return {
    statistics: data?.userStatistics,
    loading,
    error,
    refetch,
  };
};

// ==================== Category Management Hooks ====================

/**
 * Hook for fetching all categories (admin view)
 * 
 * @example
 * const { categories, loading } = useAdminCategories();
 */
export const useAdminCategories = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_CATEGORIES, {
    ...options,
  });

  return {
    categories: data?.categories || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a single category by ID
 * 
 * @example
 * const { category, loading } = useAdminCategory(10);
 */
export const useAdminCategory = (id, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_CATEGORY_BY_ID, {
    variables: { id },
    skip: !id,
    ...options,
  });

  return {
    category: data?.category,
    loading,
    error,
    refetch,
  };
};

// ==================== Review Management Hooks ====================

/**
 * Hook for fetching admin reviews with filtering
 * 
 * @example
 * const { reviews, loading } = useAdminReviews({
 *   filter: { status: 'PENDING' },
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useAdminReviews = (params = {}, options = {}) => {
  const { filter = {}, pagination = {} } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_REVIEWS, {
    variables: {
      filter,
      pagination: {
        page: pagination.page || 0,
        size: pagination.size || 20,
        ...pagination,
      },
    },
    ...options,
  });

  return {
    reviews: data?.reviews?.content || [],
    pageInfo: data?.reviews?.pageInfo,
    totalCount: data?.reviews?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching review statistics
 * 
 * @example
 * const { statistics, loading } = useReviewStatistics();
 */
export const useReviewStatistics = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_REVIEW_STATISTICS, {
    ...options,
  });

  return {
    statistics: data?.reviewStatistics,
    loading,
    error,
    refetch,
  };
};

// ==================== Analytics Hooks ====================

/**
 * Hook for fetching admin analytics
 * 
 * @example
 * const { analytics, loading } = useAdminAnalytics({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   granularity: 'DAILY'
 * });
 */
export const useAdminAnalytics = (params, options = {}) => {
  const { startDate, endDate, granularity = 'DAILY' } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ANALYTICS, {
    variables: { startDate, endDate, granularity },
    skip: !startDate || !endDate,
    ...options,
  });

  return {
    analytics: data?.analytics,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching sales report
 * 
 * @example
 * const { report, loading } = useSalesReport({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 */
export const useSalesReport = (params, options = {}) => {
  const { startDate, endDate } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_SALES_REPORT, {
    variables: { startDate, endDate },
    skip: !startDate || !endDate,
    ...options,
  });

  return {
    report: data?.salesReport,
    loading,
    error,
    refetch,
  };
};

// ==================== Inventory Hooks ====================

/**
 * Hook for fetching inventory summary
 * 
 * @example
 * const { summary, loading } = useInventorySummary();
 */
export const useInventorySummary = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_INVENTORY_SUMMARY, {
    ...options,
  });

  return {
    summary: data?.inventorySummary,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching inventory history for a product
 * 
 * @example
 * const { history, loading } = useInventoryHistory({
 *   productId: 123,
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 */
export const useInventoryHistory = (params, options = {}) => {
  const { productId, startDate, endDate } = params;
  
  const { data, loading, error, refetch } = useQuery(GET_INVENTORY_HISTORY, {
    variables: { productId, startDate, endDate },
    skip: !productId,
    ...options,
  });

  return {
    history: data?.inventoryHistory || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Lazy Query Hooks (For User-Triggered Actions) ====================

/**
 * Lazy hook for searching admin products
 * 
 * @example
 * const [searchProducts, { products, loading }] = useLazyAdminProducts();
 * // Later: searchProducts({ variables: { filter: { keyword: 'laptop' } } });
 */
export const useLazyAdminProducts = () => {
  const [executeQuery, { data, loading, error }] = useLazyQuery(GET_ADMIN_PRODUCTS);

  return [
    executeQuery,
    {
      products: data?.products?.content || [],
      pageInfo: data?.products?.pageInfo,
      totalCount: data?.products?.pageInfo?.totalElements || 0,
      loading,
      error,
    },
  ];
};

/**
 * Lazy hook for searching admin orders
 */
export const useLazyAdminOrders = () => {
  const [executeQuery, { data, loading, error }] = useLazyQuery(GET_ADMIN_ORDERS);

  return [
    executeQuery,
    {
      orders: data?.allOrders?.content || [],
      pageInfo: data?.allOrders?.pageInfo,
      totalCount: data?.allOrders?.pageInfo?.totalElements || 0,
      loading,
      error,
    },
  ];
};

/**
 * Lazy hook for searching admin users
 */
export const useLazyAdminUsers = () => {
  const [executeQuery, { data, loading, error }] = useLazyQuery(GET_ADMIN_USERS);

  return [
    executeQuery,
    {
      users: data?.users?.content || [],
      pageInfo: data?.users?.pageInfo,
      totalCount: data?.users?.pageInfo?.totalElements || 0,
      loading,
      error,
    },
  ];
};

// Export all hooks as default object
export default {
  useAdminDashboardStats,
  useAdminProducts,
  useAdminProduct,
  useAdminProductStatistics,
  useLowStockProducts,
  useOutOfStockProducts,
  useProductsNeedingReorder,
  useAdminOrders,
  useAdminOrder,
  useOrderStatistics,
  useAdminUsers,
  useAdminUser,
  useUserStatistics,
  useAdminCategories,
  useAdminCategory,
  useAdminReviews,
  useReviewStatistics,
  useAdminAnalytics,
  useSalesReport,
  useInventorySummary,
  useInventoryHistory,
  useLazyAdminProducts,
  useLazyAdminOrders,
  useLazyAdminUsers,
};
