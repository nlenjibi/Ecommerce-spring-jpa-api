/**
 * API Client - Main Entry Point
 * 
 * This file exports all API modules and utilities.
 * Import from '@/api' to access any API functionality.
 * 
 * @example
 * import { authApi, productsApi, cartApi } from '@/api';
 * 
 * // Use individual APIs
 * const products = await productsApi.getAll();
 * const user = await authApi.getProfile();
 */

// ============ CORE ============
export { apiClient, sellerApiClient, request, sellerRequest } from '../core/client';
export type { ApiResponse } from '@/types/api';

// ============ AUTHENTICATION ============
export { authApi } from './auth.api';

// ============ PRODUCTS ============
export { productsApi } from './products.api';
export type { ProductFilters, ProductImageParams, ProductVariantParams } from './products.api';

// ============ CATEGORIES ============
export { categoriesApi } from './categories.api';
export type { Category } from './categories.api';

// ============ CART ============
export { cartApi } from './cart.api';
export type { Cart, CartItem } from './cart.api';

// ============ ORDERS ============
export { ordersApi } from './orders.api';
export type { Order } from './orders.api';

// ============ REVIEWS ============
export { reviewsApi } from './reviews.api';
export type {
  Review,
  ReviewFilters,
  CreateReviewData,
  UpdateReviewData,
  ReviewStats,
  ReviewsResponse,
} from './reviews.api';

// ============ WISHLIST ============
export { wishlistApi, wishlistUtils } from './wishlist.api';
export type {
  WishlistPriority,
  Product,
  WishlistItem,
  AddToWishlistRequest,
  UpdateWishlistItemRequest,
  WishlistSummary,
  WishlistAnalytics,
  PriceHistoryItem,
  GuestSessionResponse,
  ShareWishlistRequest,
  ShareWishlistResponse,
  OptimizeWishlistRequest,
} from './wishlist.types';

// ============ SELLER ============
export { sellerApi } from './seller.api';
export type {
  DashboardStats,
  ProductParams,
  CreateProductData,
  OrderParams,
  UpdateOrderStatusData,
  TrackingData,
  SalesAnalyticsParams,
  PayoutParams,
  RequestPayoutData,
  ReviewParams,
  UpdateStoreData,
} from './seller.api';

// ============ ADMIN ============
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
} from './admin.api';
export type {
  ProductCreateRequest,
  ProductUpdateRequest,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  UserCreateRequest,
  UserUpdateRequest,
  PromotionCreateRequest,
  PromotionUpdateRequest,
} from './admin.api';

// ============ DEFAULT EXPORT ============
/**
 * Default export containing all APIs for convenience
 */
export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  orders: ordersApi,
  reviews: reviewsApi,
  wishlist: wishlistApi,
  seller: sellerApi,
  admin: adminApi,
};
