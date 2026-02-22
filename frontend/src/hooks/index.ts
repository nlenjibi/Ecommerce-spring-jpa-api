/**
 * Hooks Index
 * 
 * Central export point for all custom React hooks.
 * Import hooks from this file for cleaner imports throughout your app.
 * 
 * @example
 * // Instead of:
 * import { useProducts } from '@/hooks/domain/use-products';
 * import { useDebounce } from '@/hooks/ui/use-debounce';
 * 
 * // You can do:
 * import { useProducts, useDebounce } from '@/hooks';
 */

// ============ API HOOKS ============
// React Query integration with enhanced defaults
export {
  useQuery,
  usePaginatedQuery,
  usePollingQuery,
} from './api/use-query';

export {
  useMutation,
  useOptimisticMutation,
  useBulkMutation,
} from './api/use-mutation';

export {
  useInfiniteQuery,
  useCursorInfiniteQuery,
  useInfiniteScroll,
  flattenInfiniteData,
} from './api/use-infinite-query';

// ============ STATE MANAGEMENT HOOKS ============
// Browser storage and state persistence
export {
  useLocalStorage,
  useLocalStorageState,
  useSyncedLocalStorage,
} from './state/use-local-storage';

export {
  useSessionStorage,
  useSessionStorageState,
  useTemporaryStorage,
} from './state/use-session-storage';

export {
  useToggle,
  useBooleanState,
  useDisclosure,
  useControlledToggle,
} from './state/use-toggle';

// ============ UI INTERACTION HOOKS ============
// User interface and interaction helpers
export { useDebounce } from './ui/use-debounce';

export {
  useIntersectionObserver,
  useInView,
  useLazyLoad,
  useScrollTrigger,
  useVisibilityPercentage,
} from './ui/use-intersection-observer';

export {
  useKeypress,
  useEscapeKey,
  useEnterKey,
  useArrowKeys,
  useHotkeys,
  useCommandPalette,
} from './ui/use-keypress';

export {
  useMediaQuery,
  useBreakpoint,
  useBreakpoints,
  useIsMobile,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useOrientation,
  useTouchDevice,
  useResponsiveValue,
} from './ui/use-media-query';

export {
  useNetworkSpeed,
  useAdaptiveLoadingDuration,
  useAdaptiveAssets,
  type NetworkSpeed,
  type NetworkInfo,
} from './ui/use-network-speed';

// ============ DOMAIN/BUSINESS LOGIC HOOKS ============
// E-commerce and business-specific hooks

// Authentication
export {
  useAuth,
  useRequireAuth,
  useIsAdmin,
} from './domain/use-auth';

// Shopping Cart
export {
  useCart,
} from './domain/use-cart';

// Products
export {
  useProducts,
  useProduct,
  useFeaturedProducts,
} from './domain/use-products';

// Categories
export { useCategories } from './domain/use-categories';

// Orders
export {
  useOrders,
  useOrder,
  useCreateOrder,
} from './domain/use-orders';

// Checkout
export { useCheckout } from './domain/use-checkout';

// ============ ADMIN HOOKS ============
// Admin panel management hooks

// Admin Dashboard
export {
  useAdminDashboard,
  useAdminAnalytics,
} from './domain/admin/use-admin-dashboard';

// Admin Products
export {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './domain/admin/use-admin-products';

// Admin Orders
export {
  useAdminOrders,
  useUpdateOrderStatus,
  useRefundOrder,
} from './domain/admin/use-admin-orders';

// Admin Users
export {
  useAdminUsers,
  useUpdateUserStatus,
  useUpdateUserRole,
} from './domain/admin/use-admin-users';

// Admin Categories
export {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './domain/admin/use-admin-categories';

// Admin Promotions
export {
  useAdminPromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from './domain/admin/use-admin-promotions';

// Admin Tags
export {
  useAdminTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from './domain/admin/use-admin-tags';
