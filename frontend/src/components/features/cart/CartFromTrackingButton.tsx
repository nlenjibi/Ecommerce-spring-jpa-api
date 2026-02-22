'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCartFromTracking } from '@/lib/cartFromTracking';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Lock, Trash2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartFromTrackingButton() {
  const router = useRouter();
  const {
    getTrackedProducts,
    getTrackedProductsCount,
    createCartFromTrackedProducts,
    clearTrackedProducts
  } = useCartFromTracking();

  const { addToCart, isAuthenticated } = useCart();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const trackedProducts = getTrackedProducts();
  const trackedCount = getTrackedProductsCount();

  const handleCreateCartFromTracking = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart', {
        duration: 4000,
        icon: '🔒',
      });

      // Redirect to login with return URL
      router.push(`/login?returnTo=${encodeURIComponent('/products')}`);
      return;
    }

    if (trackedCount === 0) {
      toast.error('No tracked products to add to cart');
      return;
    }

    setLoading(true);

    try {
      console.log('🛒 Creating cart from tracked products...');

      // Try to create cart from tracking API
      const success = await createCartFromTrackedProducts();

      if (success) {
        toast.success(`Added ${trackedCount} tracked products to cart!`, {
          duration: 3000,
          icon: '🎉',
        });

        // Add each product to the current cart context
        let addedCount = 0;
        for (const product of trackedProducts) {
          try {
            await addToCart(product.productId);
            addedCount++;
          } catch (error) {
            console.error('Failed to add tracked product to cart:', error);
          }
        }

        if (addedCount > 0) {
          clearTrackedProducts(); // Clear after successful addition
        }
      } else {
        // Fallback: add each tracked product to cart individually
        console.log('🔄 Falling back to individual cart adds...');

        let addedCount = 0;
        for (const product of trackedProducts) {
          try {
            await addToCart(product.productId);
            addedCount++;
          } catch (error) {
            console.error('Failed to add tracked product to cart:', error);
          }
        }

        if (addedCount > 0) {
          toast.success(`Added ${addedCount} of ${trackedCount} products to cart!`);
          clearTrackedProducts(); // Clear after successful addition
        } else {
          toast.error('Failed to add any tracked products to cart');
        }
      }
    } catch (error) {
      console.error('Error creating cart from tracking:', error);
      toast.error('Failed to create cart from tracked products');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTrackedProducts = () => {
    clearTrackedProducts();
    toast.success('Tracked products cleared');
    setShowDetails(false);
  };

  // Don't show if no tracked products
  if (trackedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded Details Panel */}
      {showDetails && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 mb-2 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recently Viewed Products
            </h3>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {trackedProducts.slice(0, 5).map((product, index) => (
              <div
                key={index}
                className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {product.productName}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{product.category}</span>
                  <span className="text-sm font-semibold text-blue-600">
                    GHS {product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {trackedProducts.length > 5 && (
            <div className="px-4 py-2 bg-gray-50 text-center text-xs text-gray-500">
              + {trackedProducts.length - 5} more products
            </div>
          )}
        </div>
      )}

      {/* Main Floating Button */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {trackedCount} Tracked {trackedCount === 1 ? 'Product' : 'Products'}
              </p>
              {trackedProducts.length > 0 && (
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  Last: {trackedProducts[trackedProducts.length - 1].productName}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
          >
            {showDetails ? 'Hide' : 'View'}
          </button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleCreateCartFromTracking}
            disabled={loading}
            size="sm"
            className="flex-1 text-xs gap-2"
            variant="primary"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Adding...
              </>
            ) : isAuthenticated ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add All to Cart
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Login to Add
              </>
            )}
          </Button>

          <Button
            onClick={handleClearTrackedProducts}
            variant="outline"
            size="sm"
            className="text-xs px-3"
            title="Clear tracked products"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {!isAuthenticated && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Login required to add to cart
          </p>
        )}
      </div>
    </div>
  );
}