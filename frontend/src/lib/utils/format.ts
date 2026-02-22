/**
 * Formatting Utilities for Dates, Numbers, Text, and Currency
 */

import { USER_ROLES } from '@/lib/constants/constants';

// ==================== CURRENCY FORMATTING ====================
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const formatCurrencyCompact = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbol = currency === 'USD' ? '$' : currency;
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${amount.toFixed(0)}`;
  }
};

export const formatCurrencyRange = (
  min: number,
  max: number,
  currency: string = 'USD'
): string => {
  if (min === max) return formatCurrency(min, currency);
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};

// ==================== DATE/TIME FORMATTING ====================
export const formatDate = (
  date: string | Date,
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    return dateObj.toLocaleDateString();
  }
};

export const formatDateTime = (
  date: string | Date,
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    return dateObj.toLocaleString();
  }
};

export const formatTimeAgo = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date
): string => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${formatDate(start)} - ${end.getDate()}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })} ${end.getFullYear()}`;
  }
  return `${formatDate(start)} - ${formatDate(end)}`;
};

// ==================== NUMBER FORMATTING ====================
export const formatNumber = (
  number: number,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    return number.toString();
  }
};

export const formatNumberCompact = (
  number: number,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(number);
  } catch (error) {
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
  }
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// ==================== TEXT FORMATTING ====================
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + ellipsis;
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (word) =>
    word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  );
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateExcerpt = (
  text: string,
  wordCount: number = 25
): string => {
  const words = text.split(' ');
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '...';
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }

  return phone; // Return original if format doesn't match
};

// ==================== ROLE & PERMISSION FORMATTING ====================
export const formatRoleName = (role: string): string => {
  const roleNames: Record<string, string> = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.SELLER]: 'Seller',
    [USER_ROLES.USER]: 'User',
    [USER_ROLES.CUSTOMER]: 'Customer',
  };
  return roleNames[role] || capitalizeFirst(role);
};

export const formatPermissionName = (permission: string): string => {
  const permissionMap: Record<string, string> = {
    'create_review': 'Create Reviews',
    'edit_own_review': 'Edit Own Reviews',
    'delete_own_review': 'Delete Own Reviews',
    'moderate_reviews': 'Moderate Reviews',
    'view_admin_dashboard': 'View Admin Dashboard',
    'view_seller_dashboard': 'View Seller Dashboard',
    'create_product': 'Create Products',
    'manage_products': 'Manage Products',
    'view_own_orders': 'View Own Orders',
    'manage_orders': 'Manage Orders',
  };

  return permissionMap[permission] ||
    permission.split('_').map(capitalizeFirst).join(' ');
};

// ==================== VALIDATION HELPERS ====================
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ==================== ARRAY FORMATTING ====================
export const formatList = (
  items: string[],
  conjunction: string = 'and'
): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
};

export const formatArrayToSentence = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return capitalizeFirst(items[0]);

  const last = items.pop();
  return `${items.map(capitalizeFirst).join(', ')} and ${last}`;
};

// ==================== PRICE CALCULATIONS ====================
export const calculateDiscountPercentage = (
  originalPrice: number,
  salePrice: number
): number => {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return ((originalPrice - salePrice) / originalPrice) * 100;
};

export const formatDiscount = (
  originalPrice: number,
  salePrice: number
): string => {
  const discount = calculateDiscountPercentage(originalPrice, salePrice);
  return discount > 0 ? `${Math.round(discount)}% off` : '';
};

// ==================== EXPORT ====================
export default {
  // Currency
  formatCurrency,
  formatCurrencyCompact,
  formatCurrencyRange,

  // Dates
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatDateRange,

  // Numbers
  formatNumber,
  formatNumberCompact,
  formatPercentage,
  formatFileSize,

  // Text
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  generateExcerpt,
  formatPhoneNumber,

  // Roles & Permissions
  formatRoleName,
  formatPermissionName,

  // Validation
  isValidEmail,
  isValidPhone,
  isValidUrl,

  // Arrays
  formatList,
  formatArrayToSentence,

  // Price calculations
  calculateDiscountPercentage,
  formatDiscount,
};

// ==================== IMAGE UTILITIES ====================
export const getImageUrl = (
  imagePath?: any,
  fallback?: string
): string => {
  if (!imagePath) {
    return fallback || '/placeholder.svg';
  }

  // Handle object-based image structures (common in GraphQL/some APIs)
  let actualPath = typeof imagePath === 'string' ? imagePath : null;
  if (!actualPath && typeof imagePath === 'object') {
    actualPath = imagePath.url || imagePath.imageUrl || imagePath.src || imagePath.path;
  }

  if (!actualPath || typeof actualPath !== 'string') {
    return fallback || '/placeholder.svg';
  }

  // If it's already a full URL, return as is
  if (actualPath.startsWith('http')) {
    return actualPath;
  }

  // If it starts with /, assume it's relative to the domain
  if (actualPath.startsWith('/')) {
    return actualPath;
  }

  // Otherwise, assume it's a relative path
  return `/${actualPath}`;
};
