/**
 * Admin Hooks
 * 
 * Hooks for admin panel functionality
 */

// Dashboard & Analytics
export { useAdminDashboard, useAdminAnalytics } from './use-admin-dashboard';

// Product Management
export { 
  useAdminProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct 
} from './use-admin-products';

// Order Management
export { 
  useAdminOrders, 
  useUpdateOrderStatus, 
  useRefundOrder 
} from './use-admin-orders';

// User Management
export { 
  useAdminUsers, 
  useUpdateUserStatus, 
  useUpdateUserRole 
} from './use-admin-users';

// Category Management
export { 
  useAdminCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from './use-admin-categories';

// Promotion Management
export { 
  useAdminPromotions, 
  useCreatePromotion, 
  useUpdatePromotion, 
  useDeletePromotion 
} from './use-admin-promotions';

// Tag Management
export { 
  useAdminTags, 
  useCreateTag, 
  useUpdateTag, 
  useDeleteTag 
} from './use-admin-tags';
