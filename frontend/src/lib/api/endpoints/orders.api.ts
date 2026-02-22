import { request } from '../core/client';
import { StandardResponse, PaginatedResponse } from '@/lib/api/core/types';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: string;
  trackingNumber?: string;
  carrier?: string;
  orderDate: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    productImageUrl?: string;
    productSku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  itemCount: number;
  customerNotes?: string;
  customerEmail: string;
  adminNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundReason?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

/**
 * Orders API
 */
export const ordersApi = {
  /**
   * Get user's orders (also used for admin with filters)
   */
  getAll: (params?: {
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
    request<PaginatedResponse<Order>>({
      method: 'GET',
      url: '/v1/orders',
      params,
    }),

  /**
   * Get order by ID
   */
  getById: (id: number) =>
    request<StandardResponse<Order>>({
      method: 'GET',
      url: `/v1/orders/${id}`,
    }),

  /**
   * Get order by order number
   */
  getByOrderNumber: (orderNumber: string) =>
    request<StandardResponse<Order>>({
      method: 'GET',
      url: `/v1/orders/number/${orderNumber}`,
    }),

  /**
   * Create order from cart (checkout)
   */
  createFromCart: (cartId: number, data?: {
    shippingAddress?: string;
    shippingMethod?: string;
    shippingCost?: number;
    paymentMethod?: string;
    customerNotes?: string;
  }) =>
    request<StandardResponse<Order>>({
      method: 'POST',
      url: `/v1/orders/from-cart/${cartId}`,
      data,
    }),

  /**
   * Update order as customer (only PENDING orders)
   */
  updateAsCustomer: (id: number, data: {
    shippingAddress?: string;
    customerNotes?: string;
  }) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/customer/${id}`,
      data,
    }),

  /**
   * Cancel order
   */
  cancel: (id: number, reason?: string) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/${id}/cancel`,
      params: { reason },
    }),

  /**
   * Track order
   */
  track: (id: number) =>
    request<StandardResponse<{
      trackingNumber?: string;
      carrier?: string;
      status: string;
      history: Array<{
        status: string;
        timestamp: string;
        location?: string;
        description?: string;
      }>;
    }>>({
      method: 'GET',
      url: `/v1/orders/${id}/track`,
    }),

  /**
   * Get order invoice
   */
  getInvoice: (id: number) =>
    request<StandardResponse<{
      invoiceUrl: string;
    }>>({
      method: 'GET',
      url: `/v1/orders/${id}/invoice`,
    }),

  /**
   * Update item quantity in order
   */
  updateItemQuantity: (orderId: number, productId: number, quantity: number) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/${orderId}/items/${productId}`,
      params: { quantity },
    }),

  /**
   * Add item to order
   */
  addItem: (orderId: number, productId: number, quantity: number = 1) =>
    request<StandardResponse<Order>>({
      method: 'POST',
      url: `/v1/orders/${orderId}/items`,
      params: { productId, quantity },
    }),

  /**
   * Remove item from order
   */
  removeItem: (orderId: number, productId: number) =>
    request<StandardResponse<Order>>({
      method: 'DELETE',
      url: `/v1/orders/${orderId}/items/${productId}`,
    }),

  // ==================== Admin Endpoints ====================

  /**
   * Get order statistics (Admin)
   */
  getStatistics: () =>
    request<StandardResponse<OrderStats>>({
      method: 'GET',
      url: '/v1/orders/admin/statistics',
    }),

  /**
   * Count orders by user (Admin)
   */
  countByUser: (userId: number) =>
    request<StandardResponse<number>>({
      method: 'GET',
      url: `/v1/orders/admin/count/user/${userId}`,
    }),

  /**
   * Count orders by status (Admin)
   */
  countByStatus: (status: string) =>
    request<StandardResponse<number>>({
      method: 'GET',
      url: `/v1/orders/admin/count/status/${status}`,
    }),

  /**
   * Check if order exists (Admin)
   */
  exists: (orderId: number) =>
    request<StandardResponse<boolean>>({
      method: 'GET',
      url: `/v1/orders/admin/exists/${orderId}`,
    }),

  /**
   * Confirm order (Admin)
   */
  confirm: (id: number) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/confirm`,
    }),

  /**
   * Process order (Admin)
   */
  process: (id: number) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/process`,
    }),

  /**
   * Mark order as out for delivery (Admin)
   */
  outForDelivery: (id: number) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/out-for-delivery`,
    }),

  /**
   * Ship order (Admin)
   */
  ship: (id: number, trackingNumber: string, carrier?: string) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/ship`,
      params: { trackingNumber, carrier },
    }),

  /**
   * Mark order as delivered (Admin)
   */
  deliver: (id: number) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/deliver`,
    }),

  /**
   * Refund order (Admin)
   */
  refund: (id: number, amount: number, reason: string) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/refund`,
      params: { amount, reason },
    }),

  /**
   * Update order (Admin)
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
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}`,
      data,
    }),

  /**
   * Update order status (Admin)
   */
  updateStatus: (id: number, status: string) =>
    request<StandardResponse<Order>>({
      method: 'PATCH',
      url: `/v1/orders/admin/${id}/status`,
      params: { status },
    }),

  /**
   * Update payment status (Admin)
   */
  updatePaymentStatus: (id: number, status: string) =>
    request<StandardResponse<Order>>({
      method: 'PUT',
      url: `/v1/orders/admin/${id}/payment-status`,
      params: { status },
    }),

  /**
   * Delete order (Admin)
   */
  delete: (id: number) =>
    request<StandardResponse<void>>({
      method: 'DELETE',
      url: `/v1/orders/${id}`,
    }),
};
