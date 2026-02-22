/**
 * Zod Validation Schemas for Form Validation
 */

import { z } from 'zod';
import { VALIDATION } from '@/lib/constants/constants';

// ==================== AUTH VALIDATION ====================
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  password: z.string()
    .min(1, 'Password is required')
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`),

  rememberMe: z.boolean().default(false),
});

export const registerSchema = z.object({
  username: z.string()
    .min(VALIDATION.USERNAME_MIN_LENGTH, `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`)
    .max(VALIDATION.USERNAME_MAX_LENGTH, `Username must be less than ${VALIDATION.USERNAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),

  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  password: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),

  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),

  phoneNumber: z.string()
    .regex(VALIDATION.PHONE_REGEX, 'Invalid phone number')
    .optional()
    .or(z.literal('')),

  agreedToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const passwordResetSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export const newPasswordSchema = z.object({
  password: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ==================== PROFILE VALIDATION ====================
export const profileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),

  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  phoneNumber: z.string()
    .regex(VALIDATION.PHONE_REGEX, 'Invalid phone number')
    .optional()
    .or(z.literal('')),

  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),

  newPassword: z.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ==================== ADDRESS VALIDATION ====================
export const addressSchema = z.object({
  label: z.string()
    .min(1, 'Address label is required')
    .max(50, 'Label too long'),

  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long'),

  street: z.string()
    .min(1, 'Street address is required')
    .max(200, 'Street address too long'),

  apartment: z.string()
    .max(50, 'Apartment number too long')
    .optional()
    .or(z.literal('')),

  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City name too long'),

  state: z.string()
    .min(1, 'State is required')
    .max(100, 'State name too long'),

  postalCode: z.string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code too long'),

  country: z.string()
    .min(1, 'Country is required')
    .max(100, 'Country name too long'),

  isDefault: z.boolean().default(false),
  type: z.enum(['home', 'work', 'other']).default('home'),
});

// ==================== PRODUCT VALIDATION ====================
export const productReviewSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),

  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .optional(),

  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters'),

  recommend: z.boolean().default(true),
});

export const productQuestionSchema = z.object({
  question: z.string()
    .min(10, 'Question must be at least 10 characters')
    .max(500, 'Question must be less than 500 characters'),
});

// ==================== CART/VALIDATION ====================
export const cartItemSchema = z.object({
  productId: z.number().positive('Invalid product'),
  quantity: z.number()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
});

export const couponSchema = z.object({
  code: z.string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code too long'),
});

// ==================== ORDER VALIDATION ====================
export const checkoutSchema = z.object({
  shippingAddressId: z.number().positive('Please select a shipping address'),
  billingAddressId: z.number().positive('Please select a billing address').optional(),

  paymentMethod: z.enum(['credit_card', 'paypal', 'stripe'], {
    errorMap: () => ({ message: 'Please select a payment method' })
  }),

  savePaymentMethod: z.boolean().default(false),
  saveShippingAddress: z.boolean().default(true),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export const paymentMethodSchema = z.object({
  type: z.enum(['credit_card', 'debit_card', 'paypal']),
  cardNumber: z.string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number too long')
    .regex(/^\d+$/, 'Card number must contain only numbers')
    .optional(),

  expiryMonth: z.string()
    .length(2, 'Expiry month must be 2 digits')
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid expiry month')
    .optional(),

  expiryYear: z.string()
    .length(4, 'Expiry year must be 4 digits')
    .regex(/^\d{4}$/, 'Invalid expiry year')
    .optional(),

  cvv: z.string()
    .min(3, 'CVV must be at least 3 digits')
    .max(4, 'CVV must be at most 4 digits')
    .regex(/^\d+$/, 'CVV must contain only numbers')
    .optional(),

  nameOnCard: z.string()
    .min(1, 'Name on card is required')
    .max(100, 'Name too long')
    .optional(),
});

// ==================== SEARCH & FILTER VALIDATION ====================
export const searchSchema = z.object({
  query: z.string()
    .max(100, 'Search query too long')
    .optional(),

  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),

  sortBy: z.enum(['relevance', 'price-low', 'price-high', 'newest', 'rating']).default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// ==================== CONTACT FORM VALIDATION ====================
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),

  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject too long'),

  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),

  category: z.enum(['general', 'technical', 'billing', 'returns', 'other']).default('general'),
});

// ==================== NEWSLETTER VALIDATION ====================
export const newsletterSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  preferences: z.array(z.enum([
    'product_updates',
    'special_offers',
    'weekly_deals',
    'new_arrivals'
  ])).min(1, 'Select at least one preference'),
});

// ==================== FILE UPLOAD VALIDATION ====================
export const imageUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      return allowedTypes.includes(file.type);
    }, 'File must be an image (JPEG, PNG, WEBP, GIF)'),

  maxWidth: z.number().min(100).max(4000).optional(),
  maxHeight: z.number().min(100).max(4000).optional(),
});

// ==================== EXPORT TYPES ====================
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type NewPasswordData = z.infer<typeof newPasswordSchema>;
export type ProfileData = z.infer<typeof profileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type AddressData = z.infer<typeof addressSchema>;
export type ProductReviewData = z.infer<typeof productReviewSchema>;
export type ProductQuestionData = z.infer<typeof productQuestionSchema>;
export type CartItemData = z.infer<typeof cartItemSchema>;
export type CouponData = z.infer<typeof couponSchema>;
export type CheckoutData = z.infer<typeof checkoutSchema>;
export type PaymentMethodData = z.infer<typeof paymentMethodSchema>;
export type SearchData = z.infer<typeof searchSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;

// ==================== VALIDATION HELPERS ====================
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path.join('.')] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _general: 'Validation failed' } };
  }
};

export const getFieldError = (
  errors: Record<string, string>,
  fieldName: string
): string | undefined => {
  return errors[fieldName];
};

export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

// ==================== DEFAULT EXPORT ====================
export default {
  // Schemas
  loginSchema,
  registerSchema,
  passwordResetSchema,
  newPasswordSchema,
  profileSchema,
  changePasswordSchema,
  addressSchema,
  productReviewSchema,
  productQuestionSchema,
  cartItemSchema,
  couponSchema,
  checkoutSchema,
  paymentMethodSchema,
  searchSchema,
  contactSchema,
  newsletterSchema,
  imageUploadSchema,

  // Types
  type: {
    LoginData,
    RegisterData,
    PasswordResetData,
    NewPasswordData,
    ProfileData,
    ChangePasswordData,
    AddressData,
    ProductReviewData,
    ProductQuestionData,
    CartItemData,
    CouponData,
    CheckoutData,
    PaymentMethodData,
    SearchData,
    ContactData,
    NewsletterData,
    ImageUploadData,
  },

  // Helpers
  validateForm,
  getFieldError,
  hasErrors,
};
