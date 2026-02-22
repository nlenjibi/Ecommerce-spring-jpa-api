import { API_BASE_URL, STORAGE_KEYS } from '@/lib/constants/constants';
import * as Types from './wishlist.types';

// Simple UUID generator
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const API_BASE = `${API_BASE_URL}/v1/wishlist`;

// ==================== Helper Functions ====================

const getApiHeaders = (token: string | null = null): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON response, got ${contentType}: ${text.substring(0, 100)}`);
  }

  const data: any = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return data.data as T;
};

const handleApiError = (error: any, operation: string): never => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[Wishlist API] ${operation} failed:`, error);
  throw new Error(`${operation} failed: ${errorMessage}`);
};

// ==================== Authenticated User API ====================

export const wishlistApi = {
  /**
   * Get user's wishlist
   */
  getUserWishlist: async (
    userId: number,
    token: string | null
  ): Promise<Types.WishlistItem[]> => {
    try {
      const response = await fetch(`${API_BASE}?userId=${userId}`, {
        method: 'GET',
        headers: getApiHeaders(token),
      });
      return await parseResponse<Types.WishlistItem[]>(response);
    } catch (error) {
      handleApiError(error, 'Get wishlist');
    }
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (
    userId: number,
    token: string | null,
    request: Types.AddToWishlistRequest
  ): Promise<Types.WishlistItem> => {
    try {
      const response = await fetch(`${API_BASE}?userId=${userId}`, {
        method: 'POST',
        headers: getApiHeaders(token),
        body: JSON.stringify(request),
      });
      return await parseResponse<Types.WishlistItem>(response);
    } catch (error) {
      handleApiError(error, 'Add to wishlist');
    }
  },

  /**
   * Update wishlist item
   */
  updateWishlistItem: async (
    userId: number,
    productId: number,
    token: string | null,
    updates: Types.UpdateWishlistItemRequest
  ): Promise<Types.WishlistItem> => {
    try {
      const response = await fetch(`${API_BASE}/${productId}?userId=${userId}`, {
        method: 'PUT',
        headers: getApiHeaders(token),
        body: JSON.stringify(updates),
      });
      return await parseResponse<Types.WishlistItem>(response);
    } catch (error) {
      handleApiError(error, 'Update wishlist item');
    }
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (
    userId: number,
    productId: number,
    token: string | null
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/${productId}?userId=${userId}`, {
        method: 'DELETE',
        headers: getApiHeaders(token),
      });
      await parseResponse<void>(response);
    } catch (error) {
      handleApiError(error, 'Remove from wishlist');
    }
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async (userId: number, token: string | null): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/clear?userId=${userId}`, {
        method: 'DELETE',
        headers: getApiHeaders(token),
      });
      await parseResponse<void>(response);
    } catch (error) {
      handleApiError(error, 'Clear wishlist');
    }
  },

  /**
   * Get wishlist summary with statistics
   */
  getWishlistSummary: async (
    userId: number,
    token: string | null
  ): Promise<Types.WishlistSummary> => {
    try {
      const response = await fetch(`${API_BASE}/summary?userId=${userId}`, {
        method: 'GET',
        headers: getApiHeaders(token),
      });
      return await parseResponse<Types.WishlistSummary>(response);
    } catch (error) {
      handleApiError(error, 'Get wishlist summary');
    }
  },

  /**
   * Get wishlist analytics
   */
  getWishlistAnalytics: async (
    userId: number,
    token: string | null
  ): Promise<Types.WishlistAnalytics> => {
    try {
      const response = await fetch(`${API_BASE}/analytics?userId=${userId}`, {
        method: 'GET',
        headers: getApiHeaders(token),
      });
      return await parseResponse<Types.WishlistAnalytics>(response);
    } catch (error) {
      handleApiError(error, 'Get wishlist analytics');
    }
  },

  /**
   * Get price history for wishlist items
   */
  getPriceHistory: async (
    userId: number,
    token: string | null,
    productIds?: number[],
    days: number = 30
  ): Promise<Types.PriceHistoryItem[]> => {
    try {
      const params = new URLSearchParams({ userId: userId.toString(), days: days.toString() });
      if (productIds && productIds.length > 0) {
        params.append('productIds', productIds.join(','));
      }

      const response = await fetch(`${API_BASE}/price-history?${params.toString()}`, {
        method: 'GET',
        headers: getApiHeaders(token),
      });
      return await parseResponse<Types.PriceHistoryItem[]>(response);
    } catch (error) {
      handleApiError(error, 'Get price history');
    }
  },

  /**
   * Mark item as purchased
   */
  markAsPurchased: async (
    userId: number,
    productId: number,
    token: string | null
  ): Promise<Types.WishlistItem> => {
    try {
      const response = await fetch(`${API_BASE}/${productId}/purchase?userId=${userId}`, {
        method: 'POST',
        headers: getApiHeaders(token),
      });
      return await parseResponse<Types.WishlistItem>(response);
    } catch (error) {
      handleApiError(error, 'Mark as purchased');
    }
  },

  /**
   * Share wishlist
   */
  shareWishlist: async (
    userId: number,
    token: string | null,
    request: Types.ShareWishlistRequest
  ): Promise<Types.ShareWishlistResponse> => {
    try {
      const response = await fetch(`${API_BASE}/share?userId=${userId}`, {
        method: 'POST',
        headers: getApiHeaders(token),
        body: JSON.stringify(request),
      });
      return await parseResponse<Types.ShareWishlistResponse>(response);
    } catch (error) {
      handleApiError(error, 'Share wishlist');
    }
  },

  /**
   * Get shared wishlist
   */
  getSharedWishlist: async (shareToken: string): Promise<Types.WishlistSummary> => {
    try {
      const response = await fetch(`${API_BASE}/shared/${shareToken}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return await parseResponse<Types.WishlistSummary>(response);
    } catch (error) {
      handleApiError(error, 'Get shared wishlist');
    }
  },

  /**
   * Optimize wishlist
   */
  optimizeWishlist: async (
    userId: number,
    token: string | null,
    request: Types.OptimizeWishlistRequest
  ): Promise<Types.WishlistItem[]> => {
    try {
      const response = await fetch(`${API_BASE}/optimize?userId=${userId}`, {
        method: 'POST',
        headers: getApiHeaders(token),
        body: JSON.stringify(request),
      });
      return await parseResponse<Types.WishlistItem[]>(response);
    } catch (error) {
      handleApiError(error, 'Optimize wishlist');
    }
  },

  // ==================== Guest API ====================

  /**
   * Generate guest session
   */
  generateGuestSession: async (): Promise<Types.GuestSessionResponse> => {
    try {
      const response = await fetch(`${API_BASE}/guest/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const sessionData = await parseResponse<Types.GuestSessionResponse>(response);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, sessionData.sessionId);
      }

      return sessionData;
    } catch (error) {
      console.error('[Wishlist API] Guest session generation failed, using fallback:', error);
      
      const fallbackId = generateUUID();
      const fallbackData: Types.GuestSessionResponse = {
        sessionId: fallbackId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        itemCount: 0,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.GUEST_SESSION_ID, fallbackId);
      }

      return fallbackData;
    }
  },

  /**
   * Get guest wishlist
   */
  getGuestWishlist: async (guestSessionId: string): Promise<Types.WishlistItem[]> => {
    try {
      const response = await fetch(
        `${API_BASE}/guest?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return await parseResponse<Types.WishlistItem[]>(response);
    } catch (error) {
      console.error('[Wishlist API] Get guest wishlist failed:', error);
      return [];
    }
  },

  /**
   * Add to guest wishlist
   */
  addToGuestWishlist: async (
    guestSessionId: string,
    request: Types.AddToWishlistRequest
  ): Promise<Types.WishlistItem> => {
    try {
      const response = await fetch(
        `${API_BASE}/guest?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        }
      );
      return await parseResponse<Types.WishlistItem>(response);
    } catch (error) {
      handleApiError(error, 'Add to guest wishlist');
    }
  },

  /**
   * Remove from guest wishlist
   */
  removeFromGuestWishlist: async (
    guestSessionId: string,
    productId: number
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE}/guest/${productId}?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      await parseResponse<void>(response);
    } catch (error) {
      handleApiError(error, 'Remove from guest wishlist');
    }
  },

  /**
   * Clear guest wishlist
   */
  clearGuestWishlist: async (guestSessionId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE}/guest/clear?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      await parseResponse<void>(response);
    } catch (error) {
      handleApiError(error, 'Clear guest wishlist');
    }
  },

  /**
   * Merge guest wishlist to user account
   */
  mergeGuestWishlist: async (
    guestSessionId: string,
    userId: number,
    token: string | null
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE}/guest/merge?guestSessionId=${encodeURIComponent(guestSessionId)}&userId=${userId}`,
        {
          method: 'POST',
          headers: getApiHeaders(token),
        }
      );

      await parseResponse<void>(response);

      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION_ID);
        localStorage.removeItem(STORAGE_KEYS.GUEST_WISHLIST);
      }
    } catch (error) {
      handleApiError(error, 'Merge guest wishlist');
    }
  },

  /**
   * Get guest wishlist count
   */
  getGuestWishlistCount: async (guestSessionId: string): Promise<number> => {
    try {
      const response = await fetch(
        `${API_BASE}/guest/count?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return await parseResponse<number>(response);
    } catch (error) {
      console.error('[Wishlist API] Get guest count failed:', error);
      return 0;
    }
  },

  // ==================== Bulk Operations ====================

  /**
   * Add multiple products to wishlist
   */
  bulkAddToWishlist: async (
    userId: number,
    token: string | null,
    requests: Types.AddToWishlistRequest[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> => {
    try {
      const response = await fetch(`${API_BASE}/bulk/add?userId=${userId}`, {
        method: 'POST',
        headers: getApiHeaders(token),
        body: JSON.stringify(requests),
      });
      return await parseResponse<{
        successful: number;
        failed: number;
        errors: string[];
      }>(response);
    } catch (error) {
      handleApiError(error, 'Bulk add to wishlist');
    }
  },

  /**
   * Remove multiple products from wishlist
   */
  bulkRemoveFromWishlist: async (
    userId: number,
    token: string | null,
    productIds: number[]
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/bulk/remove?userId=${userId}`, {
        method: 'DELETE',
        headers: getApiHeaders(token),
        body: JSON.stringify(productIds),
      });
      await parseResponse<void>(response);
    } catch (error) {
      handleApiError(error, 'Bulk remove from wishlist');
    }
  },
};

// ==================== Utility Functions ====================

export const wishlistUtils = {
  /**
   * Check if product is in wishlist
   */
  isInWishlist: (wishlist: Types.WishlistItem[], productId: number): boolean => {
    return wishlist.some(item => item.product.id === productId);
  },

  /**
   * Get wishlist item by product ID
   */
  getWishlistItem: (
    wishlist: Types.WishlistItem[],
    productId: number
  ): Types.WishlistItem | undefined => {
    return wishlist.find(item => item.product.id === productId);
  },

  /**
   * Calculate total wishlist value
   */
  calculateWishlistValue: (wishlist: Types.WishlistItem[]): number => {
    return wishlist.reduce(
      (total, item) => total + item.currentPrice * item.desiredQuantity,
      0
    );
  },

  /**
   * Calculate total savings
   */
  calculateTotalSavings: (wishlist: Types.WishlistItem[]): number => {
    return wishlist.reduce((total, item) => total + item.priceDifference, 0);
  },

  /**
   * Filter wishlist items
   */
  filterWishlistItems: (
    wishlist: Types.WishlistItem[],
    filters: {
      priority?: Types.WishlistPriority;
      inStock?: boolean;
      priceDropped?: boolean;
      purchased?: boolean;
      collection?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Types.WishlistItem[] => {
    return wishlist.filter(item => {
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.inStock !== undefined && item.inStock !== filters.inStock) return false;
      if (filters.priceDropped !== undefined && item.isPriceDropped !== filters.priceDropped)
        return false;
      if (filters.purchased !== undefined && item.purchased !== filters.purchased) return false;
      if (filters.collection && item.collectionName !== filters.collection) return false;
      if (filters.minPrice !== undefined && item.currentPrice < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && item.currentPrice > filters.maxPrice) return false;
      return true;
    });
  },

  /**
   * Sort wishlist items
   */
  sortWishlistItems: (
    wishlist: Types.WishlistItem[],
    sortBy:
      | 'date-added'
      | 'price-low'
      | 'price-high'
      | 'priority'
      | 'savings'
      | 'name'
  ): Types.WishlistItem[] => {
    const sorted = [...wishlist];

    switch (sortBy) {
      case 'date-added':
        return sorted.sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
      case 'price-low':
        return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
      case 'price-high':
        return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
      case 'priority':
        const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return sorted.sort(
          (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
        );
      case 'savings':
        return sorted.sort((a, b) => b.priceDifference - a.priceDifference);
      case 'name':
        return sorted.sort((a, b) =>
          a.product.name.localeCompare(b.product.name)
        );
      default:
        return sorted;
    }
  },
};
