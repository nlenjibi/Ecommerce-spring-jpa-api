// Re-export all store hooks and types for easy access
export * from './slices/auth.store';
export * from './slices/cart.store';
export * from './slices/ui.store';
export * from './slices/notifications.store';

// Combined store types
export interface RootState {
  auth: ReturnType<typeof useAuthStore>;
  cart: ReturnType<typeof useCartStore>;
  ui: ReturnType<typeof useUIStore>;
  notifications: ReturnType<typeof useNotificationStore>;
}

// Store initialization helper
export const initializeStores = () => {
  // Any store initialization logic goes here
  console.log('Stores initialized');
};

// Store reset helper (useful for testing and logout)
export const resetAllStores = () => {
  useAuthStore.getState().reset();
  useCartStore.getState().reset();
  useUIStore.getState().reset();
  useNotificationStore.getState().reset();
};
