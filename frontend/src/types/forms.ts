import { ProductCondition, DeliveryMethod } from './index';

// ==================== Base Form Types ====================
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface FormState {
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// ==================== Auth Form Types ====================
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  agreeToTerms: boolean;
  newsletter: boolean;
}

export interface PasswordResetFormData {
  email: string;
}

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

// ==================== Product Form Types ====================
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  categoryId: number;
  sku: string;
  stockQuantity: number;
  condition: ProductCondition;
  images: File[];
  specifications: Record<string, any>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface ProductFilterFormData {
  query: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock: boolean;
  featured: boolean;
  trending: boolean;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

// ==================== Order Form Types ====================
export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  shippingMethod: string;
  paymentMethod: string;
  deliveryMethod: DeliveryMethod;
  busStationId?: number;
  addressId?: number;
  couponCode?: string;
  customerNotes?: string;
  agreeToTerms: boolean;
}

export interface OrderFilterFormData {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerEmail?: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

// ==================== Review Form Types ====================
export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  recommended: boolean;
  images: File[];
}

export interface ReviewFilterFormData {
  rating?: number;
  verified?: boolean;
  hasImages?: boolean;
  sortBy: 'recent' | 'helpful' | 'rating-high' | 'rating-low';
}

// ==================== Profile Form Types ====================
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: File;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==================== Contact Form Types ====================
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'sales' | 'technical';
}

// ==================== Newsletter Form Types ====================
export interface NewsletterFormData {
  email: string;
  preferences: {
    promotions: boolean;
    newProducts: boolean;
    tips: boolean;
  };
}

// ==================== Search Form Types ====================
export interface SearchFormData {
  query: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
}

// ==================== File Upload Form Types ====================
export interface FileUploadFormData {
  files: File[];
  category: 'product' | 'avatar' | 'review';
  maxSize: number;
  allowedTypes: string[];
}
