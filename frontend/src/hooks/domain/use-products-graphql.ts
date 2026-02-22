/**
 * GraphQL Products Hooks (Apollo Integration)
 * 
 * This module provides GraphQL-based product data fetching using Apollo Client.
 * 
 * API STRATEGY COMPLIANCE:
 * - GraphQL is used for ALL data fetching and queries
 * - REST is used for commands (create, update, delete, stock operations)
 * 
 * All product listing, filtering, searching, and read operations
 * should use these hooks, NOT REST endpoints.
 */

'use client';

import { useQuery, useLazyQuery } from '@apollo/client/react';
import {
  GET_PRODUCTS,
  GET_PRODUCT_BY_ID,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCTS_BY_CATEGORY_NAME,
  GET_PRODUCTS_BY_PRICE_RANGE,
  SEARCH_PRODUCTS,
  GET_FEATURED_PRODUCTS,
  GET_NEW_PRODUCTS,
  GET_DISCOUNTED_PRODUCTS,
  GET_BESTSELLER_PRODUCTS,
  GET_TOP_RATED_PRODUCTS,
  GET_TRENDING_PRODUCTS,
  GET_PRODUCTS_BY_INVENTORY_STATUS,
  GET_PRODUCTS_NEEDING_REORDER,
  GET_LOW_STOCK_PRODUCTS,
  GET_OUT_OF_STOCK_PRODUCTS,
  GET_PRODUCT_STATISTICS,
  GET_PRODUCT_CATALOG,
  GET_RELATED_PRODUCTS,
  GET_CATEGORIES,
  GET_CATEGORY_BY_ID,
  GET_CATEGORY_BY_SLUG,
  GET_HOMEPAGE_DATA,
} from '@/lib/graphql/queries';

const EMPTY_ARRAY: any[] = [];

// ==================== Pagination Input Helper ====================

const createPaginationInput = (page = 0, size = 20, sortBy = 'id', direction = 'ASC') => ({
  page,
  size,
  sortBy,
  direction,
});

// ==================== Basic Product Hooks ====================

/**
 * Hook for fetching products with advanced filtering
 * 
 * @example
 * const { products, loading, error } = useProducts({
 *   filter: {
 *     categoryId: selectedCategory,
 *     minPrice: 10,
 *     maxPrice: 100,
 *     featured: true,
 *     inStockOnly: true
 *   },
 *   pagination: { page: 0, size: 20, sortBy: 'name' }
 * });
 */
export const useProducts = (options = {}) => {
  const { filter = {}, pagination = {}, ...queryOptions } = options;
  
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: {
      filter,
      pagination: createPaginationInput(
        pagination.page,
        pagination.size,
        pagination.sortBy,
        pagination.direction
      ),
    },
    notifyOnNetworkStatusChange: true,
    ...queryOptions,
  });

  return {
    products: data?.products?.content || [],
    pageInfo: data?.products?.pageInfo || {},
    totalCount: data?.products?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
    fetchMore,
  };
};

/**
 * Hook for fetching a single product by ID
 * 
 * @example
 * const { product, loading } = useProduct('123');
 */
export const useProduct = (id, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_BY_ID, {
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
 * Hook for fetching a single product by slug
 * 
 * @example
 * const { product, loading } = useProductBySlug('laptop-dell-xps');
 */
export const useProductBySlug = (slug, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    ...options,
  });

  return {
    product: data?.productBySlug,
    loading,
    error,
    refetch,
  };
};

// ==================== Category-Based Hooks ====================

/**
 * Hook for fetching products by category ID
 * 
 * @example
 * const { products, loading } = useProductsByCategory({
 *   categoryId: 5,
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useProductsByCategory = (options = {}) => {
  const { categoryId, pagination = {}, ...queryOptions } = options;
  
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: {
      categoryId,
      pagination: createPaginationInput(
        pagination.page,
        pagination.size,
        pagination.sortBy,
        pagination.direction
      ),
    },
    skip: !categoryId,
    notifyOnNetworkStatusChange: true,
    ...queryOptions,
  });

  return {
    products: data?.productsByCategory?.content || [],
    pageInfo: data?.productsByCategory?.pageInfo || {},
    totalCount: data?.productsByCategory?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
    fetchMore,
  };
};

/**
 * Hook for fetching products by category name
 */
export const useProductsByCategoryName = (options = {}) => {
  const { categoryName, pagination = {}, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_BY_CATEGORY_NAME, {
    variables: {
      categoryName,
      pagination: createPaginationInput(
        pagination.page,
        pagination.size,
        pagination.sortBy,
        pagination.direction
      ),
    },
    skip: !categoryName,
    ...queryOptions,
  });

  return {
    products: data?.productsByCategoryName?.content || [],
    pageInfo: data?.productsByCategoryName?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

// ==================== Price & Search Hooks ====================

/**
 * Hook for fetching products by price range
 * 
 * @example
 * const { products } = useProductsByPriceRange({
 *   minPrice: 10,
 *   maxPrice: 100,
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useProductsByPriceRange = (options = {}) => {
  const { minPrice, maxPrice, pagination = {}, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_BY_PRICE_RANGE, {
    variables: {
      minPrice,
      maxPrice,
      pagination: createPaginationInput(
        pagination.page,
        pagination.size,
        pagination.sortBy,
        pagination.direction
      ),
    },
    skip: minPrice === undefined || maxPrice === undefined,
    ...queryOptions,
  });

  return {
    products: data?.productsByPriceRange?.content || [],
    pageInfo: data?.productsByPriceRange?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for searching products by keyword
 * 
 * @example
 * const { products, loading } = useSearchProducts({
 *   keyword: 'laptop',
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useSearchProducts = (options = {}) => {
  const { keyword, pagination = {}, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(SEARCH_PRODUCTS, {
    variables: {
      keyword,
      pagination: createPaginationInput(
        pagination.page,
        pagination.size,
        pagination.sortBy,
        pagination.direction
      ),
    },
    skip: !keyword,
    ...queryOptions,
  });

  return {
    products: data?.searchProducts?.content || [],
    pageInfo: data?.searchProducts?.pageInfo || {},
    totalCount: data?.searchProducts?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
  };
};

// ==================== Marketing & Discovery Hooks ====================

/**
 * Hook for fetching featured products
 * 
 * @example
 * const { products, loading } = useFeaturedProducts({ limit: 8 });
 */
export const useFeaturedProducts = (options = {}) => {
  const { limit = 8, page = 0, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_FEATURED_PRODUCTS, {
    variables: {
      pagination: createPaginationInput(page, limit),
    },
    ...queryOptions,
  });

  return {
    products: data?.featuredProducts?.content || [],
    pageInfo: data?.featuredProducts?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching new products
 * 
 * @example
 * const { products, loading } = useNewProducts({ limit: 8 });
 */
export const useNewProducts = (options = {}) => {
  const { limit = 8, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_NEW_PRODUCTS, {
    variables: {
      pagination: createPaginationInput(0, limit),
    },
    ...queryOptions,
  });

  return {
    products: data?.newProducts?.content || [],
    pageInfo: data?.newProducts?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching discounted products
 * 
 * @example
 * const { products, loading } = useDiscountedProducts({ limit: 8 });
 */
export const useDiscountedProducts = (options = {}) => {
  const { limit = 8, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_DISCOUNTED_PRODUCTS, {
    variables: {
      pagination: createPaginationInput(0, limit),
    },
    ...queryOptions,
  });

  return {
    products: data?.discountedProducts?.content || [],
    pageInfo: data?.discountedProducts?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching bestseller products
 * 
 * @example
 * const { products, loading } = useBestsellerProducts({ limit: 8 });
 */
export const useBestsellerProducts = (options = {}) => {
  const { limit = 8, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_BESTSELLER_PRODUCTS, {
    variables: {
      pagination: createPaginationInput(0, limit),
    },
    ...queryOptions,
  });

  return {
    products: data?.bestsellerProducts?.content || [],
    pageInfo: data?.bestsellerProducts?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching top-rated products
 * 
 * @example
 * const { products, loading } = useTopRatedProducts({ limit: 8 });
 */
export const useTopRatedProducts = (options = {}) => {
  const { limit = 8, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_TOP_RATED_PRODUCTS, {
    variables: {
      pagination: createPaginationInput(0, limit),
    },
    ...queryOptions,
  });

  return {
    products: data?.topRatedProducts?.content || [],
    pageInfo: data?.topRatedProducts?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching trending products
 * 
 * @example
 * const { products, loading } = useTrendingProducts({ categoryId: 5, limit: 10 });
 */
export const useTrendingProducts = (options = {}) => {
  const { categoryId, limit = 10, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_TRENDING_PRODUCTS, {
    variables: {
      categoryId,
      limit,
    },
    ...queryOptions,
  });

  return {
    products: data?.trendingProducts || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Inventory Management Hooks (Admin) ====================

/**
 * Hook for fetching products by inventory status
 * (Admin only)
 * 
 * @example
 * const { products, loading } = useProductsByInventoryStatus({
 *   status: 'LOW_STOCK',
 *   pagination: { page: 0, size: 20 }
 * });
 */
export const useProductsByInventoryStatus = (options = {}) => {
  const { status, pagination = {}, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_BY_INVENTORY_STATUS, {
    variables: {
      status,
      pagination: createPaginationInput(
        pagination.page,
        pagination.size,
        pagination.sortBy,
        pagination.direction
      ),
    },
    skip: !status,
    ...queryOptions,
  });

  return {
    products: data?.productsByInventoryStatus?.content || [],
    pageInfo: data?.productsByInventoryStatus?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching products needing reorder
 * (Admin only)
 */
export const useProductsNeedingReorder = (options = {}) => {
  const { pagination = {}, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS_NEEDING_REORDER, {
    variables: {
      pagination: createPaginationInput(
        pagination.page,
        pagination.size,
        pagination.sortBy,
        pagination.direction
      ),
    },
    ...queryOptions,
  });

  return {
    products: data?.productsNeedingReorder?.content || [],
    pageInfo: data?.productsNeedingReorder?.pageInfo || {},
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching low stock products
 * (Admin only)
 */
export const useLowStockProducts = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_LOW_STOCK_PRODUCTS, options);

  return {
    products: data?.lowStockProducts || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching out of stock products
 * (Admin only)
 */
export const useOutOfStockProducts = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_OUT_OF_STOCK_PRODUCTS, options);

  return {
    products: data?.outOfStockProducts || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching product statistics
 * (Admin only)
 */
export const useProductStatistics = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_STATISTICS, options);

  return {
    statistics: data?.productStatistics,
    loading,
    error,
    refetch,
  };
};

// ==================== Category Hooks ====================

/**
 * Hook for fetching all categories
 */
export const useCategories = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES, options);

  return {
    categories: data?.categories?.content || [],
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for fetching a category by ID
 */
export const useCategory = (id, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CATEGORY_BY_ID, {
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

/**
 * Hook for fetching a category by slug
 */
export const useCategoryBySlug = (slug, options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_CATEGORY_BY_SLUG, {
    variables: { slug },
    skip: !slug,
    ...options,
  });

  return {
    category: data?.categoryBySlug,
    loading,
    error,
    refetch,
  };
};

// ==================== Advanced Catalog Hook ====================

/**
 * Hook for full product catalog with all filter options
 * This is the main hook for product listing pages with complex filtering
 * 
 * @example
 * const { products, loading, error, refetch } = useProductCatalog({
 *   categoryId: selectedCategory,
 *   minPrice: priceRange[0],
 *   maxPrice: priceRange[1],
 *   featured: showFeatured,
 *   isNew: showNewOnly,
 *   hasDiscount: showDiscounted,
 *   inStockOnly: true,
 *   minRating: 4,
 *   keyword: searchTerm,
 *   sortBy: sortField,
 *   sortDirection: sortOrder,
 *   page: currentPage,
 *   size: pageSize,
 * });
 */
export const useProductCatalog = (filters = {}, options = {}) => {
  const {
    categoryId,
    categoryIds,
    categorySlug,
    minPrice,
    maxPrice,
    featured,
    isNew,
    isBestseller,
    hasDiscount,
    inStockOnly,
    minRating,
    keyword,
    inventoryStatus,
    sortBy = 'id',
    sortDirection = 'ASC',
    page = 0,
    size = 20,
  } = filters;

  const filterInput = Object.fromEntries(
    Object.entries({
      categoryId,
      categoryIds,
      categorySlug,
      minPrice,
      maxPrice,
      featured,
      isNew,
      isBestseller,
      hasDiscount,
      inStockOnly,
      minRating,
      keyword,
      inventoryStatus,
    }).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
  );

  const queryVariables = {
    filter: Object.keys(filterInput).length > 0 ? filterInput : undefined,
    sortBy,
    sortDirection,
    page,
    size,
  };

  const { data, loading, error, refetch, fetchMore } = useQuery(GET_PRODUCT_CATALOG, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    ...options,
  });

  const loadMore = () => {
    const isLastPage = data?.products?.pageInfo?.isLast ?? data?.products?.pageInfo?.last ?? false;
    const currentPage = data?.products?.pageInfo?.page ?? data?.products?.pageInfo?.pageNumber ?? 0;
    if (!isLastPage) {
      fetchMore({
        variables: {
          ...queryVariables,
          page: currentPage + 1,
        },
      });
    }
  };

  return {
    products: data?.products?.content || [],
    pageInfo: data?.products?.pageInfo || {},
    totalCount: data?.products?.pageInfo?.totalElements || 0,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: !(data?.products?.pageInfo?.isLast ?? data?.products?.pageInfo?.last ?? true),
  };
};

/**
 * Hook for fetching related products
 * 
 * @example
 * const { products, loading } = useRelatedProducts({
 *   categoryId: product.category.id,
 *   excludeProductId: product.id,
 *   limit: 4
 * });
 */
export const useRelatedProducts = (options = {}) => {
  const { categoryId, excludeProductId, limit = 4, ...queryOptions } = options;
  
  const { data, loading, error, refetch } = useQuery(GET_RELATED_PRODUCTS, {
    variables: {
      categoryId,
      excludeProductId,
      limit,
    },
    skip: !categoryId || !excludeProductId,
    ...queryOptions,
  });

  return {
    products: data?.productsByCategory?.content?.filter(
      p => p.id !== excludeProductId
    ) || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Homepage Aggregated Hook ====================

/**
 * Hook for fetching all homepage data in one request
 * Fetches featured, new, trending, discounted products, and categories
 * 
 * @example
 * const { featured, newArrivals, trending, discounted, categories, loading } = useHomepageData();
 */
export const useHomepageData = (options = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_HOMEPAGE_DATA, {
    ...options,
  });

  return {
    featured: data?.featuredProducts?.content || [],
    newArrivals: data?.newProducts?.content || [],
    trending: data?.trendingProducts || [],
    discounted: data?.discountedProducts?.content || [],
    categories: data?.categories?.content || [],
    loading,
    error,
    refetch,
  };
};

// ==================== Lazy Query Hooks (For User-Triggered Actions) ====================

/**
 * Lazy hook for searching products (triggered on user input)
 * 
 * @example
 * const [searchProducts, { data, loading }] = useLazySearchProducts();
 * // Later: searchProducts({ variables: { keyword: 'laptop' } });
 */
export const useLazySearchProducts = () => {
  const [executeSearch, { data, loading, error }] = useLazyQuery(SEARCH_PRODUCTS);

  return [
    executeSearch,
    {
      products: data?.searchProducts?.content ?? EMPTY_ARRAY,
      pageInfo: data?.searchProducts?.pageInfo || {},
      loading,
      error,
    },
  ];
};

/**
 * Lazy hook for product catalog (triggered on filter changes)
 */
export const useLazyProductCatalog = () => {
  const [executeQuery, { data, loading, error, fetchMore }] = useLazyQuery(GET_PRODUCT_CATALOG);

  return [
    executeQuery,
    {
      products: data?.products?.content || [],
      pageInfo: data?.products?.pageInfo || {},
      totalCount: data?.products?.pageInfo?.totalElements || 0,
      loading,
      error,
      fetchMore,
    },
  ];
};

// Export all hooks as default object for convenience
export default {
  useProducts,
  useProduct,
  useProductBySlug,
  useProductsByCategory,
  useProductsByCategoryName,
  useProductsByPriceRange,
  useSearchProducts,
  useFeaturedProducts,
  useNewProducts,
  useDiscountedProducts,
  useBestsellerProducts,
  useTopRatedProducts,
  useTrendingProducts,
  useProductsByInventoryStatus,
  useProductsNeedingReorder,
  useLowStockProducts,
  useOutOfStockProducts,
  useProductStatistics,
  useCategories,
  useCategory,
  useCategoryBySlug,
  useProductCatalog,
  useRelatedProducts,
  useHomepageData,
  useLazySearchProducts,
  useLazyProductCatalog,
};
