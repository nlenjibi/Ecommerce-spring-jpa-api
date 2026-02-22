'use client';

/**
 * Checkout Page - REST API Implementation
 * 
 * Following REST/GraphQL API Strategy:
 * - REST: Used for ALL checkout operations (commands)
 *   * Fetch cart data
 *   * Create order
 *   * Process payment
 *   * Validate checkout data
 * 
 * - GraphQL: NOT used for checkout (checkout is transactional, needs ACID guarantees)
 * 
 * Checkout involves critical business operations (payment, inventory deduction, 
 * order creation) that require strong consistency, so REST is the correct choice.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/hooks/domain/use-checkout';
import { useAuth } from '@/context/AuthContext';
import { isAuthenticated as checkAuth } from '@/lib/utils/auth';
import { Button } from '@/components/ui/Button';
import { Truck, CreditCard, Shield, AlertCircle, Package, ChevronLeft, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const shippingMethods = [
  { value: 'STANDARD', label: 'Standard Shipping', cost: 0, days: '5-7 business days', icon: Truck },
  { value: 'EXPRESS', label: 'Express Shipping', cost: 15, days: '2-3 business days', icon: Package },
  { value: 'OVERNIGHT', label: 'Overnight Shipping', cost: 30, days: 'Next business day', icon: Truck },
];

const paymentMethods = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: '📱', description: 'MTN, Vodafone, AirtelTigo' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: '💳', description: 'Visa, Mastercard' },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: '💳', description: 'Direct from bank' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦', description: 'Direct bank deposit' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, items, subtotal, discount, itemCount, total: cartTotal, loading: cartLoading } = useCart();
  const { checkout, isProcessing, validationErrors } = useCheckout();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const orderPlacedRef = React.useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Ghana',
  });

  const [shippingMethod, setShippingMethod] = useState<'STANDARD' | 'EXPRESS' | 'OVERNIGHT'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<string>('MOBILE_MONEY');
  const [customerNotes, setCustomerNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  useEffect(() => {
    if (mounted && !authLoading) {
      const isAuth = isAuthenticated || checkAuth();
      if (!isAuth) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent('/shop/checkout')}`);
      }
    }
  }, [mounted, isAuthenticated, authLoading, router]);

  // Redirect if cart is empty - only on initial load, not after checkout
  useEffect(() => {
    if (!mounted || cartLoading || !cart) return;
    
    // Check if we just completed checkout (flag set in sessionStorage)
    const justCompletedCheckout = sessionStorage.getItem('checkout_completed');
    if (justCompletedCheckout) {
      sessionStorage.removeItem('checkout_completed');
      return; // Don't redirect, user is being redirected to success page
    }
    
    // Only redirect if this is initial load and cart is empty
    const hasItems = cart?.items?.length > 0 || itemCount > 0;
    if (!hasItems) {
      toast.error('Your cart is empty');
      router.push('/shop/cart');
    }
  }, [cart, itemCount, cartLoading, router, mounted]);

  // Calculate totals
  // Use cart's totalPrice if available, otherwise calculate from items
  const calculatedSubtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const effectiveSubtotal = subtotal > 0 ? subtotal : calculatedSubtotal;
  const shippingCost = shippingMethods.find(m => m.value === shippingMethod)?.cost || 0;
  const taxRate = 0.08;
  const taxAmount = (effectiveSubtotal - discount) * taxRate;
  const total = effectiveSubtotal - discount + shippingCost + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof ShippingAddress]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State/Region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // Format shipping address
    const formattedAddress = `${shippingAddress.fullName}\n${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}\n${shippingAddress.country}\nPhone: ${shippingAddress.phone}`;

    await checkout({
      shippingMethod,
      paymentMethod: paymentMethod as any,
      customerEmail: shippingAddress.email,
      customerName: shippingAddress.fullName,
      customerNotes,
      shippingAddress: formattedAddress,
      subtotal: effectiveSubtotal,
      totalAmount: total,
      taxAmount,
      shippingCost,
      discountAmount: discount,
    });
  };

  if (!mounted || authLoading || cartLoading || !cart || itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/shop/cart"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Validation Errors */}
        {validationErrors && validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-semibold mb-2">
                  Please resolve the following issues:
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">
                      {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="John Doe"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="+233 XX XXX XXXX"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Street address"
                  />
                  {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Accra"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Greater Accra"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="00233"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Shipping Method
                </h2>
              </div>

              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.value}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${shippingMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method.value}
                          checked={shippingMethod === method.value}
                          onChange={(e) => setShippingMethod(e.target.value as any)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{method.label}</p>
                            <p className="text-sm text-gray-500">{method.days}</p>
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">
                        {method.cost === 0 ? 'Free' : `GHS ${method.cost.toFixed(2)}`}
                      </p>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === method.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Notes (Optional)
              </h2>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Any special instructions for your order? (e.g., delivery instructions, gift message)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/marketing/terms-of-service" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/marketing/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand that my personal data will be processed to fulfill my order.
                </span>
              </label>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × GHS {(item.unitPrice ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      GHS {(item.totalPrice ?? 0).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Pricing */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">GHS {effectiveSubtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-GHS {discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Free' : `GHS ${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium">GHS {taxAmount.toFixed(2)}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>GHS {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full mb-4"
                onClick={handleCheckout}
                disabled={isProcessing || !agreedToTerms}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </span>
                ) : (
                  `Place Order - GHS ${total.toFixed(2)}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
