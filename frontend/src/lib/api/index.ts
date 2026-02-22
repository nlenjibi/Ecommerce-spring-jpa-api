/**
 * API Client - Main Entry Point
 *
 * Import from '@/lib/api' for endpoint clients.
 */

import { apiClient, sellerApiClient, request, sellerRequest } from './core/client';
import { authApi } from './endpoints/auth.api';
import { productsApi } from './endpoints/products.api';
import { categoriesApi } from './endpoints/categories.api';
import { cartApi } from './endpoints/cart.api';
import { ordersApi } from './endpoints/orders.api';
import { reviewsApi } from './endpoints/reviews.api';
import { wishlistApi, wishlistUtils } from './endpoints/wishlist.api';
import { newsletterApi } from './endpoints/newsletter.api';
import { sellerApi } from './endpoints/seller.api';
import {
  adminApi,
  adminProductApi,
  adminCategoryApi,
  adminOrderApi,
  adminUserApi,
  adminReviewApi,
  adminPromotionApi,
  adminSettingsApi,
  adminPerformanceApi,
} from './endpoints/admin.api';
import { contactApi } from './endpoints/contact.api';
import { helpSupportApi } from './endpoints/help-support.api';

export { apiClient, sellerApiClient, request, sellerRequest };
export type { ApiResponse, PaginatedApiResponse } from '@/types/api';
export type { Paginated } from '@/types';

export { authApi };
export { productsApi };
export { categoriesApi };
export { cartApi };
export { ordersApi };
export { reviewsApi };
export { wishlistApi, wishlistUtils };
export { newsletterApi };
export { sellerApi };
export {
  adminApi,
  adminProductApi,
  adminCategoryApi,
  adminOrderApi,
  adminUserApi,
  adminReviewApi,
  adminPromotionApi,
  adminSettingsApi,
  adminPerformanceApi,
};
export { contactApi };
export { helpSupportApi };

// Compatibility aliases used across older parts of the app.
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    request<any>({
      method: 'GET',
      url: '/v1/admin/users',
      params,
    }),
  create: adminUserApi.create,
  update: adminUserApi.update,
  delete: adminUserApi.delete,
  updateRole: adminUserApi.updateRole,
};

export const analyticsApi = {
  // Best-effort no-op to avoid runtime crashes where analytics backend is absent.
  trackEvent: async (_event: any) => ({ success: true }),
};

export const stripeApi = {
  // Uses Next.js API route used by payment service.
  createPaymentIntent: async (amount: number) => {
    const response = await fetch('/api/payments/stripe/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  },
};

export default {
  authApi,
  productsApi,
  categoriesApi,
  cartApi,
  ordersApi,
  reviewsApi,
  wishlistApi,
  newsletterApi,
  sellerApi,
  adminApi,
  contactApi,
  helpSupportApi,
  usersApi,
  analyticsApi,
  stripeApi,
};
