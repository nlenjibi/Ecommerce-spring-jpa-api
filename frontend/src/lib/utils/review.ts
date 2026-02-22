import { UserReview, User } from '@/types';
import { ordersApi } from '@/lib/api/endpoints/orders.api';
import { USER_ROLES, PERMISSIONS, hasPermission, isAdmin, isSeller, isRegularUser } from '@/lib/constants/roles';

/**
 * Check if current user can edit their own review
 */
export const canEditReview = (review: UserReview, currentUser: User | null): boolean => {
  if (!currentUser || !review.userId) return false;
  const isOwner = review.userId === currentUser.id;
  const hasEditPermission = hasPermission(currentUser.role as any, PERMISSIONS.EDIT_OWN_REVIEW);
  return isOwner && hasEditPermission;
};

/**
 * Check if current user can delete their own review
 */
export const canDeleteReview = (review: UserReview, currentUser: User | null): boolean => {
  if (!currentUser || !review.userId) return false;
  const isOwner = review.userId === currentUser.id;
  const hasDeletePermission = hasPermission(currentUser.role as any, PERMISSIONS.DELETE_OWN_REVIEW);
  return isOwner && hasDeletePermission;
};

/**
 * Check if current user has admin permissions
 */
export const canModerateReviews = (currentUser: User | null): boolean => {
  return currentUser ? hasPermission(currentUser.role as any, PERMISSIONS.MODERATE_REVIEWS) : false;
};

/**
 * Check if current user can respond to reviews
 */
export const canRespondToReview = (currentUser: User | null): boolean => {
  return currentUser ? hasPermission(currentUser.role as any, PERMISSIONS.RESPOND_TO_REVIEW) : false;
};

/**
 * Check if current user can access admin dashboard
 */
export const canAccessAdminDashboard = (currentUser: User | null): boolean => {
  return currentUser ? hasPermission(currentUser.role as any, PERMISSIONS.VIEW_ADMIN_DASHBOARD) : false;
};

/**
 * Check if current user can access seller dashboard
 */
export const canAccessSellerDashboard = (currentUser: User | null): boolean => {
  return currentUser ? hasPermission(currentUser.role as any, PERMISSIONS.VIEW_SELLER_DASHBOARD) : false;
};

/**
 * Check if user is admin or seller (for responses)
 */
export const canRespondToReviewLegacy = (currentUser: User | null): boolean => {
  return canModerateReviews(currentUser) || canAccessSellerDashboard(currentUser);
};

/**
 * Check if product belongs to seller (for seller-specific review access)
 */
export const isSellerProduct = async (productId: number, sellerId: number): Promise<boolean> => {
  try {
    // This would need an API call to check product ownership
    // For now, we'll assume seller can access all their products
    // In production, this should call: productsApi.isProductOwnedBySeller(productId, sellerId)
    return true; // Placeholder - implement actual check
  } catch (error) {
    console.error('Error checking product ownership:', error);
    return false;
  }
};

/**
 * Check if user can create reviews for a product
 */
export const canCreateReview = (currentUser: User | null, productId: number): boolean => {
  if (!currentUser) return false;

  const hasCreatePermission = hasPermission(currentUser.role as any, PERMISSIONS.CREATE_REVIEW);
  if (!hasCreatePermission) return false;

  // Admins can create reviews for any product
  if (isAdmin(currentUser.role as any)) return true;

  // Sellers might have restrictions - for now, allow them
  if (isSeller(currentUser.role as any)) return true;

  // Regular users and customers should be able to review purchased products
  // We'll verify this in the UI layer
  return true;
};

/**
 * Verify purchase status for current user and product
 */
export const verifyPurchase = async (productId: number, userId: number): Promise<boolean> => {
  try {
    // Get user's orders
    const response = await ordersApi.getUserOrders();

    if (!response.orders || response.orders.length === 0) {
      return false;
    }

    // Check if user has any completed/delivered orders containing this product
    const hasPurchased = response.orders.some((order: any) => {
      // Check if order is completed/delivered
      const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED';

      if (!isCompleted) return false;

      // Check if order items contain this product
      return order.items?.some((item: any) => {
        return item.productId === productId || item.product?.id === productId;
      });
    });

    return hasPurchased;
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return false;
  }
};

/**
 * Format review date for display
 */
export const formatReviewDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
};

/**
 * Convert rating to descriptive text
 */
export const getRatingText = (rating: number): string => {
  switch (rating) {
    case 5:
      return 'Excellent!';
    case 4:
      return 'Good';
    case 3:
      return 'Average';
    case 2:
      return 'Poor';
    case 1:
      return 'Terrible';
    default:
      return '';
  }
};

/**
 * Get user display name from review data
 */
export const getDisplayName = (review: UserReview): string => {
  return review.userName || 'Anonymous';
};

/**
 * Get role-based styling for UI components
 */
export const getRoleStyles = (currentUser: User | null) => {
  if (!currentUser) return null;

  const role = currentUser.role as any;
  switch (role) {
    case USER_ROLES.ADMIN:
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-900',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        accentColor: '#ef4444'
      };
    case USER_ROLES.SELLER:
      return {
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-900',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        accentColor: '#3b82f6'
      };
    case USER_ROLES.USER:
    case USER_ROLES.CUSTOMER:
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-900',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        accentColor: '#10b981'
      };
    default:
      return {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-900',
        buttonColor: 'bg-gray-600 hover:bg-gray-700',
        accentColor: '#6b7280'
      };
  }
};

/**
 * Get role display name for UI
 */
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.SELLER]: 'Seller',
    [USER_ROLES.USER]: 'User',
    [USER_ROLES.CUSTOMER]: 'Customer',
  };
  return roleNames[role] || 'Unknown';
};