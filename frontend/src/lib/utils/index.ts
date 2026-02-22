/**
 * Utility Functions Index
 * 
 * Central export point for all utility functions.
 * Import utilities from this file for cleaner imports throughout your app.
 * 
 * @example
 * // Instead of:
 * import { formatCurrency } from '@/lib/utils/format';
 * import { validateEmail } from '@/lib/utils/validation';
 * 
 * // You can do:
 * import { formatCurrency, validateEmail } from '@/lib/utils';
 */

// Class name utility
export { cn } from './cn';

// Formatting utilities
export {
  formatCurrency,
  formatCurrencyCompact,
  formatCurrencyRange,
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatDateRange,
  formatNumber,
  formatNumberCompact,
  formatPercentage,
  formatFileSize,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  generateExcerpt,
  formatPhoneNumber,
  formatRoleName,
  formatPermissionName,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  formatList,
  formatArrayToSentence,
  calculateDiscountPercentage,
  formatDiscount,
  getImageUrl,
} from './format';

// Re-export review utilities
export {
  canEditReview,
  canDeleteReview,
  canModerateReviews,
  canRespondToReview,
  canAccessAdminDashboard,
  canAccessSellerDashboard,
  canCreateReview,
  formatReviewDate,
  getRatingText,
  getDisplayName,
  getRoleStyles,
  getRoleDisplayName,
} from './review';

// Import for use in reviewUtils
import {
  canEditReview as _canEditReview,
  canDeleteReview as _canDeleteReview,
  canModerateReviews as _canModerateReviews,
  canRespondToReview as _canRespondToReview,
  canAccessAdminDashboard as _canAccessAdminDashboard,
  canAccessSellerDashboard as _canAccessSellerDashboard,
  canCreateReview as _canCreateReview,
  formatReviewDate as _formatReviewDate,
  getRatingText as _getRatingText,
  getDisplayName as _getDisplayName,
  getRoleStyles as _getRoleStyles,
} from './review';

export const reviewUtils = {
  canEditReview: _canEditReview,
  canDeleteReview: _canDeleteReview,
  canModerateReviews: _canModerateReviews,
  canRespondToReview: _canRespondToReview,
  canAccessAdminDashboard: _canAccessAdminDashboard,
  canAccessSellerDashboard: _canAccessSellerDashboard,
  canCreateReview: _canCreateReview,
  formatReviewDate: _formatReviewDate,
  getRatingText: _getRatingText,
  getDisplayName: _getDisplayName,
  getRoleStyles: _getRoleStyles,
};
