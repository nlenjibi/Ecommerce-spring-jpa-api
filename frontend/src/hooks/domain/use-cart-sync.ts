import { useCallback, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/slices/cart.store';
import { useAuthStore } from '@/store/slices/auth.store';

interface CartSyncOptions {
  enabled?: boolean;
  syncInterval?: number;
}

/**
 * Enhanced cart synchronization hook with optimistic updates and conflict resolution
 */
export const useCartSync = (options: CartSyncOptions = {}) => {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingOperationsRef = useRef<Set<string>>(new Set());

  const {
    enabled = true,
    syncInterval = 30000 // 30 seconds
  } = options;

  /**
   * Optimistic cart update with rollback on failure
   */
  const optimisticUpdate = useCallback(async (operation: () => Promise<void>) => {
    try {
      await operation();
    } catch (error) {
      console.error('Cart operation failed, rolling back:', error);
      // Rollback would be handled by optimistic UI updates
      throw error;
    }
  }, []);

  /**
   * Add item with optimistic update
   */
  const addItemWithSync = useCallback(async (productData: any) => {
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic update
    addItem({
      ...productData,
      id: tempId
    });
    
    pendingOperationsRef.current.add(tempId);
    
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      const result = await response.json();
      
      // Replace temp item with real item
      removeItem(tempId);
      if (result.data) {
        addItem(result.data);
      }
    } catch (error) {
      // Remove optimistic item on failure
      removeItem(tempId);
      throw error;
    } finally {
      pendingOperationsRef.current.delete(tempId);
    }
  }, [addItem, removeItem]);

  /**
   * Update quantity with optimistic update
   */
  const updateQuantityWithSync = useCallback(async (itemId: string, quantity: number) => {
    const previousItems = items.map(item => ({ ...item }));
    
    // Optimistic update
    updateQuantity(itemId, quantity);
    
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item quantity');
      }
    } catch (error) {
      // Rollback on failure
      useCartStore.setState({ items: previousItems });
      throw error;
    }
  }, [items, updateQuantity]);

  /**
   * Remove item with optimistic update
   */
  const removeItemWithSync = useCallback(async (itemId: string) => {
    const previousItems = items.map(item => ({ ...item }));
    
    // Optimistic update
    removeItem(itemId);
    
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
    } catch (error) {
      // Rollback on failure
      useCartStore.setState({ items: previousItems });
      throw error;
    }
  }, [items, removeItem]);

  /**
   * Sync cart with server
   */
  const syncWithServer = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientItems: items,
          lastSyncTime: Date.now()
        }),
      });
      
      if (!response.ok) return;
      
      const result = await response.json();
      
      if (result.data) {
        // Merge server state with client state
        const serverItems = result.data.items || [];
        useCartStore.setState({ items: serverItems });
      }
    } catch (error) {
      console.error('Cart sync failed:', error);
    }
  }, [isAuthenticated, user, items]);

  // Periodic synchronization
  useEffect(() => {
    if (!enabled) return;
    
    syncWithServer();
    
    syncTimeoutRef.current = setInterval(syncWithServer, syncInterval);
    
    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [enabled, syncInterval, syncWithServer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    addItemWithSync,
    removeItemWithSync,
    updateQuantityWithSync,
    syncWithServer,
    isSyncing: pendingOperationsRef.current.size > 0
  };
};