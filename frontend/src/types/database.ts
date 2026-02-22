import {
  StockStatus,
  FulfillmentType,
  ProductCondition,
  SellerType,
  PromotionType,
  DeliveryMethod,
  UserRole,
  ReviewStatus,
  BaseEntity,
  TimestampedEntity
} from './index';

// ==================== User & Auth Types ====================
export interface User extends TimestampedEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  lastLogin?: string;
}

export interface UserProfile {
  userId: number;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  preferences?: Record<string, any>;
}

// ==================== Product Types ====================
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  productCount?: number;
}

export interface Product extends TimestampedEntity {
  name: string;
  description?: string;
  price: number;
  effectivePrice?: number;
  discountPrice?: number;
  originalPrice?: number;
  compareAtPrice?: number;
  imageUrl?: string | null;
  image?: string;
  images?: string[];
  category?: Category | null;
  categoryName?: string;
  categoryId?: number | null;
  sku?: string;
  slug?: string;
  stockQuantity?: number;
  stock?: number;
  inStock?: boolean;
  stockStatus?: StockStatus;
  fulfillmentType?: FulfillmentType;
  condition?: ProductCondition;
  seller?: SellerInfo;
  promotion?: Promotion;
  discountPercentage?: number;
  rating?: number;
  reviews?: number;
  isTrending?: boolean;
  isMostPurchased?: boolean;
  isRecommendedForYou?: boolean;
  isRecentlyViewed?: boolean;
  featured?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  specifications?: Record<string, any>;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface SellerInfo {
  id: number;
  name: string;
  type: SellerType;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  responseTime?: string;
  returnRate?: number;
  joinedAt?: string;
}

export interface Promotion {
  id: number;
  type: PromotionType;
  discountPercentage?: number;
  discountAmount?: number;
  startDate?: string;
  endDate?: string;
  minPurchase?: number;
  maxDiscount?: number;
  code?: string;
  isActive: boolean;
}

// ==================== Order Types ====================
export interface Order extends TimestampedEntity {
  orderNumber?: string;
  userId?: number;
  items: OrderItem[];
  customerEmail: string;
  customerName: string;
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  shippingCost: number;
  tax: number;
  taxRate: number;
  couponDiscount?: number;
  total: number;
  totalAmount?: number;
  status: string;
  paymentStatus: string;
  customerNotes?: string;
  couponCode?: string;
  shippingAddress?: ShippingAddress;
  deliveryDetails?: DeliveryDetails;
  timeline?: OrderTimeline[];
  trackingNumber?: string;
  carrier?: string;
  orderDate: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

export interface DeliveryDetails {
  method: DeliveryMethod;
  busStationId?: number;
  busStationName?: string;
  addressId?: number;
  region?: string;
  town?: string;
  street?: string;
  phone?: string;
  fee: number;
  estimatedDays: number;
}

// ==================== Review Types ====================
export interface Review extends TimestampedEntity {
  productId: number;
  userId: number;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  verified: boolean;
  helpfulCount: number;
  userMarkedHelpful?: boolean;
  userReported?: boolean;
  recommended?: boolean;
  images?: string[];
  adminResponse?: string;
  adminResponseDate?: string;
  rejectionReason?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchaseReviews: number;
  recommendedCount: number;
  notRecommendedCount: number;
}

// ==================== Cart & Wishlist Types ====================
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface WishlistItem {
  id: number;
  product: Product;
  addedAt: string;
}

// ==================== Analytics Types ====================
export interface AnalyticsEvent {
  id: number;
  type: string;
  userId?: number;
  productId?: number;
  categoryId?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  productsSold: number;
}
