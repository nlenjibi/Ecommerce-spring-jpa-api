"use client";
import React from 'react';
import { Heart } from 'lucide-react';
import { useCustomerWishlist } from '@/hooks/customer/use-customer-graphql';

export default function WishlistSection() {
  const { wishlist, loading } = useCustomerWishlist();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Heart size={18} />
        Wishlist
      </h3>
      {loading ? (
        <div className="text-sm text-gray-500 mt-3">Loading wishlist...</div>
      ) : wishlist.length === 0 ? (
        <div className="text-sm text-gray-500 mt-3">Your wishlist is empty</div>
      ) : (
        <div className="mt-3 space-y-3">
          {wishlist.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3">
              <img 
                src={item.product?.imageUrl || '/placeholder.png'} 
                alt={item.product?.name} 
                className="w-12 h-12 rounded object-cover" 
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.product?.name}</div>
                <div className="text-xs text-gray-500">
                  ${(item.product?.price || 0).toFixed(2)} • {item.product?.stock > 0 ? 'In stock' : 'Out of stock'}
                </div>
              </div>
              <div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
