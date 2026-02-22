import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useCallback, useMemo } from 'react';

// Custom storage that only works on client side
const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItem: (productId: string) => CartItem | undefined;
  syncWithServer: () => Promise<void>;
}

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,

      addItem: (newItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(item => item.productId === newItem.productId);

        const newItems: CartItem[] = existingItemIndex > -1
          ? items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.maxQuantity) }
                : item
            )
          : [...items, { ...newItem, id: Date.now().toString() }];

        set({ ...calculateTotals(newItems), items: newItems });
      },

      removeItem: (id) => {
        const { items } = get();
        const newItems = items.filter(item => item.id !== id);
        set({ ...calculateTotals(newItems), items: newItems });
      },

      updateQuantity: (id, quantity) => {
        const { items } = get();
        const newItems = items
          .map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, Math.min(quantity, item.maxQuantity)) } : item
          )
          .filter(item => item.quantity > 0);

        set({ ...calculateTotals(newItems), items: newItems });
      },

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),

      getItem: (productId) => {
        return get().items.find(item => item.productId === productId);
      },

      syncWithServer: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/cart/sync', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.items) {
              const newItems = data.items.map((item: any) => ({
                ...item,
                id: item.id || Date.now().toString(),
                maxQuantity: item.maxQuantity || 99
              }));
              set({ items: newItems, isLoading: false });
            }
          }
        } catch (error) {
          set({ isLoading: false });
          console.error('Cart sync failed:', error);
        }
      },
    }),
    {
      name: 'cart-store',
      version: 1,
      storage: createJSONStorage(() => customStorage),
    }
  )
);

// Memoized hooks for better performance
export const useCartItems = () => useCartStore(state => state.items);
export const useCartTotals = () => {
  const items = useCartItems();
  return useMemo(() => calculateTotals(items), [items]);
};
export const useCartLoading = () => useCartStore(state => state.isLoading);
