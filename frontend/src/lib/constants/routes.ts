// ==================== App Routes ====================
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // Product routes
  PRODUCTS: '/shop/products',
  PRODUCT_DETAIL: '/shop/products/[id]',
  CATEGORIES: '/shop/categories',
  SEARCH: '/shop/search',

  // Dashboard routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_REVIEWS: '/admin/reviews',

  SELLER: '/seller',
  SELLER_DASHBOARD: '/seller/dashboard',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_ORDERS: '/seller/orders',
  SELLER_REVIEWS: '/seller/reviews',

  CUSTOMER: '/customer',
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_ORDERS: '/customer/orders',
  CUSTOMER_WISHLIST: '/customer/wishlist',
  CUSTOMER_REVIEWS: '/customer/reviews',
  CUSTOMER_SETTINGS: '/customer/settings',

  // Shopping routes
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: '/order-confirmation',

  // Static pages
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FAQ: '/faq',
} as const;

// Dynamic route generators
export const getProductDetailRoute = (id: string | number) => `/shop/products/${id}`;
export const getCategoryRoute = (slug: string) => `/shop/categories/${slug}`;
export const getSearchRoute = (query: string) => `/shop/search?q=${encodeURIComponent(query)}`;

// Route patterns for matching
export const ROUTE_PATTERNS = {
  PRODUCT_DETAIL: /^\/shop\/products\/[^\/]+$/,
  CATEGORY: /^\/shop\/categories\/[^\/]+$/,
} as const;

// Protected routes configuration
export const PROTECTED_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_PRODUCTS,
  ROUTES.ADMIN_ORDERS,
  ROUTES.ADMIN_USERS,
  ROUTES.SELLER,
  ROUTES.SELLER_DASHBOARD,
  ROUTES.SELLER_PRODUCTS,
  ROUTES.SELLER_ORDERS,
  ROUTES.CUSTOMER,
  ROUTES.CUSTOMER_DASHBOARD,
  ROUTES.CUSTOMER_ORDERS,
  ROUTES.CUSTOMER_WISHLIST,
  ROUTES.CUSTOMER_SETTINGS,
  ROUTES.CHECKOUT,
];

// Public routes (accessible without authentication)
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.PRODUCTS,
  ROUTES.PRODUCT_DETAIL,
  ROUTES.CATEGORIES,
  ROUTES.SEARCH,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
  ROUTES.FAQ,
];

// Default redirect routes
export const DEFAULT_REDIRECTS = {
  AFTER_LOGIN: ROUTES.CUSTOMER_DASHBOARD,
  AFTER_LOGOUT: ROUTES.HOME,
  AFTER_REGISTER: ROUTES.CUSTOMER_DASHBOARD,
  UNAUTHORIZED: ROUTES.LOGIN,
  NOT_FOUND: ROUTES.HOME,
} as const;

// API routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
    ROLES: '/users/roles',
  },
  PRODUCTS: {
    BASE: '/shop/products',
    SEARCH: '/shop/products/search',
    CATEGORIES: '/shop/categories',
    REVIEWS: '/shop/products/reviews',
  },
  ORDERS: {
    BASE: '/shop/orders',
    MY_ORDERS: '/shop/orders/my-orders',
    STATUS: '/shop/orders/status',
  },
  WISHLIST: {
    BASE: '/shop/wishlist',
    ITEMS: '/shop/wishlist/items',
    SHARE: '/shop/wishlist/share',
    EXPORT: '/shop/wishlist/export',
  },
  CART: {
    BASE: '/shop/cart',
    ITEMS: '/shop/cart/items',
  },
  UPLOAD: {
    IMAGES: '/upload/images',
    DOCUMENTS: '/upload/documents',
  },
} as const;
