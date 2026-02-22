import { request } from '../core/client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api';

/**
 * Product API - Commands Only (REST)
 * 
 * IMPORTANT: Following REST/GraphQL API Strategy
 * - GraphQL should be used for ALL data fetching (queries)
 * - REST should be used ONLY for commands (mutations)
 * 
 * Query methods in this file are DEPRECATED and will be removed.
 * Use GraphQL hooks from @/hooks/domain/use-products-graphql.ts instead.
 */

// ==================== Types ====================

export interface ProductCreateRequest {
  name: string;
  description?: string;
  slug: string;
  sku?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  categoryId: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  maxStockQuantity?: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  additionalImages?: string[];
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  slug?: string;
  sku?: string;
  price?: number;
  discountPrice?: number;
  costPrice?: number;
  categoryId?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  maxStockQuantity?: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  imageUrl?: string;
  thumbnailUrl?: string;
  additionalImages?: string[];
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
}

export interface ProductImageParams {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface BulkUpdateRequest {
  productIds: number[];
}

// ==================== Product Command API ====================

/**
 * Product Commands API (REST)
 * 
 * Use these endpoints for all product mutations/commands.
 * For data fetching, use GraphQL instead.
 */
export const productsApi = {
  
  // ============ CRUD OPERATIONS (COMMANDS) ============
  
  /**
   * Create a new product
   * POST /api/v1/products
   * 
   * @param data Product creation data
   * @returns Created product
   */
  create: (data: ProductCreateRequest) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/products',
      data,
    }),

  /**
   * Update an existing product (full update)
   * PUT /api/v1/products/{id}
   * 
   * @param id Product ID
   * @param data Product update data
   * @returns Updated product
   */
  update: (id: number, data: ProductUpdateRequest) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/products/${id}`,
      data,
    }),

  /**
   * Partially update a product
   * PATCH /api/v1/products/{id}
   * 
   * @param id Product ID
   * @param data Partial product data
   * @returns Updated product
   */
  patch: (id: number, data: Partial<ProductUpdateRequest>) =>
    request<ApiResponse<any>>({
      method: 'PATCH',
      url: `/v1/products/${id}`,
      data,
    }),

  /**
   * Delete a product
   * DELETE /api/v1/products/{id}
   * 
   * @param id Product ID
   */
  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/products/${id}`,
    }),

  // ============ BULK OPERATIONS (COMMANDS) ============
  
  /**
   * Bulk delete products
   * DELETE /api/v1/products/bulk
   * 
   * @param productIds Array of product IDs to delete
   */
  bulkDelete: (productIds: number[]) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: '/v1/products/bulk',
      params: { productIds },
    }),

  /**
   * Bulk update featured status
   * POST /api/v1/products/bulk/featured
   * 
   * @param productIds Array of product IDs
   * @param featured New featured status
   */
  bulkUpdateFeatured: (productIds: number[], featured: boolean) =>
    request<ApiResponse<null>>({
      method: 'POST',
      url: '/v1/products/bulk/featured',
      params: { productIds, featured },
    }),

  // ============ STOCK MANAGEMENT (COMMANDS) ============
  
  /**
   * Reduce product stock
   * POST /api/v1/products/{id}/reduce-stock
   * 
   * @param id Product ID
   * @param quantity Amount to reduce
   * @returns Updated product
   */
  reduceStock: (id: number, quantity: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/products/${id}/reduce-stock`,
      params: { quantity },
    }),

  /**
   * Restore product stock
   * POST /api/v1/products/{id}/restore-stock
   * 
   * @param id Product ID
   * @param quantity Amount to restore
   */
  restoreStock: (id: number, quantity: number) =>
    request<ApiResponse<null>>({
      method: 'POST',
      url: `/v1/products/${id}/restore-stock`,
      params: { quantity },
    }),

  /**
   * Reserve product stock
   * POST /api/v1/products/{id}/reserve-stock
   * 
   * @param id Product ID
   * @param quantity Amount to reserve
   * @returns Updated product
   */
  reserveStock: (id: number, quantity: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/products/${id}/reserve-stock`,
      params: { quantity },
    }),

  /**
   * Release reserved stock
   * POST /api/v1/products/{id}/release-stock
   * 
   * @param id Product ID
   * @param quantity Amount to release
   * @returns Updated product
   */
  releaseReservedStock: (id: number, quantity: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/products/${id}/release-stock`,
      params: { quantity },
    }),

  /**
   * Add stock to product
   * POST /api/v1/products/{id}/add-stock (alias for restore-stock)
   * 
   * @param id Product ID
   * @param quantity Amount to add
   * @returns Updated product
   */
  addStock: (id: number, quantity: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/products/${id}/restore-stock`,
      params: { quantity },
    }),

  // ============ PRODUCT IMAGES (COMMANDS) ============
  
  /**
   * Add product image
   * POST /api/v1/products/{productId}/images
   * 
   * @param productId Product ID
   * @param data Image data
   */
  addImage: (productId: number, data: ProductImageParams) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/products/${productId}/images`,
      data,
    }),

  /**
   * Update product image
   * PUT /api/v1/products/{productId}/images/{imageId}
   * 
   * @param productId Product ID
   * @param imageId Image ID
   * @param data Image data
   */
  updateImage: (productId: number, imageId: number, data: Partial<ProductImageParams>) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/products/${productId}/images/${imageId}`,
      data,
    }),

  /**
   * Delete product image
   * DELETE /api/v1/products/{productId}/images/{imageId}
   * 
   * @param productId Product ID
   * @param imageId Image ID
   */
  deleteImage: (productId: number, imageId: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/products/${productId}/images/${imageId}`,
    }),

  /**
   * Reorder product images
   * POST /api/v1/products/{productId}/images/reorder
   * 
   * @param productId Product ID
   * @param imageIds Ordered array of image IDs
   */
  reorderImages: (productId: number, imageIds: number[]) =>
    request<ApiResponse<any[]>>({
      method: 'POST',
      url: `/v1/products/${productId}/images/reorder`,
      data: { imageIds },
    }),

  // ============ ANALYTICS COMMANDS ============
  
  /**
   * Increment product view count
   * POST /api/v1/products/{id}/view
   * 
   * @param id Product ID
   */
  incrementViewCount: (id: number) =>
    request<ApiResponse<null>>({
      method: 'POST',
      url: `/v1/products/${id}/view`,
    }),

  /**
   * Update product rating
   * PUT /api/v1/products/{id}/rating
   * 
   * @param id Product ID
   * @param rating New rating value
   * @returns Updated product
   */
  updateRating: (id: number, rating: number) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/products/${id}/rating`,
      data: { rating },
    }),

  // ============ DEPRECATED: QUERY METHODS ============
  // 
  // The following methods are DEPRECATED and will be removed in a future version.
  // Use GraphQL queries from @/hooks/domain/use-products-graphql.ts instead.
  // 
  // Migration Guide:
  // - getAll() -> useProducts() hook with GraphQL
  // - search() -> useSearchProducts() hook with GraphQL
  // - getById() -> useProduct() hook with GraphQL
  // - getBySlug() -> useProductBySlug() hook with GraphQL
  // - getFeatured() -> useFeaturedProducts() hook with GraphQL
  // - getTrending() -> useTrendingProducts() hook with GraphQL
  // - getByCategoryName() -> useProductsByCategoryName() hook with GraphQL
  // - getTopRated() -> useTopRatedProducts() hook with GraphQL
  //
  
  /**
   * @deprecated Use useProducts() GraphQL hook instead
   */
  getAll: (params?: any) =>
    request<any>({
      method: 'GET',
      url: '/v1/products',
      params,
    }),

  /**
   * Filter products using POST /v1/products/filter
   * This is the recommended way to filter products via REST API
   */
  filter: (filterParams: any, pagination: { page?: number; size?: number } = {}) =>
    request<any>({
      method: 'POST',
      url: '/v1/products/filter',
      params: {
        page: pagination.page || 0,
        size: pagination.size || 20,
      },
      data: filterParams,
    }),

  /**
   * @deprecated Use useSearchProducts() GraphQL hook instead
   */
  search: (params: any) =>
    request<any>({
      method: 'GET',
      url: '/v1/products/search',
      params,
    }),

  /**
   * @deprecated Use useProduct() GraphQL hook instead
   */
  getById: (id: number) =>
    request<any>({
      method: 'GET',
      url: `/v1/products/${id}`,
    }),

  /**
   * @deprecated Use useProductBySlug() GraphQL hook instead
   */
  getBySlug: (slug: string) =>
    request<any>({
      method: 'GET',
      url: `/v1/products/slug/${slug}`,
    }),

  /**
   * @deprecated Use useProductsByCategoryName() GraphQL hook instead
   */
  getByCategoryName: (categoryName: string, params?: any) =>
    request<any>({
      method: 'GET',
      url: `/v1/products/category/${encodeURIComponent(categoryName)}`,
      params,
    }),

  /**
   * @deprecated Use useFeaturedProducts() GraphQL hook instead
   */
  getFeatured: () =>
    request<any>({
      method: 'GET',
      url: '/v1/products/featured',
    }),

  /**
   * @deprecated Use useTrendingProducts() GraphQL hook instead
   */
  getTrending: () =>
    request<any>({
      method: 'GET',
      url: '/products/trending',
    }),

  /**
   * @deprecated Use useTopRatedProducts() GraphQL hook instead
   */
  getTopRated: () =>
    request<any>({
      method: 'GET',
      url: '/products/top-rated',
    }),
};

export default productsApi;
