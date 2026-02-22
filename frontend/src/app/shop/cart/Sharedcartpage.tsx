'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getAuthToken } from '@/lib/utils/auth';

interface SharedCartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SharedCart {
  id: number;
  items: SharedCartItem[];
  itemCount: number;
  subtotal: number;
  totalPrice: number;
  discount: number;
  couponCode?: string;
}

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

const getUsername = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('username');
};

export default function SharedCartPage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params?.shareToken as string;

  const [cart, setCart] = useState<SharedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    if (shareToken) {
      fetchSharedCart();
    }
  }, [shareToken]);

  const fetchSharedCart = async () => {
    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(
        `${API_BASE_URL}/v1/carts/shared/${shareToken}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch shared cart');
      }

      const responseData = await response.json();
      
      // Handle wrapped response
      const data = responseData.success !== undefined && responseData.data !== undefined
        ? responseData.data
        : responseData;
      
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch shared cart:', error);
      toast.error('Failed to load shared cart. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloneCart = async () => {
    setCloning(true);
    try {
      const username = getUsername();
      const token = getAuthToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Build endpoint with username query param if authenticated
      const endpoint = username
        ? `/v1/carts/shared/${shareToken}/clone?username=${encodeURIComponent(username)}`
        : `/v1/carts/shared/${shareToken}/clone`;

      const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clone cart');
      }

      const responseData = await response.json();
      
      // Handle wrapped response
      const newCart = responseData.success !== undefined && responseData.data !== undefined
        ? responseData.data
        : responseData;
      
      // Store new cart ID
      localStorage.setItem('cart_id', newCart.id.toString());
      
      toast.success('Cart cloned successfully!');
      router.push('/cart');
    } catch (error) {
      console.error('Failed to clone cart:', error);
      toast.error('Failed to clone cart. Please try again.');
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared cart...</p>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cart Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            This shared cart link may have expired or is invalid.
          </p>
          <Link href="/shop/products">
            <Button variant="primary" size="lg">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Shared Cart
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Someone shared this cart with you
          </h1>
          <p className="text-gray-600 mt-2">
            Review the items and clone this cart to your account
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-6 flex items-center gap-6"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product?.name || 'Product image'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-4xl">🛍️</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.product?.name || 'Product information unavailable'}
                  </h3>
                  <p className="text-blue-600 font-bold mt-2">
                    GHS {(item.unitPrice ?? 0).toFixed(2)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-lg font-semibold">{item.quantity}</p>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    GHS {(item.totalPrice ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Cart Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>
                  <span>{cart.itemCount}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>GHS {cart.subtotal.toFixed(2)}</span>
                </div>

                {cart.discount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-GHS {cart.discount.toFixed(2)}</span>
                    </div>
                    {cart.couponCode && (
                      <div className="text-sm text-gray-500">
                        Coupon: {cart.couponCode}
                      </div>
                    )}
                  </>
                )}

                <hr />
                
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>GHS {cart.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Clone Cart Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full mb-4"
                onClick={handleCloneCart}
                disabled={cloning}
              >
                {cloning ? 'Cloning...' : '📋 Clone to My Cart'}
              </Button>

              <p className="text-sm text-gray-500 text-center mb-4">
                This will create a copy of this cart in your account
              </p>

              <Link href="/shop/products">
                <Button variant="outline" className="w-full">
                  Browse More Products
                </Button>
              </Link>

              {/* Share Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>
                    Shared carts are view-only. Clone this cart to make changes
                    and checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}