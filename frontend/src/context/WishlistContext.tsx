"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "./CartContext";
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/constants/constants';
import { getAuthToken } from '@/lib/utils/auth';
import { Product } from '@/types';

// ==================== Types ====================

export type WishlistPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type WishlistItem = {
  id: number;
  userId: number;
  productId: number;
  product: ProductSummary;
  notes?: string;
  priority: WishlistPriority;
  desiredQuantity: number;

  // Price tracking
  priceWhenAdded: number;
  currentPrice: number;
  priceDifference: number;
  isPriceDropped: boolean;
  targetPrice?: number;

  // Notifications
  notifyOnPriceDrop: boolean;
  notifyOnStock: boolean;
  shouldNotifyPriceDrop: boolean;
  shouldNotifyStock: boolean;

  // Status
  purchased: boolean;
  isPublic: boolean;
  inStock: boolean;

  // Collection & Organization
  collectionName?: string;
  tags?: string[];

  // Timestamps
  addedAt: string;
  purchasedAt?: string;

  // Reminder
  reminderEnabled?: boolean;
  reminderDate?: string;
};

// Helper to get productId safely from a wishlist item
export const getWishlistItemProductId = (item: WishlistItem): number => {
  return item.productId || item.product?.id;
};

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  categoryName?: string;
  inStock: boolean;
  availableQuantity?: number;
  inventoryStatus?: string;
};

export type WishlistSummary = {
  userId: number;
  totalItems: number;
  inStockItems: number;
  outOfStockItems: number;
  itemsWithPriceDrops: number;
  purchasedItems: number;
  totalValue: number;
  totalSavings: number;
  items: WishlistItem[];
};

export type AddToWishlistRequest = {
  productId: number;
  notes?: string;
  priority?: WishlistPriority;
  desiredQuantity?: number;
  targetPrice?: number;
  notifyOnPriceDrop?: boolean;
  notifyOnStock?: boolean;
  isPublic?: boolean;
  collectionName?: string;
  tags?: string[];
};

export type UpdateWishlistItemRequest = {
  notes?: string;
  priority?: WishlistPriority;
  desiredQuantity?: number;
  targetPrice?: number;
  notifyOnPriceDrop?: boolean;
  notifyOnStock?: boolean;
  isPublic?: boolean;
  collectionName?: string;
  tags?: string[];
};

export type WishlistAnalytics = {
  totalItems: number;
  itemsAddedThisMonth: number;
  itemsPurchased: number;
  itemsWithPriceDrops: number;
  averagePriceDrop: number;
  totalSavings: number;
  mostAddedCategory: string;
  categoryBreakdown: {
    categoryName: string;
    itemCount: number;
    totalValue: number;
    averagePrice: number;
  }[];
};

export type WishlistOptimizationRequest = {
  maxBudget?: number;
  priorityOrder?: string[];
  includeOnlyInStock?: boolean;
  maxItems?: number;
  optimizationStrategy?: "PRIORITY" | "PRICE" | "SAVINGS" | "BALANCED";
};

// ==================== Context Type ====================

type WishlistContextType = {
  // State
  wishlist: WishlistItem[];
  items: WishlistItem[];
  itemCount: number;
  summary: WishlistSummary | null;
  analytics: WishlistAnalytics | null;
  collections: string[];
  isLoading: boolean;
  isAuthenticated: boolean;

  // Basic Operations
  addToWishlist: (productId: number, options?: Partial<AddToWishlistRequest>) => Promise<boolean>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
  updateWishlistItem: (productId: number, updates: UpdateWishlistItemRequest) => Promise<boolean>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<boolean>;
  loadWishlist: () => Promise<void>;

  // Advanced Operations
  moveToCart: (productId: number) => Promise<void>;
  moveMultipleToCart: (productIds: number[]) => Promise<void>;
  bulkAddToCart: (productIds?: number[]) => Promise<void>;
  markAsPurchased: (productId: number) => Promise<void>;
  markMultipleAsPurchased: (productIds: number[]) => Promise<void>;

  // Collections & Organization
  getItemsByCollection: (collectionName: string) => WishlistItem[];
  getItemsByPriority: (priority: WishlistPriority) => WishlistItem[];
  getItemsByTags: (tags: string[]) => WishlistItem[];
  moveToCollection: (productIds: number[], collectionName: string) => Promise<void>;
  loadCollections: () => Promise<void>;

  // Price Tracking
  getItemsWithPriceDrops: () => WishlistItem[];
  getItemsBelowTargetPrice: () => WishlistItem[];

  // Purchase Status
  getPurchasedItems: () => WishlistItem[];
  getUnpurchasedItems: () => WishlistItem[];
  getAvailableItems: () => WishlistItem[];

  // Bulk Operations
  addMultipleToWishlist: (products: Product[], options?: Partial<AddToWishlistRequest>) => Promise<void>;
  removeMultipleFromWishlist: (productIds: number[]) => Promise<void>;

  // Summary & Analytics
  loadSummary: () => Promise<void>;
  loadAnalytics: () => Promise<void>;

  // Optimization
  optimizeWishlist: (options: WishlistOptimizationRequest) => Promise<WishlistItem[]>;

  // Sharing
  shareWishlist: (options?: { shareName?: string; description?: string }) => Promise<{ shareUrl: string; shareToken: string }>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// ==================== Provider ====================

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated: authIsAuthenticated } = useAuth();
  const isLoggedIn = authIsAuthenticated && !!user;
  const { addToCart } = useCart();

  // State
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [summary, setSummary] = useState<WishlistSummary | null>(null);
  const [analytics, setAnalytics] = useState<WishlistAnalytics | null>(null);
  const [collections, setCollections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = `${API_BASE_URL}/v1/wishlist`;

  // ==================== Helper Functions ====================

  const getHeaders = useCallback((): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const handleApiError = useCallback((error: any, operation: string, silent = false) => {
    console.error(`[Wishlist] ${operation} failed:`, error);
    if (!silent) {
      const message = error?.message || `Failed to ${operation.toLowerCase()}`;
      toast.error(message);
    }
  }, []);

  const parseApiResponse = useCallback(async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      throw new Error(`Non-JSON response: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    return data;
  }, []);

  const checkAuthAndShowMessage = useCallback((): boolean => {
    if (!isLoggedIn) {
      toast.error('Please log in to manage your wishlist', {
        duration: 4000,
        icon: '🔒',
      });
      return false;
    }
    return true;
  }, [isLoggedIn]);

  // ==================== Load Wishlist ====================

  const loadWishlist = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setWishlist([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}?userId=${user.id}`, {
        headers: getHeaders(),
      });

      if (response.status === 401) {
        console.warn('Wishlist API: Authentication token expired or invalid');
        setWishlist([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load wishlist');
      }

      const data = await parseApiResponse(response);
      // Map the backend response to include productId at top level for convenience
      const items = (data?.data || []).map((item: any) => ({
        ...item,
        productId: item.product?.id || item.productId,
      }));
      setWishlist(items);
    } catch (error) {
      handleApiError(error, 'Load wishlist', true);
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user, API_BASE, getHeaders, parseApiResponse, handleApiError]);

  // Load wishlist when user logs in
  useEffect(() => {
    if (isLoggedIn && user) {
      loadWishlist();
    } else {
      // Try to load from localStorage as fallback
      const localWishlist = localStorage.getItem('localWishlist');
      if (localWishlist) {
        try {
          const items = JSON.parse(localWishlist).map((item: any) => ({
            ...item,
            productId: item.product?.id || item.productId,
          }));
          setWishlist(items);
        } catch {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    }
  }, [isLoggedIn, user, loadWishlist]);

  // Persist wishlist to localStorage
  useEffect(() => {
    if (wishlist && wishlist.length > 0 && !isLoggedIn) {
      localStorage.setItem('localWishlist', JSON.stringify(wishlist));
    } else if (!isLoggedIn) {
      localStorage.removeItem('localWishlist');
    }
  }, [wishlist, isLoggedIn]);

  // ==================== Add to Wishlist ====================

  const addToWishlist = useCallback(async (
    productId: number,
    options: Partial<AddToWishlistRequest> = {}
  ): Promise<boolean> => {
    if (!checkAuthAndShowMessage()) {
      return false;
    }

    setIsLoading(true);
    try {
      const requestBody: AddToWishlistRequest = {
        productId,
        priority: options.priority || 'MEDIUM',
        desiredQuantity: options.desiredQuantity || 1,
        notes: options.notes,
        targetPrice: options.targetPrice,
        notifyOnPriceDrop: options.notifyOnPriceDrop ?? false,
        notifyOnStock: options.notifyOnStock ?? false,
        isPublic: options.isPublic ?? false,
        collectionName: options.collectionName,
        tags: options.tags,
      };

      const response = await fetch(`${API_BASE}?userId=${user!.id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await parseApiResponse(response);
        throw new Error(errorData?.message || 'Failed to add to wishlist');
      }

      await loadWishlist();
      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      handleApiError(error, 'Add to wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, parseApiResponse, loadWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Remove from Wishlist ====================

  const removeFromWishlist = useCallback(async (productId: number): Promise<boolean> => {
    if (!checkAuthAndShowMessage()) {
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${productId}?userId=${user!.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      await loadWishlist();
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      handleApiError(error, 'Remove from wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, loadWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Update Wishlist Item ====================

  const updateWishlistItem = useCallback(async (
    productId: number,
    updates: UpdateWishlistItemRequest
  ): Promise<boolean> => {
    if (!checkAuthAndShowMessage()) {
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${productId}?userId=${user!.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist item');
      }

      await loadWishlist();
      toast.success('Wishlist item updated');
      return true;
    } catch (error) {
      handleApiError(error, 'Update wishlist item');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, loadWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Clear Wishlist ====================

  const clearWishlist = useCallback(async (): Promise<boolean> => {
    if (!checkAuthAndShowMessage()) {
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/clear?userId=${user!.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }

      setWishlist([]);
      toast.success('Wishlist cleared');
      return true;
    } catch (error) {
      handleApiError(error, 'Clear wishlist');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, handleApiError, checkAuthAndShowMessage]);

  // ==================== Move to Cart ====================

  const moveToCart = useCallback(async (productId: number) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    try {
      const item = wishlist.find(i => i.productId === productId);
      if (!item) {
        toast.error('Item not found in wishlist');
        return;
      }

      await addToCart(productId);
      await removeFromWishlist(productId);
      toast.success('Moved to cart');
    } catch (error) {
      handleApiError(error, 'Move to cart');
    }
  }, [wishlist, addToCart, removeFromWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Move Multiple to Cart ====================

  const moveMultipleToCart = useCallback(async (productIds: number[]) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    setIsLoading(true);
    try {
      for (const productId of productIds) {
        const item = wishlist.find(i => i.productId === productId);
        if (item) {
          await addToCart(productId);
        }
      }

      await removeMultipleFromWishlist(productIds);
      toast.success(`${productIds.length} items moved to cart`);
    } catch (error) {
      handleApiError(error, 'Move multiple to cart');
    } finally {
      setIsLoading(false);
    }
  }, [wishlist, addToCart, handleApiError, checkAuthAndShowMessage]);

  // ==================== Bulk Add to Cart ====================

  const bulkAddToCart = useCallback(async (productIds?: number[]) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    const idsToAdd = productIds || wishlist.map(item => item.productId);

    setIsLoading(true);
    try {
      for (const productId of idsToAdd) {
        const item = wishlist.find(i => i.productId === productId);
        if (item) {
          await addToCart(productId);
        }
      }

      toast.success(`${idsToAdd.length} items added to cart`);
    } catch (error) {
      handleApiError(error, 'Bulk add to cart');
    } finally {
      setIsLoading(false);
    }
  }, [wishlist, addToCart, handleApiError, checkAuthAndShowMessage]);

  // ==================== Mark as Purchased ====================

  const markAsPurchased = useCallback(async (productId: number) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${productId}/purchase?userId=${user!.id}`, {
        method: 'POST',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as purchased');
      }

      await loadWishlist();
      toast.success('Marked as purchased');
    } catch (error) {
      handleApiError(error, 'Mark as purchased');
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, loadWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Mark Multiple as Purchased ====================

  const markMultipleAsPurchased = useCallback(async (productIds: number[]) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/purchase/bulk?userId=${user!.id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark items as purchased');
      }

      await loadWishlist();
      toast.success(`${productIds.length} items marked as purchased`);
    } catch (error) {
      handleApiError(error, 'Mark multiple as purchased');
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, loadWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Add Multiple to Wishlist ====================

  const addMultipleToWishlist = useCallback(async (
    products: Product[],
    options: Partial<AddToWishlistRequest> = {}
  ) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    setIsLoading(true);
    try {
      for (const product of products) {
        await addToWishlist(product.id, options);
      }
      toast.success(`${products.length} items added to wishlist`);
    } catch (error) {
      handleApiError(error, 'Add multiple to wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [addToWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Remove Multiple from Wishlist ====================

  const removeMultipleFromWishlist = useCallback(async (productIds: number[]) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bulk-delete?userId=${user!.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove items from wishlist');
      }

      await loadWishlist();
      toast.success(`${productIds.length} items removed from wishlist`);
    } catch (error) {
      handleApiError(error, 'Remove multiple from wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, loadWishlist, handleApiError, checkAuthAndShowMessage]);

  // ==================== Load Collections ====================

  const loadCollections = useCallback(async () => {
    if (!isLoggedIn || !user) return;

    try {
      const response = await fetch(`${API_BASE}/collections?userId=${user.id}`, {
        headers: getHeaders(),
      });

      if (response.status === 401) {
        setCollections([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load collections');
      }

      const data = await parseApiResponse(response);
      setCollections(data?.data || []);
    } catch (error) {
      // Don't throw - just log the error
      console.warn('Error loading wishlist collections:', error);
    }
  }, [isLoggedIn, user, API_BASE, getHeaders, parseApiResponse, handleApiError]);

  // ==================== Move to Collection ====================

  const moveToCollection = useCallback(async (productIds: number[], collectionName: string) => {
    if (!checkAuthAndShowMessage()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/collections/move?userId=${user!.id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productIds, collectionName }),
      });

      if (!response.ok) {
        throw new Error('Failed to move to collection');
      }

      await loadWishlist();
      await loadCollections();
      toast.success(`Moved to collection: ${collectionName}`);
    } catch (error) {
      handleApiError(error, 'Move to collection');
    } finally {
      setIsLoading(false);
    }
  }, [user, API_BASE, getHeaders, loadWishlist, loadCollections, handleApiError, checkAuthAndShowMessage]);

  // ==================== Load Summary ====================

  const loadSummary = useCallback(async () => {
    if (!isLoggedIn || !user) return;

    try {
      const response = await fetch(`${API_BASE}/summary?userId=${user.id}`, {
        headers: getHeaders(),
      });

      if (response.status === 401) {
        setSummary(null);
        return;
      }

      if (!response.ok) {
        // Don't throw - just log and set summary to null
        console.warn('Failed to load wishlist summary:', response.status);
        setSummary(null);
        return;
      }

      const data = await parseApiResponse(response);
      setSummary(data?.data || null);
    } catch (error) {
      // Don't throw - just log the error
      console.warn('Error loading wishlist summary:', error);
      setSummary(null);
    }
  }, [isLoggedIn, user, API_BASE, getHeaders, parseApiResponse, handleApiError]);

  // ==================== Load Analytics ====================

  const loadAnalytics = useCallback(async () => {
    if (!isLoggedIn || !user) return;

    try {
      const response = await fetch(`${API_BASE}/analytics?userId=${user.id}`, {
        headers: getHeaders(),
      });

      if (response.status === 401) {
        setAnalytics(null);
        return;
      }

      if (!response.ok) {
        // Don't throw - just log and set analytics to null
        console.warn('Failed to load wishlist analytics:', response.status);
        setAnalytics(null);
        return;
      }

      const data = await parseApiResponse(response);
      setAnalytics(data?.data || null);
    } catch (error) {
      // Don't throw - just log the error
      console.warn('Error loading wishlist analytics:', error);
      setAnalytics(null);
    }
  }, [isLoggedIn, user, API_BASE, getHeaders, parseApiResponse, handleApiError]);

  // ==================== Filter Functions ====================

  const getItemsByCollection = useCallback((collectionName: string) => {
    return wishlist.filter(item => item.collectionName === collectionName);
  }, [wishlist]);

  const getItemsByPriority = useCallback((priority: WishlistPriority) => {
    return wishlist.filter(item => item.priority === priority);
  }, [wishlist]);

  const getItemsByTags = useCallback((tags: string[]) => {
    return wishlist.filter(item =>
      item.tags?.some(tag => tags.includes(tag))
    );
  }, [wishlist]);

  const getItemsWithPriceDrops = useCallback(() => {
    return wishlist.filter(item => item.isPriceDropped);
  }, [wishlist]);

  const getItemsBelowTargetPrice = useCallback(() => {
    return wishlist.filter(item =>
      item.targetPrice && item.currentPrice <= item.targetPrice
    );
  }, [wishlist]);

  const getPurchasedItems = useCallback(() => {
    return wishlist.filter(item => item.purchased);
  }, [wishlist]);

  const getUnpurchasedItems = useCallback(() => {
    return wishlist.filter(item => !item.purchased);
  }, [wishlist]);

  const getAvailableItems = useCallback(() => {
    return wishlist.filter(item => item.inStock && !item.purchased);
  }, [wishlist]);

  // ==================== Optimize Wishlist ====================

  const optimizeWishlist = useCallback(async (options: WishlistOptimizationRequest): Promise<WishlistItem[]> => {
    if (!isLoggedIn || !user) {
      toast.error('Please log in to optimize your wishlist');
      return [];
    }

    try {
      const response = await fetch(`${API_BASE}/optimize?userId=${user.id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize wishlist');
      }

      const data = await parseApiResponse(response);
      return data?.data || [];
    } catch (error) {
      handleApiError(error, 'Optimize wishlist');
      return [];
    }
  }, [isLoggedIn, user, API_BASE, getHeaders, parseApiResponse, handleApiError]);

  // ==================== Share Wishlist ====================

  const shareWishlist = useCallback(async (options?: { shareName?: string; description?: string }) => {
    if (!checkAuthAndShowMessage()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE}/share?userId=${user!.id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(options || {}),
      });

      if (!response.ok) {
        throw new Error('Failed to share wishlist');
      }

      const data = await parseApiResponse(response);
      return {
        shareUrl: data.data.shareUrl,
        shareToken: data.data.shareToken,
      };
    } catch (error) {
      handleApiError(error, 'Share wishlist');
      throw error;
    }
  }, [user, API_BASE, getHeaders, parseApiResponse, handleApiError, checkAuthAndShowMessage]);

  // ==================== Check if in Wishlist ====================

  const isInWishlist = useCallback((productId: number) => {
    return wishlist.some(item => item.product.id === productId);
  }, [wishlist]);

  // ==================== Memoized Value ====================

  const value = useMemo<WishlistContextType>(() => ({
    // State
    wishlist,
    items: wishlist,
    itemCount: wishlist.length,
    summary,
    analytics,
    collections,
    isLoading,
    isAuthenticated: isLoggedIn,

    // Basic Operations
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    isInWishlist,
    clearWishlist,
    loadWishlist,

    // Advanced Operations
    moveToCart,
    moveMultipleToCart,
    bulkAddToCart,
    markAsPurchased,
    markMultipleAsPurchased,

    // Collections & Organization
    getItemsByCollection,
    getItemsByPriority,
    getItemsByTags,
    moveToCollection,
    loadCollections,

    // Price Tracking
    getItemsWithPriceDrops,
    getItemsBelowTargetPrice,

    // Purchase Status
    getPurchasedItems,
    getUnpurchasedItems,
    getAvailableItems,

    // Bulk Operations
    addMultipleToWishlist,
    removeMultipleFromWishlist,

    // Summary & Analytics
    loadSummary,
    loadAnalytics,

    // Optimization
    optimizeWishlist,

    // Sharing
    shareWishlist,
  }), [
    wishlist,
    summary,
    analytics,
    collections,
    isLoading,
    isLoggedIn,
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    isInWishlist,
    clearWishlist,
    loadWishlist,
    moveToCart,
    moveMultipleToCart,
    bulkAddToCart,
    markAsPurchased,
    markMultipleAsPurchased,
    getItemsByCollection,
    getItemsByPriority,
    getItemsByTags,
    moveToCollection,
    loadCollections,
    getItemsWithPriceDrops,
    getItemsBelowTargetPrice,
    getPurchasedItems,
    getUnpurchasedItems,
    getAvailableItems,
    addMultipleToWishlist,
    removeMultipleFromWishlist,
    loadSummary,
    loadAnalytics,
    optimizeWishlist,
    shareWishlist,
  ]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// ==================== Hook ====================

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};