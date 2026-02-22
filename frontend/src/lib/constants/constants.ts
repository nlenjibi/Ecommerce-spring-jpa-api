// ==================== API Configuration ====================
// Normalize API base URL to avoid duplicated '/api'
const _rawApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9190';
export const API_BASE_URL = (() => {
  try {
    let u = _rawApiBase.trim();
    if (u.endsWith('/')) u = u.slice(0, -1);
    if (u.toLowerCase().endsWith('/api')) return u;
    return `${u}/api`;
  } catch (e) {
    console.error('[Constants] Failed to parse API_BASE_URL:', e);
    return 'http://localhost:9190/api';
  }
})();

export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_KEY || '';

// ==================== App Constants ====================
export const APP_NAME = 'ShopHub';
export const APP_DESCRIPTION = 'Your one-stop destination for all your shopping needs';

// ==================== Pagination ====================
export const DEFAULT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 10;

// ==================== User Roles & Permissions ====================
// Role constants for type safety and consistency
export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  USER: 'user',
  CUSTOMER: 'customer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Permission constants for role-based access control
export const PERMISSIONS = {
  // Review permissions
  CREATE_REVIEW: 'create_review',
  EDIT_OWN_REVIEW: 'edit_own_review',
  DELETE_OWN_REVIEW: 'delete_own_review',
  VIEW_ALL_REVIEWS: 'view_all_reviews',
  MODERATE_REVIEWS: 'moderate_reviews',
  RESPOND_TO_REVIEW: 'respond_to_review',
  MANAGE_SELLER_REVIEWS: 'manage_seller_reviews',

  // Dashboard permissions
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  VIEW_SELLER_DASHBOARD: 'view_seller_dashboard',
  VIEW_CUSTOMER_DASHBOARD: 'view_customer_dashboard',

  // Product permissions
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  MANAGE_PRODUCTS: 'manage_products',

  // Order permissions
  VIEW_OWN_ORDERS: 'view_own_orders',
  VIEW_ALL_ORDERS: 'view_all_orders',
  MANAGE_ORDERS: 'manage_orders',

  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',

  // Wishlist permissions
  CREATE_WISHLIST: 'create_wishlist',
  SHARE_WISHLIST: 'share_wishlist',
  EXPORT_WISHLIST: 'export_wishlist',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission sets
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: [
    // All permissions
    PERMISSIONS.CREATE_REVIEW,
    PERMISSIONS.EDIT_OWN_REVIEW,
    PERMISSIONS.DELETE_OWN_REVIEW,
    PERMISSIONS.VIEW_ALL_REVIEWS,
    PERMISSIONS.MODERATE_REVIEWS,
    PERMISSIONS.RESPOND_TO_REVIEW,
    PERMISSIONS.MANAGE_SELLER_REVIEWS,
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.VIEW_SELLER_DASHBOARD,
    PERMISSIONS.VIEW_CUSTOMER_DASHBOARD,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_WISHLIST,
    PERMISSIONS.SHARE_WISHLIST,
    PERMISSIONS.EXPORT_WISHLIST,
  ],
  [USER_ROLES.SELLER]: [
    PERMISSIONS.CREATE_REVIEW,
    PERMISSIONS.EDIT_OWN_REVIEW,
    PERMISSIONS.DELETE_OWN_REVIEW,
    PERMISSIONS.RESPOND_TO_REVIEW,
    PERMISSIONS.MANAGE_SELLER_REVIEWS,
    PERMISSIONS.VIEW_SELLER_DASHBOARD,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.CREATE_WISHLIST,
    PERMISSIONS.SHARE_WISHLIST,
    PERMISSIONS.EXPORT_WISHLIST,
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.CREATE_REVIEW,
    PERMISSIONS.EDIT_OWN_REVIEW,
    PERMISSIONS.DELETE_OWN_REVIEW,
    PERMISSIONS.VIEW_CUSTOMER_DASHBOARD,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.CREATE_WISHLIST,
    PERMISSIONS.SHARE_WISHLIST,
    PERMISSIONS.EXPORT_WISHLIST,
  ],
  [USER_ROLES.CUSTOMER]: [
    PERMISSIONS.CREATE_REVIEW,
    PERMISSIONS.EDIT_OWN_REVIEW,
    PERMISSIONS.DELETE_OWN_REVIEW,
    PERMISSIONS.VIEW_CUSTOMER_DASHBOARD,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.CREATE_WISHLIST,
    PERMISSIONS.SHARE_WISHLIST,
    PERMISSIONS.EXPORT_WISHLIST,
  ],
};

// Helper functions for role checking
export const isAdmin = (role?: UserRole | string | null): boolean => role === USER_ROLES.ADMIN;
export const isSeller = (role?: UserRole | string | null): boolean => role === USER_ROLES.SELLER;
export const isUser = (role?: UserRole | string | null): boolean => role === USER_ROLES.USER;
export const isCustomer = (role?: UserRole | string | null): boolean => role === USER_ROLES.CUSTOMER;
export const isRegularUser = (role?: UserRole | string | null): boolean =>
  isUser(role) || isCustomer(role);

// Permission checking functions
export const hasPermission = (role: UserRole | string | null, permission: Permission): boolean => {
  if (!role || !permission) return false;
  const rolePermissions = ROLE_PERMISSIONS[role as UserRole];
  return rolePermissions?.includes(permission) || false;
};

export const hasAnyPermission = (role: UserRole | string | null, permissions: Permission[]): boolean => {
  if (!role) return false;
  return permissions.some(permission => hasPermission(role, permission));
};

export const hasAllPermissions = (role: UserRole | string | null, permissions: Permission[]): boolean => {
  if (!role) return false;
  return permissions.every(permission => hasPermission(role, permission));
};

// Role display names for UI
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.SELLER]: 'Seller',
  [USER_ROLES.USER]: 'User',
  [USER_ROLES.CUSTOMER]: 'Customer',
};

// Role color schemes for UI
export const ROLE_COLORS: Record<UserRole, { primary: string; secondary: string; text: string }> = {
  [USER_ROLES.ADMIN]: {
    primary: '#ef4444',   // red-500
    secondary: '#fef2f2', // red-50
    text: '#991b1b',      // red-800
  },
  [USER_ROLES.SELLER]: {
    primary: '#3b82f6',   // blue-500
    secondary: '#eff6ff', // blue-50
    text: '#1e40af',      // blue-800
  },
  [USER_ROLES.USER]: {
    primary: '#10b981',   // green-500
    secondary: '#ecfdf5', // green-50
    text: '#047857',      // green-800
  },
  [USER_ROLES.CUSTOMER]: {
    primary: '#10b981',   // green-500 (same as user)
    secondary: '#ecfdf5', // green-50
    text: '#047857',      // green-800
  },
};

// Role badge styles for UI (Tailwind classes)
export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
  [USER_ROLES.SELLER]: 'bg-blue-100 text-blue-800 border-blue-200',
  [USER_ROLES.USER]: 'bg-green-100 text-green-800 border-green-200',
  [USER_ROLES.CUSTOMER]: 'bg-green-100 text-green-800 border-green-200',
};

// ==================== Order Statuses ====================
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

// ==================== Shipping ====================
export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 9.99;
export const TAX_RATE = 0.08;

// ==================== Date Formats ====================
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// ==================== Chart Colors ====================
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

// ==================== Wishlist Constants ====================
export const WISHLIST_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const WISHLIST_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export const WISHLIST_PRIORITY_WEIGHTS: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
};

export const WISHLIST_SORT_OPTIONS = [
  { value: 'date-added', label: 'Date Added' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'priority', label: 'Priority' },
  { value: 'savings', label: 'Biggest Savings' },
  { value: 'name', label: 'Name A-Z' },
] as const;

// ==================== Storage Keys ====================
export const STORAGE_KEYS = {
  GUEST_SESSION_ID: 'wishlist_guest_session_id',
  GUEST_WISHLIST: 'wishlist_guest_items',
  WISHLIST_FILTERS: 'wishlist_filters',
  WISHLIST_VIEW_MODE: 'wishlist_view_mode',
  CART_ITEMS: 'cart_items',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  USER_ROLE: 'userRole',
} as const;

// ==================== Toast Messages ====================
export const TOAST_MESSAGES = {
  WISHLIST: {
    ADDED: 'Added to wishlist',
    REMOVED: 'Removed from wishlist',
    UPDATED: 'Wishlist item updated',
    CLEARED: 'Wishlist cleared',
    MERGED: 'Guest wishlist merged successfully',
    MOVE_TO_CART_SUCCESS: 'Moved to cart',
    MOVE_TO_CART_ERROR: 'Failed to move to cart',
    MARK_PURCHASED_SUCCESS: 'Marked as purchased',
    MARK_PURCHASED_ERROR: 'Failed to mark as purchased',
  },
  CART: {
    ADDED: 'Added to cart',
    REMOVED: 'Removed from cart',
    UPDATED: 'Cart updated',
    CLEARED: 'Cart cleared',
  },
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_ERROR: 'Login failed',
    LOGOUT_SUCCESS: 'Logged out successfully',
    REGISTER_SUCCESS: 'Registration successful',
    REGISTER_ERROR: 'Registration failed',
    UNAUTHORIZED: 'You do not have permission to access this resource',
    FORBIDDEN: 'Access denied',
  },
  ERROR: {
    GENERIC: 'Something went wrong',
    NETWORK: 'Network error. Please check your connection',
    UNAUTHORIZED: 'Please login to continue',
    FORBIDDEN: "You don't have permission to do that",
    NOT_FOUND: 'Resource not found',
  },
} as const;

// ==================== Validation Rules ====================
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NOTES_MAX_LENGTH: 500,
  PRODUCT_NAME_MAX_LENGTH: 200,
} as const;

// ==================== Product Filters ====================
export const PRODUCT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
] as const;

export const PRICE_RANGES = [
  { min: 0, max: 50, label: 'Under $50' },
  { min: 50, max: 100, label: '$50 - $100' },
  { min: 100, max: 200, label: '$100 - $200' },
  { min: 200, max: 500, label: '$200 - $500' },
  { min: 500, max: Infinity, label: 'Over $500' },
] as const;

export const RATING_FILTERS = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 2, label: '2★ & above' },
  { value: 1, label: '1★ & above' },
] as const;

// ==================== Animation & Timing ====================
export const ANIMATION_DURATION = 200; // milliseconds
export const DEBOUNCE_DELAY = 300; // milliseconds
export const TOAST_DURATION = 3000; // milliseconds

// ==================== Retry Configuration ====================
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;

// ==================== Guest Wishlist ====================
export const GUEST_WISHLIST = {
  SESSION_EXPIRY_DAYS: 30,
  MAX_ITEMS: 100,
  MERGE_ON_LOGIN: true,
  PERSIST_TO_LOCAL_STORAGE: true,
} as const;

// ==================== Feature Flags ====================
export const FEATURES = {
  ENABLE_WISHLIST_SHARING: true,
  ENABLE_PRICE_TRACKING: true,
  ENABLE_PRICE_ALERTS: true,
  ENABLE_GUEST_WISHLIST: true,
  ENABLE_WISHLIST_COLLECTIONS: true,
  ENABLE_WISHLIST_ANALYTICS: true,
  ENABLE_PRODUCT_RECOMMENDATIONS: true,
  ENABLE_WISHLIST_IMPORT_EXPORT: true,
  ENABLE_REVIEWS: true,
  ENABLE_SELLER_DASHBOARD: true,
} as const;

// ==================== Route Permissions ====================
// Map routes to required permissions
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/admin': [PERMISSIONS.VIEW_ADMIN_DASHBOARD],
  '/admin/dashboard': [PERMISSIONS.VIEW_ADMIN_DASHBOARD],
  '/admin/products': [PERMISSIONS.MANAGE_PRODUCTS],
  '/admin/orders': [PERMISSIONS.MANAGE_ORDERS],
  '/admin/users': [PERMISSIONS.MANAGE_USERS],
  '/seller': [PERMISSIONS.VIEW_SELLER_DASHBOARD],
  '/seller-dashboard': [PERMISSIONS.VIEW_SELLER_DASHBOARD],
  '/seller/products': [PERMISSIONS.MANAGE_PRODUCTS],
  '/customer': [PERMISSIONS.VIEW_CUSTOMER_DASHBOARD],
  '/customer/orders': [PERMISSIONS.VIEW_OWN_ORDERS],
  '/customer/wishlist': [PERMISSIONS.CREATE_WISHLIST],
};

// ==================== Default Dashboard Routes by Role ====================
export const DEFAULT_DASHBOARD_ROUTES: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.SELLER]: '/seller',
  [USER_ROLES.USER]: '/customer',
  [USER_ROLES.CUSTOMER]: '/customer',
};