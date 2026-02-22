/**
 * API Strategy - REST vs GraphQL Consumption Guide
 * 
 * This document provides clear guidelines on when to use REST vs GraphQL
 * based on the specific use case and requirements.
 */

// ==================== API STRATEGY ENUMS ====================

export enum ApiStrategy {
  REST = 'rest',
  GRAPHQL = 'graphql',
  HYBRID = 'hybrid',
}

export interface ApiEndpointRule {
  feature: string;
  strategy: ApiStrategy;
  reason: string;
  restEndpoint?: string;
  graphqlQuery?: string;
  examples: string[];
}

// ==================== API CONSUMPTION RULES ====================

export const API_CONSUMPTION_RULES: ApiEndpointRule[] = [
  // AUTHENTICATION
  {
    feature: 'User Login',
    strategy: ApiStrategy.REST,
    reason: 'Authentication requires HTTP semantics, proper status codes, and session management',
    restEndpoint: '/api/v1/users/auth/login',
    examples: ['authApi.login(email, password)', 'authApi.logout()'],
  },
  {
    feature: 'User Registration',
    strategy: ApiStrategy.REST,
    reason: 'Registration creates user accounts and needs proper HTTP status codes',
    restEndpoint: '/api/v1/users/auth/register',
    examples: ['authApi.register(userData)', 'authApi.verifyEmail(token)'],
  },

  // CART OPERATIONS
  {
    feature: 'Add to Cart',
    strategy: ApiStrategy.REST,
    reason: 'Cart mutations are state-changing operations requiring immediate feedback and HTTP semantics',
    restEndpoint: '/api/v1/carts/items',
    examples: ['cartApi.addItem(productId, quantity)', 'cartApi.removeFromCart(itemId)'],
  },
  {
    feature: 'Update Cart Quantity',
    strategy: ApiStrategy.REST,
    reason: 'Cart updates need immediate state synchronization and proper error handling',
    restEndpoint: '/api/v1/carts/items/{productId}',
    examples: ['cartApi.updateQuantity(itemId, quantity)', 'cartApi.clearCart()'],
  },
  {
    feature: 'View Cart Details',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Cart view needs complex data: items, products, prices, calculations - perfect for GraphQL',
    graphqlQuery: 'cart(id: $cartId)',
    examples: ['useCart(cartId)', 'graphql.query(GET_CART_DETAILS, { cartId })'],
  },

  // PRODUCT OPERATIONS
  {
    feature: 'Product Listing',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Product listings need filtering, sorting, pagination - GraphQL excels at complex data fetching',
    graphqlQuery: 'products(pagination: $pagination, filter: $filter)',
    examples: [
      'useProducts({ category, priceRange, search })',
      'graphql.query(GET_PRODUCTS, { pagination, filter })'
    ],
  },
  {
    feature: 'Product Search',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Search requires flexible filtering across multiple fields - perfect for GraphQL',
    graphqlQuery: 'searchProducts(search: $search, pagination: $pagination)',
    examples: [
      'useProductSearch("laptop", { page: 1, size: 20 })',
      'graphql.query(SEARCH_PRODUCTS, { search, pagination })'
    ],
  },
  {
    feature: 'Product Details',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Product details page needs rich data: reviews, related products, recommendations - single GraphQL query',
    graphqlQuery: 'product(id: $id, slug: $slug)',
    examples: [
      'useProductDetail(productId)',
      'graphql.query(GET_PRODUCT_DETAIL, { id, slug })'
    ],
  },
  {
    feature: 'Featured Products',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Featured products need caching and optimization - GraphQL handles this efficiently',
    graphqlQuery: 'featuredProducts(pagination: $pagination)',
    examples: ['useFeaturedProducts()', 'graphql.query(GET_FEATURED_PRODUCTS, { pagination })'],
  },
  {
    feature: 'Create Product',
    strategy: ApiStrategy.REST,
    reason: 'Product creation is admin operation requiring proper HTTP semantics and status codes',
    restEndpoint: '/api/v1/products',
    examples: ['productsApi.create(productData)', 'sellerApi.createProduct(product)'],
  },
  {
    feature: 'Update Product',
    strategy: ApiStrategy.REST,
    reason: 'Product updates need HTTP status codes and proper validation feedback',
    restEndpoint: '/api/v1/products/{id}',
    examples: ['productsApi.update(id, updates)', 'sellerApi.updateProduct(id, updates)'],
  },
  {
    feature: 'Delete Product',
    strategy: ApiStrategy.REST,
    reason: 'Product deletion requires confirmation and proper status feedback',
    restEndpoint: '/api/v1/products/{id}',
    examples: ['productsApi.delete(id)', 'sellerApi.deleteProduct(id)'],
  },

  // CATEGORY OPERATIONS
  {
    feature: 'Category Browsing',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Category browsing benefits from GraphQL caching and hierarchical data structure',
    graphqlQuery: 'categories(pagination: $pagination, isActive: $isActive)',
    examples: [
      'useCategories({ active: true })',
      'graphql.query(GET_CATEGORIES, { pagination, isActive })'
    ],
  },
  {
    feature: 'Category Hierarchy',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Category tree is recursive and complex - GraphQL handles relationships perfectly',
    graphqlQuery: 'categoryHierarchy',
    examples: ['useCategoryHierarchy()', 'graphql.query(GET_CATEGORY_HIERARCHY)'],
  },

  // ORDER OPERATIONS
  {
    feature: 'Place Order',
    strategy: ApiStrategy.REST,
    reason: 'Order creation is transactional and needs HTTP semantics with status codes',
    restEndpoint: '/api/v1/orders',
    examples: ['ordersApi.create(orderData)', 'cartApi.checkout()'],
  },
  {
    feature: 'Order History',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Order history needs rich data: products, statuses, pagination - GraphQL optimal',
    graphqlQuery: 'myOrders(pagination: $pagination)',
    examples: [
      'useOrderHistory({ page: 1, size: 10 })',
      'graphql.query(GET_MY_ORDERS, { pagination })'
    ],
  },
  {
    feature: 'Order Details',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Order details need comprehensive data - single GraphQL query better than multiple REST calls',
    graphqlQuery: 'order(id: $id)',
    examples: [
      'useOrderDetail(orderId)',
      'graphql.query(GET_ORDER_DETAIL, { id })'
    ],
  },
  {
    feature: 'Update Order Status',
    strategy: ApiStrategy.REST,
    reason: 'Order status changes require proper HTTP status codes and audit trail',
    restEndpoint: '/api/v1/orders/{id}/status',
    examples: ['ordersApi.updateStatus(id, status)', 'ordersApi.cancelOrder(id)'],
  },

  // USER PROFILE & ACCOUNT
  {
    feature: 'User Profile',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'User profile needs data from multiple sources - GraphQL aggregates efficiently',
    graphqlQuery: 'currentUser',
    examples: ['useCurrentUser()', 'graphql.query(GET_CURRENT_USER)'],
  },
  {
    feature: 'Update Profile',
    strategy: ApiStrategy.REST,
    reason: 'Profile updates are user actions requiring proper validation and status codes',
    restEndpoint: '/api/v1/users/{id}',
    examples: ['usersApi.updateProfile(id, profile)', 'authApi.updateProfile(profile)'],
  },

  // ADMIN & DASHBOARD
  {
    feature: 'Admin Dashboard',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Dashboard needs aggregated data from multiple entities - GraphQL single query optimal',
    graphqlQuery: 'adminDashboard',
    examples: ['useAdminDashboard()', 'graphql.query(GET_ADMIN_DASHBOARD)'],
  },
  {
    feature: 'User Management',
    strategy: ApiStrategy.REST,
    reason: 'User CRUD operations require proper HTTP semantics and admin validation',
    restEndpoint: '/api/v1/users',
    examples: ['usersApi.deleteUser(id)', 'usersApi.updateUser(id, data)', 'usersApi.createUser(userData)'],
  },

  // REVIEWS & RATINGS
  {
    feature: 'Product Reviews',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Reviews need product context, pagination, and user data - GraphQL handles this well',
    graphqlQuery: 'productReviews(productId: $productId, pagination: $pagination)',
    examples: [
      'useProductReviews(productId)',
      'graphql.query(GET_PRODUCT_REVIEWS, { productId, pagination })'
    ],
  },
  {
    feature: 'Create Review',
    strategy: ApiStrategy.REST,
    reason: 'Review creation requires validation and proper HTTP status feedback',
    restEndpoint: '/api/v1/reviews',
    examples: ['reviewsApi.create(reviewData)', 'reviewsApi.updateReview(id, reviewData)'],
  },
  {
    feature: 'Rating Statistics',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Rating statistics are calculated data - GraphQL caching provides better performance',
    graphqlQuery: 'productRatingStats(productId: $productId)',
    examples: [
      'useProductRatingStats(productId)',
      'graphql.query(GET_PRODUCT_RATING_STATS, { productId })'
    ],
  },

  // WISHLIST
  {
    feature: 'View Wishlist',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Wishlist benefits from GraphQL caching and product relationship handling',
    graphqlQuery: 'myWishlist',
    examples: [
      'useWishlist()',
      'graphql.query(GET_MY_WISHLIST)'
    ],
  },
  {
    feature: 'Add to Wishlist',
    strategy: ApiStrategy.REST,
    reason: 'Wishlist operations are user actions requiring immediate feedback and state changes',
    restEndpoint: '/api/v1/wishlists',
    examples: ['wishlistApi.addItem(productId)', 'wishlistApi.removeItem(productId)'],
  },

  // FILE UPLOADS
  {
    feature: 'Product Images',
    strategy: ApiStrategy.REST,
    reason: 'File uploads require multipart/form-data handling and proper HTTP semantics',
    restEndpoint: '/api/v1/products/{id}/images',
    examples: ['productsApi.uploadImages(productId, formData)', 'sellerApi.uploadProductImages(productId, formData)'],
  },

  // SEARCH & DISCOVERY
  {
    feature: 'Advanced Search',
    strategy: ApiStrategy.GRAPHQL,
    reason: 'Advanced search needs flexible filtering across products, categories, reviews - GraphQL excels',
    graphqlQuery: 'searchProducts(search: $search, filter: $filter, pagination: $pagination)',
    examples: [
      'useAdvancedSearch({ query: "laptop", minPrice: 500, category: "electronics" })',
      'graphql.query(ADVANCED_SEARCH, { search, filter, pagination })'
    ],
  },

  // PERFORMANCE & MONITORING
  {
    feature: 'Cache Management',
    strategy: ApiStrategy.REST,
    reason: 'Cache operations are admin actions requiring proper HTTP status and feedback',
    restEndpoint: '/api/performance/cache/clear',
    examples: ['performanceApi.clearCache()', 'performanceApi.getCacheStats()'],
  },
  {
    feature: 'System Metrics',
    strategy: ApiStrategy.REST,
    reason: 'System metrics are admin operations requiring proper authentication',
    restEndpoint: '/api/performance/metrics',
    examples: ['performanceApi.getMetrics()', 'performanceApi.getDatabaseStats()'],
  },
];

// ==================== HELPER FUNCTIONS ====================

export const getApiStrategyForFeature = (feature: string): ApiEndpointRule | undefined => {
  return API_CONSUMPTION_RULES.find(rule => rule.feature === feature);
};

export const shouldUseGraphQL = (feature: string): boolean => {
  const rule = getApiStrategyForFeature(feature);
  return rule?.strategy === ApiStrategy.GRAPHQL || rule?.strategy === ApiStrategy.HYBRID;
};

export const shouldUseREST = (feature: string): boolean => {
  const rule = getApiStrategyForFeature(feature);
  return rule?.strategy === ApiStrategy.REST || rule?.strategy === ApiStrategy.HYBRID;
};

export const getRecommendedEndpoint = (feature: string): ApiEndpointRule | undefined => {
  return getApiStrategyForFeature(feature);
};

// ==================== MIXED USAGE EXAMPLES ====================

export const HYBRID_EXAMPLES = {
  // Shopping Cart Page - Best of both worlds
  cartPage: {
    description: 'Cart page uses REST for mutations and GraphQL for data fetching',
    restOperations: ['addToCart', 'updateQuantity', 'removeFromCart', 'clearCart', 'applyCoupon'],
    graphqlOperations: ['cartDetails', 'cartWithProducts'],
    implementation: `
      // REST mutations for cart actions
      const { addToCart } = useCart();
      
      // GraphQL query for cart details with product information
      const { data: cartWithDetails } = useCartDetails();
    `,
  },

  // Product Management Admin
  productAdmin: {
    description: 'Product admin uses REST for CRUD, GraphQL for listing and search',
    restOperations: ['createProduct', 'updateProduct', 'deleteProduct', 'uploadImages'],
    graphqlOperations: ['products', 'featuredProducts', 'searchProducts', 'categories'],
    implementation: `
      // REST for admin operations
      const createProduct = async (data) => productsApi.create(data);
      
      // GraphQL for product listing
      const { data: products } = useProductsGraphQL({ filter, pagination });
    `,
  },

  // Order Management
  orderManagement: {
    description: 'Order placement via REST, history and details via GraphQL',
    restOperations: ['createOrder', 'cancelOrder', 'updateOrderStatus'],
    graphqlOperations: ['myOrders', 'orderDetails', 'orderStatistics'],
    implementation: `
      // REST for order placement
      const placeOrder = async (orderData) => ordersApi.create(orderData);
      
      // GraphQL for order history
      const { data: orders } = useOrderHistory({ pagination });
    `,
  },
};

export default API_CONSUMPTION_RULES;