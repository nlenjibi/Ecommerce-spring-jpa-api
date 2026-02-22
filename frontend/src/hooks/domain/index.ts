/**
 * Domain Hooks
 * 
 * Business logic hooks for core application features
 */

// Authentication
export { useAuth } from './use-auth';

// Shopping Cart
export { useCart } from './use-cart';

// Products
export { useProducts, useProduct, useFeaturedProducts } from './use-products';

// Categories
export { useCategories } from './use-categories';

// Orders
export { useOrders, useOrder, useCreateOrder } from './use-orders';

// Checkout
export { useCheckout } from './use-checkout';

// Admin hooks (re-export from admin subdirectory)
export * from './admin';
