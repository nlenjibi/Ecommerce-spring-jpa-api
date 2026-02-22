// Wishlist Components Index
export { PriceHistoryChart } from './PriceHistoryChart';
export { ReminderManager } from './ReminderManager';
export { PriceNotificationManager } from './PriceNotificationManager';
export { GuestWishlistManager } from './GuestWishlistManager';
export { ImportExportTools } from './ImportExportTools';
export { WishlistAnalytics } from './WishlistAnalytics';
export { CollectionManager } from './CollectionManager';

// Re-export for convenience
export type { 
  WishlistItem, 
  WishlistPriority, 
  WishlistSummary, 
  WishlistAnalytics as AnalyticsType,
  AddToWishlistRequest,
  UpdateWishlistItemRequest,
  WishlistOptimizationRequest
} from '@/context/WishlistContext';