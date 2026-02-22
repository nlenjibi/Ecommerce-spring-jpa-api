'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || 'N/A';
  
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/dashboard/customer?tab=orders');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Order Confirmed!
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your purchase!
          </p>
          
          <div className="inline-block bg-blue-50 rounded-lg px-6 py-3 mt-4">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-blue-600">{orderId}</p>
          </div>
        </div>

        {/* Order Confirmation Details */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            What Happens Next?
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Order Confirmation Email
                </h3>
                <p className="text-gray-600 text-sm">
                  You'll receive a confirmation email with your order details shortly.
                </p>
              </div>
              <svg className="w-6 h-6 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-yellow-600 font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Order Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  Our team will prepare your order for shipment within 1-2 business days.
                </p>
              </div>
              <svg className="w-6 h-6 text-yellow-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Shipment Notification
                </h3>
                <p className="text-gray-600 text-sm">
                  We'll send you tracking information when your order ships.
                </p>
              </div>
              <svg className="w-6 h-6 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Delivery
                </h3>
                <p className="text-gray-600 text-sm">
                  Your order will arrive according to the shipping method you selected.
                </p>
              </div>
              <svg className="w-6 h-6 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/dashboard/customer?tab=orders" className="block">
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Track Order</p>
                  <p className="text-xs text-gray-500">View order details</p>
                </div>
              </div>
            </Link>

            <Link href="/shop/products" className="block">
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Continue Shopping</p>
                  <p className="text-xs text-gray-500">Browse more products</p>
                </div>
              </div>
            </Link>

            <Link href="/support" className="block">
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Need Help?</p>
                  <p className="text-xs text-gray-500">Contact support</p>
                </div>
              </div>
            </Link>

            <a href="mailto:support@yourstore.com" className="block">
              <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Email Us</p>
                  <p className="text-xs text-gray-500">Get in touch</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard/customer?tab=orders" className="flex-1">
            <Button variant="primary" className="w-full" size="lg">
              View Order Details
            </Button>
          </Link>
          
          <Link href="/shop/products" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Auto-redirect Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Redirecting to your orders in <span className="font-semibold text-blue-600">{countdown}</span> seconds...
          </p>
        </div>
      </div>
    </div>
  );
}