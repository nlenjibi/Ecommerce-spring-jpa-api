'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product, StockStatus } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DisabledActionTooltip } from './DisabledActionTooltip';

interface WishlistToggleProps {
  product: Product;
  className?: string;
  showLabel?: boolean;
}

export function WishlistToggle({
  product,
  className = 'p-2',
  showLabel = false,
}: WishlistToggleProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const inWishlist = isInWishlist(product.id);
  
  // Check if product is out of stock
  const stockStatus = product.stockStatus || (product.stock > 0 ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK);
  const isOutOfStock = stockStatus === StockStatus.OUT_OF_STOCK || product.stock <= 0;

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Allow guests to add/remove wishlist items (handled in context)

    if (isOutOfStock && !inWishlist) {
      toast.error('Cannot add out-of-stock items to wishlist');
      return;
    }

    setIsLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // If out of stock and not in wishlist, show disabled state with tooltip
  if (isOutOfStock && !inWishlist) {
    return (
      <DisabledActionTooltip disabled={true} message="Out of stock items cannot be added to wishlist">
        <button
          disabled
          className={`${className} rounded-full bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 opacity-50`}
          aria-label="Cannot add to wishlist - out of stock"
        >
          <Heart className="w-5 h-5" strokeWidth={2} />
          {showLabel && <span className="text-xs sm:text-sm font-medium">Save</span>}
        </button>
      </DisabledActionTooltip>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${className} rounded-full transition-all duration-200 ${
        inWishlist
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className="w-5 h-5"
        fill={inWishlist ? 'currentColor' : 'none'}
        strokeWidth={inWishlist ? 0 : 2}
      />
      {showLabel && (
        <span className="text-xs sm:text-sm font-medium">
          {inWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
