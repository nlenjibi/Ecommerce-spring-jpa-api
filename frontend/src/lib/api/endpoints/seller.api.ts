import { sellerRequest } from '../core/client';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  monthOrders: number;
  orderTrend: 'up' | 'down';
  earningsChange: string;
}

export interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  sortBy?: string;
  sortDir?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  categoryId?: number;
  images: string[];
  tags?: string[];
  specifications?: any;
  isActive: boolean;
}

export interface OrderParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateOrderStatusData {
  status: 'processing' | 'shipped';
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}

export interface TrackingData {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
}

export interface SalesAnalyticsParams {
  period?: 'day' | 'week' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

export interface PayoutParams {
  page?: number;
  limit?: number;
}

export interface RequestPayoutData {
  amount: number;
  method: string;
  bankDetails?: any;
  mobileMoneyDetails?: any;
}

export interface ReviewParams {
  page?: number;
  limit?: number;
  rating?: number;
  productId?: number;
}

export interface UpdateStoreData {
  name?: string;
  description?: string;
  contactEmail?: string;
  phoneNumber?: string;
  address?: string;
  businessHours?: any;
  socialLinks?: any;
}

/**
 * Seller API
 */
export const sellerApi = {
  // ============ DASHBOARD & OVERVIEW ============

  /**
   * Get dashboard statistics
   */
  getDashboardStats: () =>
    sellerRequest<DashboardStats>({
      method: 'GET',
      url: '/v1/seller/dashboard/stats',
    }),

  // ============ PRODUCT MANAGEMENT ============

  /**
   * Get seller's products
   */
  getProducts: (params?: ProductParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDir) query.append('sortDir', params.sortDir);

    return sellerRequest<{
      products: any[];
      total: number;
      page: number;
      totalPages: number;
    }>({
      method: 'GET',
      url: `/v1/seller/products?${query.toString()}`,
    });
  },

  /**
   * Create new product
   */
  createProduct: (productData: CreateProductData) =>
    sellerRequest<{ product: any }>({
      method: 'POST',
      url: '/v1/seller/products',
      data: productData,
    }),

  /**
   * Update product
   */
  updateProduct: (productId: number, productData: Partial<CreateProductData>) =>
    sellerRequest<{ product: any }>({
      method: 'PUT',
      url: `/v1/seller/products/${productId}`,
      data: productData,
    }),

  /**
   * Delete product
   */
  deleteProduct: (productId: number) =>
    sellerRequest<{ message: string }>({
      method: 'DELETE',
      url: `/v1/seller/products/${productId}`,
    }),

  /**
   * Update product status
   */
  updateProductStatus: (productId: number, status: 'active' | 'inactive') =>
    sellerRequest<{ product: any }>({
      method: 'PATCH',
      url: `/v1/seller/products/${productId}/status`,
      data: { status },
    }),

  /**
   * Upload product images
   */
  uploadProductImages: (productId: number, formData: FormData) =>
    sellerRequest<{ images: any[] }>({
      method: 'POST',
      url: `/v1/seller/products/${productId}/images`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // ============ ORDER MANAGEMENT ============

  /**
   * Get seller's orders
   */
  getOrders: (params?: OrderParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);

    return sellerRequest<{
      orders: any[];
      total: number;
      page: number;
      totalPages: number;
    }>({
      method: 'GET',
      url: `/v1/seller/orders?${query.toString()}`,
    });
  },

  /**
   * Get order by ID
   */
  getOrderById: (orderId: number) =>
    sellerRequest<{ order: any }>({
      method: 'GET',
      url: `/v1/seller/orders/${orderId}`,
    }),

  /**
   * Update order status
   */
  updateOrderStatus: (orderId: number, statusData: UpdateOrderStatusData) =>
    sellerRequest<{ order: any }>({
      method: 'PUT',
      url: `/v1/seller/orders/${orderId}/status`,
      data: statusData,
    }),

  /**
   * Add tracking information
   */
  addTrackingInfo: (orderId: number, trackingData: TrackingData) =>
    sellerRequest<{ order: any }>({
      method: 'PUT',
      url: `/v1/seller/orders/${orderId}/tracking`,
      data: trackingData,
    }),

  // ============ ANALYTICS ============

  /**
   * Get sales analytics
   */
  getSalesAnalytics: (params?: SalesAnalyticsParams) => {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params?.dateTo) query.append('dateTo', params.dateTo);

    return sellerRequest<{
      salesData: Array<{
        date: string;
        revenue: number;
        orders: number;
        products: number;
      }>;
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
      growth: {
        revenue: number;
        orders: number;
      };
    }>({
      method: 'GET',
      url: `/v1/seller/analytics/sales?${query.toString()}`,
    });
  },

  /**
   * Get product analytics
   */
  getProductAnalytics: () =>
    sellerRequest<{
      topProducts: Array<{
        id: number;
        name: string;
        sku: string;
        sales: number;
        revenue: number;
        views: number;
        conversionRate: number;
      }>;
      lowPerforming: Array<{
        id: number;
        name: string;
        sales: number;
        revenue: number;
        issues: string[];
      }>;
      categoryBreakdown: Array<{
        category: string;
        products: number;
        revenue: number;
        percentage: number;
      }>;
    }>({
      method: 'GET',
      url: '/v1/seller/analytics/products',
    }),

  // ============ INVENTORY MANAGEMENT ============

  /**
   * Get inventory
   */
  getInventory: () =>
    sellerRequest<{
      products: Array<{
        id: number;
        name: string;
        sku: string;
        currentStock: number;
        reorderPoint: number;
        status: 'in-stock' | 'low-stock' | 'out-of-stock';
        lastUpdated: string;
      }>;
      lowStock: number;
      outOfStock: number;
    }>({
      method: 'GET',
      url: '/v1/seller/inventory',
    }),

  /**
   * Update inventory
   */
  updateInventory: (
    productId: number,
    stockData: {
      stock: number;
      reorderPoint?: number;
      notes?: string;
    }
  ) =>
    sellerRequest<{ product: any }>({
      method: 'PUT',
      url: `/v1/seller/inventory/${productId}`,
      data: stockData,
    }),

  // ============ PAYOUTS & EARNINGS ============

  /**
   * Get payouts
   */
  getPayouts: (params?: PayoutParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return sellerRequest<{
      payouts: Array<{
        id: number;
        amount: number;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        period: string;
        created: string;
        processed?: string;
        method: string;
        details?: string;
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>({
      method: 'GET',
      url: `/v1/seller/payouts?${query.toString()}`,
    });
  },

  /**
   * Get earnings summary
   */
  getEarningsSummary: () =>
    sellerRequest<{
      totalEarnings: number;
      availableBalance: number;
      pendingAmount: number;
      lastPayout?: number;
      nextPayoutDate?: string;
      currentMonthEarnings: number;
      previousMonthEarnings: number;
      growth: number;
    }>({
      method: 'GET',
      url: '/v1/seller/earnings/summary',
    }),

  /**
   * Request payout
   */
  requestPayout: (payoutData: RequestPayoutData) =>
    sellerRequest<{ payout: any }>({
      method: 'POST',
      url: '/v1/seller/payouts/request',
      data: payoutData,
    }),

  // ============ REVIEWS ============

  /**
   * Get reviews
   */
  getReviews: (params?: ReviewParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.rating) query.append('rating', params.rating.toString());
    if (params?.productId) query.append('productId', params.productId.toString());

    return sellerRequest<{
      reviews: Array<{
        id: number;
        productId: number;
        productName: string;
        customerName: string;
        rating: number;
        title: string;
        comment: string;
        verified: boolean;
        helpfulCount: number;
        createdAt: string;
        sellerResponse?: string;
      }>;
      total: number;
      page: number;
      totalPages: number;
      averageRating: number;
      ratingDistribution: Array<{
        rating: number;
        count: number;
      }>;
    }>({
      method: 'GET',
      url: `/v1/seller/reviews?${query.toString()}`,
    });
  },

  /**
   * Respond to review
   */
  respondToReview: (reviewId: number, response: string) =>
    sellerRequest<{ review: any }>({
      method: 'POST',
      url: `/v1/seller/reviews/${reviewId}/respond`,
      data: { response },
    }),

  // ============ STORE PROFILE & SETTINGS ============

  /**
   * Get store profile
   */
  getStoreProfile: () =>
    sellerRequest<{
      store: {
        id: number;
        name: string;
        description: string;
        logo: string;
        banner: string;
        contactEmail: string;
        phoneNumber: string;
        address: string;
        businessHours: any;
        socialLinks: any;
        verificationStatus: 'pending' | 'verified' | 'rejected';
        verificationDocuments?: any[];
      };
    }>({
      method: 'GET',
      url: '/v1/seller/store/profile',
    }),

  /**
   * Update store profile
   */
  updateStoreProfile: (storeData: UpdateStoreData) =>
    sellerRequest<{ store: any }>({
      method: 'PUT',
      url: '/v1/seller/store/profile',
      data: storeData,
    }),

  /**
   * Upload store logo
   */
  uploadStoreLogo: (formData: FormData) =>
    sellerRequest<{ logo: string }>({
      method: 'POST',
      url: '/v1/seller/store/logo',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Upload store banner
   */
  uploadStoreBanner: (formData: FormData) =>
    sellerRequest<{ banner: string }>({
      method: 'POST',
      url: '/v1/seller/store/banner',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
