'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product, StockStatus } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '../../ui/Button';
import { DisabledActionTooltip } from '../DisabledActionTooltip';
import { PromotionBadge } from './ProductBadges';
import { getImageUrl } from '@/lib/utils';
import { useTracking } from '@/lib/services/tracking';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { trackAddToCart, trackProductClick, trackWishlistAdd } = useTracking();
  const inWishlist = isInWishlist(product.id);

  // Determine stock status from both legacy and GraphQL inventory fields.
  const inventoryStatus = (product as any).inventoryStatus as string | undefined;
  const hasAvailableQuantity = (product as any).availableQuantity !== undefined && (product as any).availableQuantity !== null;
  const availableQuantity = hasAvailableQuantity ? Number((product as any).availableQuantity) : null;
  const derivedStatus =
    inventoryStatus === 'LOW_STOCK'
      ? StockStatus.LOW_STOCK
      : inventoryStatus === 'OUT_OF_STOCK' || inventoryStatus === 'DISCONTINUED'
        ? StockStatus.OUT_OF_STOCK
        : inventoryStatus
          ? StockStatus.IN_STOCK
          : undefined;
  const stockStatus =
    product.stockStatus ||
    derivedStatus ||
    (typeof product.inStock === 'boolean'
      ? (product.inStock ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK)
      : (hasAvailableQuantity ? (availableQuantity! > 0 ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK) : StockStatus.IN_STOCK));
  const isOutOfStock = stockStatus === StockStatus.OUT_OF_STOCK;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      await addToCart(product.id);
      // Track add to cart event
      await trackAddToCart(
        product.id,
        product.name || 'Unknown Product',
        product.category?.name || product.categoryName || 'Unknown Category',
        product.effectivePrice || product.price
      );
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      if (inWishlist) {
        removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    }
  };

  const handleProductClick = async () => {
    // Track product click event
    await trackProductClick(
      product.id,
      product.name || 'Unknown Product',
      product.category?.name || product.categoryName || 'Unknown Category',
      product.effectivePrice || product.price
    );
  };

  const discountPercentage = product.discountPercentage || (product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0);

  return (
    <Link href={`/shop/products/${product.slug}`} className="group" onClick={handleProductClick}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <Image
            src={getImageUrl(product.imageUrl || product.image)}
            alt={product.name || 'Product image'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            priority={true}
          />

          {/* Promotion Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <PromotionBadge
              discountPercentage={discountPercentage}
              isFlashSale={product.promotion?.type === 'FLASH_SALE'}
              isFreeShipping={product.promotion?.type === 'FREE_SHIPPING'}
            />
          </div>

          {/* Wishlist Button */}
          <DisabledActionTooltip disabled={isOutOfStock} message="Out of stock">
            <button
              onClick={handleWishlistToggle}
              disabled={isOutOfStock}
              className={`absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${inWishlist ? 'fill-red-500 text-red-500' : isOutOfStock ? 'text-gray-300' : 'text-gray-400'
                  }`}
              />
            </button>
          </DisabledActionTooltip>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">
            {product.category?.name || product.categoryName || 'Uncategorized'}
          </p>
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm min-h-[40px]">
            {product.name || 'Product Name'}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                    }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviews || 0})
            </span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-base font-bold text-blue-600">
                GHS {(product.effectivePrice || product.price || 0).toFixed(2)}
              </span>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  GHS {(product.price || 0).toFixed(2)}
                </span>
              )}
            </div>
            <DisabledActionTooltip disabled={isOutOfStock} message="Out of stock">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  'Add'
                )}
              </Button>
            </DisabledActionTooltip>
          </div>
        </div>
      </div>
    </Link>
  );
}
