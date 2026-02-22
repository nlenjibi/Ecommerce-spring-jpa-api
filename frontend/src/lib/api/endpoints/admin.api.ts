/**
 * Admin REST API - Commands Only
 * 
 * Following REST/GraphQL API Strategy:
 * - REST is used for ALL commands (create, update, delete, state changes)
 * - GraphQL is used for data fetching (queries)
 * 
 * This module contains all admin mutation endpoints.
 * For data fetching, use GraphQL queries from @/lib/graphql/admin-queries.ts
 */

import { request } from '../core/client';
import { ApiResponse, PaginatedApiResponse } from '@/types/api';

// ==================== Product Commands ====================

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

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {}

export const adminProductApi = {
  /**
   * Create a new product
   * POST /api/v1/admin/products
   */
  create: (data: ProductCreateRequest) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/admin/products',
      data,
    }),

  /**
   * Update an existing product
   * PUT /api/v1/admin/products/:id
   */
  update: (id: number, data: ProductUpdateRequest) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/admin/products/${id}`,
      data,
    }),

  /**
   * Delete a product
   * DELETE /api/v1/admin/products/:id
   */
  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/admin/products/${id}`,
    }),

  /**
   * Bulk delete products
   * DELETE /api/v1/admin/products/bulk
   */
  bulkDelete: (ids: number[]) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: '/v1/admin/products/bulk',
      data: { ids },
    }),

  /**
   * Update product stock quantity
   * POST /api/v1/admin/products/:id/stock
   */
  updateStock: (id: number, quantity: number, reason?: string) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/products/${id}/stock`,
      data: { quantity, reason },
    }),

  /**
   * Set product as featured
   * POST /api/v1/admin/products/:id/featured
   */
  setFeatured: (id: number, featured: boolean) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/products/${id}/featured`,
      data: { featured },
    }),

  /**
   * Set product as new arrival
   * POST /api/v1/admin/products/:id/new
   */
  setNew: (id: number, isNew: boolean) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/products/${id}/new`,
      data: { isNew },
    }),

  /**
   * Activate product
   * POST /api/v1/admin/products/:id/activate
   */
  activate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/products/${id}/activate`,
    }),

  /**
   * Deactivate product
   * POST /api/v1/admin/products/:id/deactivate
   */
  deactivate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/products/${id}/deactivate`,
    }),
};

// ==================== Category Commands ====================

export interface CategoryCreateRequest {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  image?: string;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {}

export const adminCategoryApi = {
  /**
   * Create a new category
   * POST /api/v1/admin/categories
   */
  create: (data: CategoryCreateRequest) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/admin/categories',
      data,
    }),

  /**
   * Update a category
   * PUT /api/v1/admin/categories/:id
   */
  update: (id: number, data: CategoryUpdateRequest) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/admin/categories/${id}`,
      data,
    }),

  /**
   * Delete a category
   * DELETE /api/v1/admin/categories/:id
   */
  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/admin/categories/${id}`,
    }),

  /**
   * Activate category
   * POST /api/v1/admin/categories/:id/activate
   */
  activate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/categories/${id}/activate`,
    }),

  /**
   * Deactivate category
   * POST /api/v1/admin/categories/:id/deactivate
   */
  deactivate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/categories/${id}/deactivate`,
    }),

  /**
   * Reorder categories
   * POST /api/v1/admin/categories/reorder
   */
  reorder: (categoryIds: number[]) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/admin/categories/reorder',
      data: { categoryIds },
    }),
};

// ==================== Order Commands ====================

export const adminOrderApi = {
  /**
   * Get orders (Admin)
   * GET /api/v1/orders
   */
  getOrders: (params?: {
    page?: number;
    size?: number;
    status?: string;
    paymentStatus?: string;
    orderNumber?: string;
    customerEmail?: string;
    userId?: number;
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    highValue?: boolean;
    overdue?: boolean;
  }) =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: '/v1/orders',
      params,
    }),

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  getOrderById: (id: number) =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: `/v1/orders/${id}`,
    }),

  /**
   * Get order statistics (Admin)
   * GET /api/v1/orders/admin/statistics
   */
  getStatistics: () =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: '/v1/orders/admin/statistics',
    }),

  /**
   * Update order status (PATCH)
   * PATCH /api/v1/orders/admin/:id/status?status=...
   */
  updateStatus: (id: number, status: string) =>
    request<ApiResponse<any>>({
      method: 'PATCH',
      url: `/v1/orders/admin/${id}/status`,
      params: { status },
    }),

  /**
   * Confirm order
   * PUT /api/v1/orders/admin/:id/confirm
   */
  confirm: (id: number) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/confirm`,
    }),

  /**
   * Process order
   * PUT /api/v1/orders/admin/:id/process
   */
  process: (id: number) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/process`,
    }),

  /**
   * Mark order as out for delivery
   * PUT /api/v1/orders/admin/:id/out-for-delivery
   */
  outForDelivery: (id: number) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/out-for-delivery`,
    }),

  /**
   * Ship order
   * PUT /api/v1/orders/admin/:id/ship?trackingNumber=...&carrier=...
   */
  ship: (id: number, trackingData: { trackingNumber: string; carrier?: string }) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/ship`,
      params: {
        trackingNumber: trackingData.trackingNumber,
        carrier: trackingData.carrier,
      },
    }),

  /**
   * Deliver order
   * PUT /api/v1/orders/admin/:id/deliver
   */
  deliver: (id: number) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/deliver`,
    }),

  /**
   * Cancel order (Admin)
   * PUT /api/v1/orders/:id/cancel?reason=...
   */
  cancel: (id: number, reason: string) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/${id}/cancel`,
      params: { reason },
    }),

  /**
   * Process refund
   * PUT /api/v1/orders/admin/:id/refund?amount=...&reason=...
   */
  refund: (id: number, amount: number, reason?: string) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/refund`,
      params: { amount, reason: reason || 'Refund processed by admin' },
    }),

  /**
   * Update order (full update)
   * PUT /api/v1/orders/admin/:id
   */
  update: (id: number, data: {
    status?: string;
    trackingNumber?: string;
    carrier?: string;
    adminNotes?: string;
    cancellationReason?: string;
    refundAmount?: number;
    refundReason?: string;
  }) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}`,
      data,
    }),

  /**
   * Update tracking information
   * PUT /api/v1/orders/admin/:id
   */
  updateTracking: (id: number, trackingNumber: string, carrier: string) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}`,
      data: { trackingNumber, carrier },
    }),

  /**
   * Add note to order
   * PUT /api/v1/orders/admin/:id
   */
  addNote: (id: number, note: string) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}`,
      data: { adminNotes: note },
    }),

  /**
   * Update payment status
   * PUT /api/v1/orders/admin/:id/payment-status?status=...
   */
  updatePaymentStatus: (id: number, status: string) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/payment-status`,
      params: { status },
    }),

  /**
   * Delete order
   * DELETE /api/v1/orders/:id
   */
  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/orders/${id}`,
    }),
};

// ==================== User Commands ====================

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export const adminUserApi = {
  /**
   * Create a new user
   * POST /api/v1/users
   */
  create: (data: UserCreateRequest) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/users',
      data,
    }),

  /**
   * Update user
   * PUT /api/v1/users/:id
   */
  update: (id: number, data: UserUpdateRequest) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/users/${id}`,
      data,
    }),

  /**
   * Delete user
   * DELETE /api/v1/users/:id
   */
  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/users/${id}`,
    }),

  /**
   * Update user role
   * PATCH /api/v1/users/:id/role
   */
  updateRole: (id: number, role: string) =>
    request<ApiResponse<any>>({
      method: 'PATCH',
      url: `/v1/users/${id}/role`,
      data: { role },
    }),

  /**
   * Activate user
   * POST /api/v1/admin/users/:id/activate
   */
  activate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/users/${id}/activate`,
    }),

  /**
   * Deactivate user
   * POST /api/v1/admin/users/:id/deactivate
   */
  deactivate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/users/${id}/deactivate`,
    }),

  /**
   * Verify user email
   * POST /api/v1/admin/users/:id/verify-email
   */
  verifyEmail: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/users/${id}/verify-email`,
    }),

  /**
   * Reset user password
   * POST /api/v1/admin/users/:id/reset-password
   */
  resetPassword: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/users/${id}/reset-password`,
    }),
};

// ==================== Review Commands ====================

export const adminReviewApi = {
  /**
   * Approve review
   * POST /api/v1/admin/reviews/:id/approve
   */
  approve: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/reviews/${id}/approve`,
    }),

  /**
   * Reject review
   * POST /api/v1/admin/reviews/:id/reject
   */
  reject: (id: number, reason: string) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/reviews/${id}/reject`,
      data: { reason },
    }),

  /**
   * Delete review
   * DELETE /api/v1/admin/reviews/:id
   */
  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/admin/reviews/${id}`,
    }),

  /**
   * Bulk update review status
   * POST /api/v1/admin/reviews/bulk-update
   */
  bulkUpdateStatus: (ids: number[], status: string) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/admin/reviews/bulk-update',
      data: { ids, status },
    }),

  /**
   * Mark review as featured
   * POST /api/v1/admin/reviews/:id/featured
   */
  setFeatured: (id: number, featured: boolean) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/reviews/${id}/featured`,
      data: { featured },
    }),
};

// ==================== Promotion Commands ====================

export interface PromotionCreateRequest {
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  userLimit?: number;
  applicableCategories?: number[];
  applicableProducts?: number[];
}

export interface PromotionUpdateRequest extends Partial<PromotionCreateRequest> {}

export const adminPromotionApi = {
  /**
   * Create promotion
   * POST /api/v1/admin/promotions
   */
  create: (data: PromotionCreateRequest) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/admin/promotions',
      data,
    }),

  /**
   * Update promotion
   * PUT /api/v1/admin/promotions/:id
   */
  update: (id: number, data: PromotionUpdateRequest) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/admin/promotions/${id}`,
      data,
    }),

  /**
   * Delete promotion
   * DELETE /api/v1/admin/promotions/:id
   */
  delete: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/admin/promotions/${id}`,
    }),

  /**
   * Activate promotion
   * POST /api/v1/admin/promotions/:id/activate
   */
  activate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/promotions/${id}/activate`,
    }),

  /**
   * Deactivate promotion
   * POST /api/v1/admin/promotions/:id/deactivate
   */
  deactivate: (id: number) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: `/v1/admin/promotions/${id}/deactivate`,
    }),
};

// ==================== Settings Commands ====================

export const adminSettingsApi = {
  /**
   * Update store settings
   * PUT /api/v1/admin/settings
   */
  update: (data: any) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: '/v1/admin/settings',
      data,
    }),

  /**
   * Update shipping settings
   * PUT /api/v1/admin/settings/shipping
   */
  updateShipping: (data: any) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: '/v1/admin/settings/shipping',
      data,
    }),

  /**
   * Update tax settings
   * PUT /api/v1/admin/settings/tax
   */
  updateTax: (data: any) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: '/v1/admin/settings/tax',
      data,
    }),

  /**
   * Update payment settings
   * PUT /api/v1/admin/settings/payment
   */
  updatePayment: (data: any) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: '/v1/admin/settings/payment',
      data,
    }),

  /**
   * Update notification settings
   * PUT /api/v1/admin/settings/notifications
   */
  updateNotifications: (data: any) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: '/v1/admin/settings/notifications',
      data,
    }),
};

// ==================== Performance Monitoring API ====================

export const adminPerformanceApi = {
  /**
   * Get system performance metrics
   * GET /api/v1/performance/metrics
   */
  getMetrics: () =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: '/v1/performance/metrics',
    }),

  /**
   * Get cache statistics for a specific cache
   * GET /api/v1/performance/cache/{cacheName}
   */
  getCacheStats: (cacheName: string) =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: `/v1/performance/cache/${cacheName}`,
    }),

  /**
   * Clear all caches
   * POST /api/v1/performance/cache/clear
   */
  clearAllCaches: () =>
    request<ApiResponse<string>>({
      method: 'POST',
      url: '/v1/performance/cache/clear',
    }),

  /**
   * Clear specific cache
   * POST /api/v1/performance/cache/clear/{cacheName}
   */
  clearCache: (cacheName: string) =>
    request<ApiResponse<string>>({
      method: 'POST',
      url: `/v1/performance/cache/clear/${cacheName}`,
    }),

  /**
   * Warm up caches with frequently accessed data
   * POST /api/v1/performance/cache/warmup
   */
  warmupCaches: () =>
    request<ApiResponse<string>>({
      method: 'POST',
      url: '/v1/performance/cache/warmup',
    }),

  /**
   * Get database performance metrics
   * GET /api/v1/performance/database
   */
  getDatabaseMetrics: () =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: '/v1/performance/database',
    }),
};

// ==================== Combined Admin API ====================

export const adminApi = {
  products: adminProductApi,
  categories: adminCategoryApi,
  orders: adminOrderApi,
  users: adminUserApi,
  reviews: adminReviewApi,
  promotions: adminPromotionApi,
  settings: adminSettingsApi,
  performance: adminPerformanceApi,
  // Backward-compatible aliases used by older pages/hooks.
  updateOrderStatus: (id: number, status: string) => adminOrderApi.updateStatus(id, status),
  confirmOrder: (id: number) => adminOrderApi.confirm(id),
  processOrder: (id: number) => adminOrderApi.process(id),
  outForDeliveryOrder: (id: number) => adminOrderApi.outForDelivery(id),
  shipOrder: (id: number, trackingData: { trackingNumber: string; carrier?: string }) =>
    adminOrderApi.ship(id, trackingData),
  deliverOrder: (id: number) => adminOrderApi.deliver(id),
  cancelOrder: (id: number, reason: string) => adminOrderApi.cancel(id, reason),
  refundOrder: (id: number, amount: number, reason?: string) => adminOrderApi.refund(id, amount, reason),
  updateOrderPaymentStatus: (id: number, status: string) => adminOrderApi.updatePaymentStatus(id, status),
  deleteOrder: (id: number) => adminOrderApi.delete(id),
  getOrders: (params?: any) => adminOrderApi.getOrders(params),
  getOrderById: (id: number) => adminOrderApi.getOrderById(id),
  getOrderStatistics: () => adminOrderApi.getStatistics(),
  updateOrder: (id: number, data: any) => adminOrderApi.update(id, data),
};

export default adminApi;
