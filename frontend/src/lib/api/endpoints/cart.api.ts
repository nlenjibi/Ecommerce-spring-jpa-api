import { request } from '../core/client';
import { StandardResponse } from '../core/types';

export interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
  product: any;
  variant?: any;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

/**
 * Cart API
 */
export const cartApi = {
  /**
   * Get user's cart
   */
  getCart: () =>
    request<StandardResponse<Cart>>({
      method: 'GET',
      url: '/v1/cart',
    }),

  /**
   * Add item to cart
   */
  addItem: (data: {
    productId: number;
    variantId?: number;
    quantity: number;
  }) =>
    request<StandardResponse<Cart>>({
      method: 'POST',
      url: '/v1/cart/items',
      data,
    }),

  /**
   * Update cart item quantity
   */
  updateItem: (itemId: number, quantity: number) =>
    request<StandardResponse<Cart>>({
      method: 'PUT',
      url: `/v1/cart/items/${itemId}`,
      data: { quantity },
    }),

  /**
   * Remove item from cart
   */
  removeItem: (itemId: number) =>
    request<StandardResponse<Cart>>({
      method: 'DELETE',
      url: `/v1/cart/items/${itemId}`,
    }),

  /**
   * Clear cart
   */
  clearCart: () =>
    request<StandardResponse<null>>({
      method: 'DELETE',
      url: '/v1/cart',
    }),

  /**
   * Apply coupon code
   */
  applyCoupon: (code: string) =>
    request<StandardResponse<Cart>>({
      method: 'POST',
      url: '/v1/cart/coupon',
      data: { code },
    }),

  /**
   * Remove coupon
   */
  removeCoupon: () =>
    request<StandardResponse<Cart>>({
      method: 'DELETE',
      url: '/v1/cart/coupon',
    }),
};
