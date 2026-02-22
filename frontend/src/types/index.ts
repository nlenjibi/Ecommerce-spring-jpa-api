// ==================== Re-export all types ====================
export * from './api';
export * from './database';
export * from './forms';
export * from './next';
export * from './auth';
// export * from './product';
// export * from './order';
// export * from './review';

// ==================== Core Enums ====================
export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum FulfillmentType {
  SHIPPED = 'SHIPPED',
  IN_STORE_PICKUP = 'IN_STORE_PICKUP',
  EXPRESS_DELIVERY = 'EXPRESS_DELIVERY',
  INTERNATIONAL_SHIPPING = 'INTERNATIONAL_SHIPPING',
}

export enum ProductCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  REFURBISHED = 'REFURBISHED',
  USED = 'USED',
}

export enum SellerType {
  OFFICIAL = 'OFFICIAL',
  VERIFIED = 'VERIFIED',
  THIRD_PARTY = 'THIRD_PARTY',
}

export enum PromotionType {
  DISCOUNT = 'DISCOUNT',
  FLASH_SALE = 'FLASH_SALE',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export enum DeliveryMethod {
  BUS_STATION = 'BUS_STATION',
  DIRECT_ADDRESS = 'DIRECT_ADDRESS',
  HOME_DELIVERY = 'HOME_DELIVERY',
  SHIPPING = 'SHIPPING',
}

export enum SocialPlatform {
  X = 'X',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TELEGRAM = 'TELEGRAM',
  TIKTOK = 'TIKTOK',
  YOUTUBE = 'YOUTUBE',
  WHATSAPP = 'WHATSAPP',
}

export enum AppPlatform {
  APPLE_APP_STORE = 'APPLE_APP_STORE',
  GOOGLE_PLAY_STORE = 'GOOGLE_PLAY_STORE',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SELLER = 'seller',
  CUSTOMER = 'customer',
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string | null;
  isActive: boolean;
}

// ==================== Base Interfaces ====================
export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimestampedEntity extends BaseEntity {
  createdAt: string;
  updatedAt: string;
}

// ==================== Utility Types ====================
export type Paginated<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
};

export type SortDirection = 'asc' | 'desc';
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

// ==================== Review Types ====================
export interface UserReview {
  id: number;
  productId: number;
  productSlug:string,
  userId: number;
  userName?: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  unhelpfulCount?: number;
  response?: string;
  adminResponse?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  images?: Array<{ url: string }>;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  response?: string;
  createdAt: string;
  updatedAt?: string;
}
