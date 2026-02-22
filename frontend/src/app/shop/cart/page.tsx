'use client';

/**
 * Cart Page - REST API Implementation
 * 
 * Following REST/GraphQL API Strategy:
 * - REST: Used for ALL cart operations (commands)
 *   * Fetch cart data
 *   * Add/update/remove items
 *   * Apply/remove coupons
 *   * Validate cart
 *   * Share cart
 *   * Save for later
 *   * Checkout
 * 
 * - GraphQL: NOT used for cart (cart is transactional, needs real-time consistency)
 * 
 * Cart operations are state-changing commands, so REST is the correct choice.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { isAuthenticated as checkAuth } from '@/lib/utils/auth';
import { Button } from '@/components/ui/Button';
import { SkeletonCheckout } from '@/components/skeletons';
import { ShoppingCart, Trash2, Heart, Share2, MoreVertical, AlertCircle, CheckCircle, Gift, Truck, Shield, ArrowRight, Plus, Minus } from 'lucide-react';
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/constants/constants';
import toast from 'react-hot-toast';
import Image from 'next/image';

// ==================== Components ====================

const EmptyCartView = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-16">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingCart className="w-12 h-12 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Your cart is empty
      </h1>
      <p className="text-gray-600 mb-8">
        Looks like you haven&apos;t added any products to your cart yet. Start shopping to find amazing products!
      </p>
      <Link href="/shop/products">
        <Button variant="primary" size="lg" className="w-full sm:w-auto">
          Start Shopping
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  </div>
);

const CartItemSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-24 h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const ValidationIssuesAlert = ({ issues, onResolve }: { issues: any[]; onResolve?: () => void }) => (
  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
    <div className="flex items-start">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-red-800 font-semibold mb-2">
          Cart Validation Issues
        </h3>
        <div className="space-y-2">
          {issues.map((issue, index) => (
            <div key={index} className="text-red-700 text-sm">
              <span className="font-medium">{issue.productName}:</span>{' '}
              {issue.message}
              {issue.type === 'PRICE_CHANGED' && issue.oldPrice && issue.newPrice && (
                <span className="ml-2 text-red-600">
                  (GHS {issue.oldPrice.toFixed(2)} → GHS {issue.newPrice.toFixed(2)})
                </span>
              )}
              {issue.type === 'INSUFFICIENT_STOCK' && (
                <span className="ml-2 text-red-600">
                  (Available: {issue.availableQuantity})
                </span>
              )}
            </div>
          ))}
        </div>
        {onResolve && (
          <button
            onClick={onResolve}
            className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium underline"
          >
            Resolve Issues
          </button>
        )}
      </div>
    </div>
  </div>
);

const CouponSection = ({
  couponCode,
  discount,
  onApply,
  onRemove,
  loading,
}: {
  couponCode?: string;
  discount: number;
  onApply: (code: string) => void;
  onRemove: () => void;
  loading: boolean;
}) => {
  const [code, setCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
      setCode('');
    }
  };

  if (couponCode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            <div>
              <span className="text-green-800 font-semibold">
                Coupon Applied: {couponCode}
              </span>
              <p className="text-green-600 text-sm">
                You saved GHS {discount.toFixed(2)}!
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            disabled={loading}
            className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 hover:bg-green-100 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Gift className="w-4 h-4" />
          Have a coupon code?
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
          />
          <Button
            variant="outline"
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="whitespace-nowrap"
          >
            Apply
          </Button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700 px-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const CartItemRow = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading,
}: {
  item: any;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  loading: boolean;
}) => {
  const productImage = item.product?.imageUrl || '/placeholder.png';
  const productName = item.product?.name || 'Product Unavailable';
  const isOutOfStock = item.product?.inStock === false;
  const maxQuantity = item.product?.stockQuantity || 99;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 animate-in fade-in-50 duration-300">
      {/* Product Image */}
      <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        <Image
          src={productImage}
          alt={productName}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={item.product?.slug ? `/shop/products/${item.product.slug}` : '/shop/products'}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
        >
          {productName}
        </Link>
        <p className="text-gray-500 text-sm mt-1">
          {typeof item.product?.category === 'object'
            ? item.product?.category?.name
            : item.product?.category}
        </p>
        <div className="flex items-center gap-2 mt-2">
          
          {isOutOfStock && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onUpdateQuantity(item.product?.id ?? item.id, item.quantity - 1)}
          disabled={loading || item.quantity <= 1}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.product?.id ?? item.id, item.quantity + 1)}
          disabled={loading || item.quantity >= maxQuantity}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Item Total */}
      <div className="text-right min-w-[100px]">
        <p className="text-xl font-bold text-gray-900">
          GHS {(item.totalPrice ?? 0).toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.product?.id ?? item.id)}
        disabled={loading}
        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-2"
        title="Remove item"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

// ==================== Main Component ====================

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    itemCount,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading,
    checkout,
    cartId,
    applyCoupon,
    removeCoupon,
    validationResult,
    validateCart,
    shareCart,
    saveForLater,
    cart,
    total,
  } = useCart();

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate additional costs
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = total * TAX_RATE;
  const finalTotal = total + shipping + tax;

  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckout = async () => {
    if (!mounted) return;

    // Check auth directly from localStorage to avoid context sync issues
    const isAuth = isAuthenticated || checkAuth();

    if (!isAuth) {
      toast.error('Please login to checkout');
      if (cartId) {
        localStorage.setItem('checkout_cart_id', cartId.toString());
      }
      router.push(`/auth/login?callbackUrl=${encodeURIComponent('/shop/checkout')}`);
      return;
    }

    if (itemCount === 0) {
      toast.error('Cannot checkout an empty cart');
      return;
    }

    // Navigate to checkout page
    router.push('/shop/checkout');
  };

  const handleShareCart = async () => {
    const shareUrl = await shareCart();
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    }
  };

  const handleSaveForLater = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save items');
      return;
    }
    await saveForLater();
    toast.success('Items saved for later');
  };

  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleValidate = async () => {
    if (typeof validateCart === 'function') {
      await validateCart();
    }
  };

  // Empty cart view
  if (items.length === 0 && !loading) {
    return <EmptyCartView />;
  }

  // Loading view
  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <SkeletonCheckout variant="payment" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Loading overlay */}
      {(loading || isCheckingOut) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-700 font-medium">
              {isCheckingOut ? 'Processing checkout...' : 'Updating cart...'}
            </span>
          </div>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            {cartId && (
              <p className="text-sm text-gray-500 mt-1">Cart ID: {cartId}</p>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-white border border-gray-200 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
              Actions
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden">
                <button
                  onClick={() => { handleShareCart(); setShowActions(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-gray-500" />
                  Share Cart
                </button>
                <button
                  onClick={() => { handleSaveForLater(); setShowActions(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Heart className="w-4 h-4 text-gray-500" />
                  Save for Later
                </button>
                <button
                  onClick={() => { handleClearCart(); setShowActions(false); }}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Validation Issues */}
        {validationResult && !validationResult.valid && (
          <ValidationIssuesAlert
            issues={validationResult.issues}
            onResolve={handleValidate}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                loading={loading}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Coupon Section */}
              <CouponSection
                couponCode={cart?.couponCode}
                discount={discount}
                onApply={applyCoupon}
                onRemove={removeCoupon}
                loading={loading}
              />

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium">GHS {subtotal.toFixed(2)}</span>
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
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `GHS ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax ({TAX_RATE * 100}%)</span>
                  <span className="font-medium">GHS {tax.toFixed(2)}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>GHS {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-medium text-blue-700 mb-1">
                    <span>Free Shipping Progress</span>
                    <span>{freeShippingProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-700 flex items-center gap-2">
                    <Truck className="w-3 h-3" />
                    <span>Add GHS {remainingForFreeShipping.toFixed(2)} more for free shipping!</span>
                  </div>
                </div>
              )}

              {subtotal >= FREE_SHIPPING_THRESHOLD && (
                <div className="mb-4 bg-green-50 p-3 rounded-lg text-xs text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>You qualify for FREE shipping!</span>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full mb-3"
                disabled={
                  loading ||
                  isCheckingOut ||
                  itemCount === 0 ||
                  (validationResult && !validationResult.valid)
                }
                onClick={handleCheckout}
              >
                {isCheckingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </span>
                ) : !isAuthenticated ? (
                  'Login to Checkout'
                ) : (
                  <span className="flex items-center gap-2">
                    Checkout
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <Link href="/shop/products" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Free Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
