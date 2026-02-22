import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Address Schema
export const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  region: z.string().min(2, 'Region is required'),
  postalCode: z.string().optional(),
  country: z.string().default('Ghana'),
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
  isDefault: z.boolean().default(false),
});

// Product Review Schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});

// Contact Form Schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Newsletter Schema
export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Checkout Schema
export const checkoutSchema = z.object({
  deliveryMethod: z.enum(['BUS_STATION', 'DIRECT_ADDRESS', 'EXPRESS']),
  paymentMethod: z.enum(['MOBILE_MONEY', 'CARD', 'CASH_ON_DELIVERY']),
  
  // Bus station fields
  busStationId: z.number().optional(),
  busStationName: z.string().optional(),
  
  // Direct address fields
  addressId: z.number().optional(),
  
  // Payment fields
  mobileMoneyNumber: z.string().optional(),
  mobileMoneyProvider: z.enum(['MTN', 'VODAFONE', 'AIRTELTIGO']).optional(),
  
  // Additional fields
  notes: z.string().optional(),
}).refine((data) => {
  if (data.deliveryMethod === 'BUS_STATION') {
    return !!data.busStationId;
  }
  if (data.deliveryMethod === 'DIRECT_ADDRESS') {
    return !!data.addressId;
  }
  return true;
}, {
  message: 'Please select a delivery location',
  path: ['deliveryMethod'],
}).refine((data) => {
  if (data.paymentMethod === 'MOBILE_MONEY') {
    return !!data.mobileMoneyNumber && !!data.mobileMoneyProvider;
  }
  return true;
}, {
  message: 'Please provide mobile money details',
  path: ['paymentMethod'],
});

// Product Filter Schema
export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  brand: z.string().optional(),
  inStock: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']).optional(),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
