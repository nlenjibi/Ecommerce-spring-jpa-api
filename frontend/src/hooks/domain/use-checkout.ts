/**
 * useCheckout Hook
 * 
 * Handles the complete checkout flow including:
 * - Cart validation
 * - Order creation from cart
 * - Payment processing
 * - Post-checkout cleanup
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { clearCartId } from '@/lib/utils/cart';
import toast from 'react-hot-toast';
import { ordersApi, Order } from '@/lib/api/endpoints/orders.api';
import { getAuthToken } from '@/lib/utils/auth';

// API Configuration
const _rawApiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9190';
const API_BASE_URL = (() => {
  try {
    let u = _rawApiBase.trim();
    if (u.endsWith('/')) u = u.slice(0, -1);
    if (u.toLowerCase().endsWith('/api')) return u;
    return `${u}/api`;
  } catch (e) {
    return 'http://localhost:9190/api';
  }
})();

interface CheckoutOptions {
  shippingMethod?: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  customerEmail?: string;
  customerName?: string;
  customerNotes?: string;
  shippingAddress?: string;
  subtotal?: number;
  totalAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
  couponCode?: string;
}

// Order interface is now imported from orders.api

export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ message: string }[]>([]);
  const router = useRouter();
  const { cart, cartId, fetchCart, clearCart: clearCartContext } = useCart();

  const getUsername = (): string | null => {
    if (globalThis.window === undefined) return null;
    for (const key of ['user', 'user_data']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        return parsed?.username || parsed?.firstName || parsed?.email || null;
      } catch {
        // ignore malformed JSON
      }
    }
    return null;
  };

  /**
   * Create order from cart
   */
  const createOrder = async (options: CheckoutOptions = {}): Promise<Order | null> => {
    if (!cart || !cartId) {
      toast.error('No active cart found');
      return null;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return null;
    }

    // Basic validation for required fields
    if (!options.customerEmail && !getUsername()) {
      toast.error('Email is required for checkout');
      return null;
    }

    if (!options.shippingAddress) {
      toast.error('Shipping address is required');
      return null;
    }

    setIsProcessing(true);

    try {
      console.log('🛒 Creating order from cart:', cartId);
      console.log('🛒 Cart items:', JSON.stringify(cart.items, null, 2));
      console.log('🛒 Cart items count:', cart.items?.length);

      const token = getAuthToken();

      if (!token) {
        toast.error('Please login to complete your order');
        router.push('/auth/login?callbackUrl=%2Fshop%2Fcheckout');
        setIsProcessing(false);
        return null;
      }

      // Prepare optional order data
      const currentSubtotal = options.subtotal ?? cart.subtotal ?? 0;
      const currentDiscount = options.discountAmount ?? cart.discount ?? 0;
      const currentShipping = options.shippingCost ?? 0;
      const currentTax = options.taxAmount ?? 0;
      const currentTotal = options.totalAmount ?? (currentSubtotal - currentDiscount + currentShipping + currentTax);

      const orderRequestData = {
        shippingAddress: options.shippingAddress || 'No address provided',
        shippingMethod: options.shippingMethod || 'STANDARD',
        shippingCost: currentShipping,
        paymentMethod: options.paymentMethod || 'MOBILE_MONEY',
        customerNotes: options.customerNotes || '',
      };

      console.log('📦 Order request data:', orderRequestData);

      toast.loading('Processing your order...', { id: 'create-order' });

      // Create order from cart using new endpoint
      const responseData = await ordersApi.createFromCart(cartId, orderRequestData);

      // The response is wrapped in StandardResponse
      const order = responseData.data;

      console.log('✅ Order created successfully:', order);
      console.log('✅ Order items in response:', order.items?.length);

      // Clear cart after successful order
      clearCartId();
      
      if (cart?.id) {
        await clearCartContext();
      }
      
      await fetchCart();

      toast.success(`Order ${order.orderNumber} placed successfully!`, { id: 'create-order' });

      return order;
    } catch (error: any) {
      console.error('❌ Checkout failed:', error);
      toast.error(error.message || 'Failed to complete checkout', { id: 'create-order' });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Complete checkout and redirect to success page
   */
  const checkout = async (options: CheckoutOptions = {}): Promise<void> => {
    const order = await createOrder(options);

    if (order) {
      sessionStorage.setItem('checkout_completed', 'true');
      router.push(`/shop/checkout/success?orderId=${order.orderNumber}`);
    }
  };

  return {
    checkout,
    createOrder,
    isProcessing,
    validationErrors,
  };
}