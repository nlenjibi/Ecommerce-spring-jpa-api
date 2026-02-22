'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from './ui/Button';
import { getImageUrl } from '@/lib/utils';
import { ShoppingCart, Lock } from 'lucide-react';

export function CartDropdown() {
  const { items, total, itemCount, isAuthenticated } = useCart();
  const router = useRouter();

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-6 z-50">
        <div className="px-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Login Required</h3>
          <p className="text-sm text-gray-600 mb-6">
            Please log in to view your cart and start shopping
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Log In
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => router.push('/register')}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (items.length === 0) {
    return (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-6 z-50">
        <div className="px-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-600 mb-4">
            Start adding items to your cart
          </p>
          <Link href="/shop/products">
            <Button variant="primary" className="w-full">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show cart with items
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl py-2 z-50">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="font-semibold text-gray-900 flex items-center justify-between">
          <span>Your Cart</span>
          <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </h3>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {items.map((item) => {
          const unitPrice = item.product.effectivePrice || item.product.price;
          const itemTotal = unitPrice * item.quantity;

          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-50 transition-colors">
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={getImageUrl(item.product.imageUrl || item.product.image)}
                  alt={item.product.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.quantity} × GHS {unitPrice.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold text-sm text-gray-900 flex-shrink-0">
                GHS {itemTotal.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <span className="font-semibold text-gray-700">Subtotal</span>
          <span className="font-bold text-xl text-blue-600">
            GHS {total.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/cart">
            <Button variant="secondary" className="w-full">
              View Cart
            </Button>
          </Link>
          <Link href="/checkout">
            <Button variant="primary" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}