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

// Route permissions mapping
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

// Default dashboard routes by role
export const DEFAULT_DASHBOARD_ROUTES: Record<UserRole, string> = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.SELLER]: '/seller',
  [USER_ROLES.USER]: '/customer',
  [USER_ROLES.CUSTOMER]: '/customer',
};
