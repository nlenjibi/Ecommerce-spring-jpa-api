/**
 * Wishlist Types
 */

export type WishlistPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  categoryName: string;
  inStock: boolean;
  availableQuantity: number;
  inventoryStatus: string;
}

export interface WishlistItem {
  id: number;
  userId: number;
  product: Product;
  notes?: string;
  priority: WishlistPriority;
  desiredQuantity: number;
  priceWhenAdded: number;
  currentPrice: number;
  priceDifference: number;
  isPriceDropped: boolean;
  targetPrice?: number;
  notifyOnPriceDrop: boolean;
  notifyOnStock: boolean;
  shouldNotifyPriceDrop: boolean;
  shouldNotifyStock: boolean;
  purchased: boolean;
  isPublic: boolean;
  inStock: boolean;
  addedAt: string;
  purchasedAt?: string;
  collectionName?: string;
}

export interface AddToWishlistRequest {
  productId: number;
  notes?: string;
  priority?: WishlistPriority;
  desiredQuantity?: number;
  targetPrice?: number;
  notifyOnPriceDrop?: boolean;
  notifyOnStock?: boolean;
  isPublic?: boolean;
}

export interface UpdateWishlistItemRequest {
  notes?: string;
  priority?: WishlistPriority;
  desiredQuantity?: number;
  targetPrice?: number;
  notifyOnPriceDrop?: boolean;
  notifyOnStock?: boolean;
  isPublic?: boolean;
}

export interface WishlistSummary {
  userId: number;
  totalItems: number;
  inStockItems: number;
  outOfStockItems: number;
  itemsWithPriceDrops: number;
  purchasedItems: number;
  totalValue: number;
  totalSavings: number;
  items: WishlistItem[];
}

export interface WishlistAnalytics {
  userId: number;
  totalItems: number;
  itemsAddedThisMonth: number;
  itemsPurchased: number;
  itemsWithPriceDrops: number;
  averagePriceDrop: number;
  totalSavings: number;
  mostAddedCategory: string;
  highestPriorityCategory: string;
  averageDaysInWishlist: number;
  categoryBreakdown: Array<{
    categoryName: string;
    itemCount: number;
    totalValue: number;
    averagePrice: number;
  }>;
}

export interface PriceHistoryItem {
  productId: number;
  productName: string;
  timestamp: string;
  price: number;
  discountPrice?: number;
  percentageChange?: number;
}

export interface GuestSessionResponse {
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  itemCount: number;
}

export interface ShareWishlistRequest {
  shareName?: string;
  description?: string;
  allowPurchaseTracking?: boolean;
  showPrices?: boolean;
  expiresAt?: string;
  productIds?: number[];
  password?: string;
}

export interface ShareWishlistResponse {
  shareToken: string;
  shareUrl: string;
  shareName: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  itemCount: number;
  isActive: boolean;
  passwordProtected: boolean;
}

export interface OptimizeWishlistRequest {
  maxBudget?: number;
  priorityOrder?: string[];
  includeOnlyInStock?: boolean;
  maxItems?: number;
  optimizationStrategy?: 'BUDGET' | 'PRIORITY' | 'SAVINGS' | 'AVAILABILITY';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
  timestamp: string;
  path: string;
  statusCode: number;
}
