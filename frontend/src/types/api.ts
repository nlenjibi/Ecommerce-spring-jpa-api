import { Paginated } from './index';
import { User, Product, Order, Review } from './database';

// ==================== Base API Response Types ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedApiResponse<T> extends ApiResponse<Paginated<T>> { }

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  path: string;
  statusCode: number;
}

// ==================== API Request Types ====================
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  query: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface FilterParams extends PaginationParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  trending?: boolean;
}

// ==================== Auth API Types ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// ==================== Product API Types ====================
export interface ProductsResponse extends PaginatedApiResponse<Product> { }
export interface ProductResponse extends ApiResponse<Product> { }

// ==================== Order API Types ====================
export interface OrdersResponse extends PaginatedApiResponse<Order> { }
export interface OrderResponse extends ApiResponse<Order> { }

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  shippingMethod: string;
  paymentMethod: string;
  customerEmail?: string;
  customerName?: string;
  couponCode?: string;
  taxRate?: number;
  customerNotes?: string;
  shippingAddress?: string;
  subtotal?: number;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
  totalAmount?: number;
  couponDiscount?: number;
  busStationId?: number;
  addressId?: number;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderResponse extends ApiResponse<Order> { }

// ==================== Review API Types ====================
export interface ReviewsResponse extends PaginatedApiResponse<Review> { }
export interface ReviewResponse extends ApiResponse<Review> { }

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  title: string;
  comment: string;
  recommended?: boolean;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  recommended?: boolean;
  images?: string[];
}

// ==================== Cart & Wishlist API Types ====================
export interface CartItemResponse {
  id: number;
  product: Product;
  quantity: number;
}

export interface CartResponse extends ApiResponse<{
  items: CartItemResponse[];
  total: number;
  itemCount: number;
}> { }

export interface WishlistResponse extends ApiResponse<{
  items: Array<{
    id: number;
    product: Product;
    addedAt: string;
  }>;
  itemCount: number;
}> { }

// ==================== Coupon API Types ====================
export interface CouponResponse extends ApiResponse<{
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minPurchase?: number;
  maxDiscount?: number;
  isValid: boolean;
  message?: string;
}> { }

// ==================== Upload API Types ====================
export interface UploadResponse extends ApiResponse<{
  url: string;
  key: string;
  filename: string;
  size: number;
}> { }
