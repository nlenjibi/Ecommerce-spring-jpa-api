'use client';

/**
 * Product Detail Page - GraphQL Optimized
 * 
 * Following REST/GraphQL API Strategy:
 * - GraphQL: Used for fetching product data and related products (queries)
 * - REST: Used for cart and wishlist operations (commands)
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Truck,
  Shield,
  Share2,
  ChevronRight,
  AlertCircle,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/Button';
import { StockBadge, FulfillmentBadge, CustomerSignalBadge, PromotionBadge } from '@/components/features/products/ProductBadges';
import ProductReviews from '@/components/features/products/ProductReviews';
import { StockStatus, FulfillmentType } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { useTracking } from '@/lib/services/tracking';
import { useProductBySlug, useRelatedProducts } from '@/hooks/domain/use-products-graphql';
import toast from 'react-hot-toast';

function ProductDetailContent({
  product,
  relatedProducts
}: {
  product: any;
  relatedProducts: any[];
}) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { trackProductView, trackAddToCart } = useTracking();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Determine stock status
  const stockStatus = product.inventoryStatus || (product.inStock !== false ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK);
  const isOutOfStock = stockStatus === StockStatus.OUT_OF_STOCK;
  const isLowStock = stockStatus === StockStatus.LOW_STOCK;
  const inWishlist = isInWishlist(product.id);

  // Track product view when component mounts
  useEffect(() => {
    trackProductView(
      product.id,
      product.name || 'Unknown Product',
      product.category?.name || 'Unknown Category',
      product.effectivePrice || product.price || 0
    );
  }, [product.id, product.name, product.category, product.price, trackProductView]);

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      // Use REST for cart command (following API strategy)
      await addToCart(product.id);

      // Track add to cart event
      await trackAddToCart(
        product.id,
        product.name || 'Unknown Product',
        product.category?.name || 'Unknown Category',
        product.effectivePrice || product.price || 0
      );

      toast.success('Added to cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on our store!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const productImages = product.images?.length > 0
    ? product.images
    : [product.imageUrl || product.image || '/placeholder.png'];

  const stockQuantity = product.availableQuantity || product.stockQuantity || product.stock || 0;
  const maxPossibleQuantity = stockQuantity; // Removed local quantity reference

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm">
        <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Link href="/shop/products" className="text-blue-600 hover:text-blue-700 transition-colors">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href={`/shop/products?category=${product.category.id}`}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600 truncate max-w-[200px]">{product.name || 'Product'}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl overflow-hidden aspect-square border border-gray-100 shadow-sm">
            <Image
              src={getImageUrl(productImages[selectedImage])}
              alt={product.name || 'Product'}
              width={600}
              height={600}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              priority={true}
            />
          </div>
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((image: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === idx
                    ? 'border-blue-600 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`Product ${idx + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category and Title */}
          <div>
            <p className="text-sm text-blue-600 font-medium uppercase tracking-wide mb-2">
              {product.category?.name || 'Category'}
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {product.name || 'Product Name'}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <StockBadge status={stockStatus} size="sm" />
              <FulfillmentBadge type={product.fulfillmentType || FulfillmentType.SHIPPED} />
              <CustomerSignalBadge
                isTrending={product.isTrending || product.trending}
                isMostPurchased={product.isMostPurchased || product.isBestseller}
                isRecommended={product.isRecommendedForYou || product.featured}
                rating={product.ratingAverage || product.rating || 0}
              />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.ratingAverage || product.rating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.ratingAverage || product.rating || 0} ({product.ratingCount || product.reviews || 0} reviews)
              </span>
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-end gap-3 mb-2 flex-wrap">
              <span className="text-4xl font-bold text-blue-600">
                GHS {(product.effectivePrice || product.price || 0).toFixed(2)}
              </span>
              {(product.discountPrice || product.originalPrice) && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    GHS {(product.price || product.originalPrice || 0).toFixed(2)}
                  </span>
                  {discountPercentage > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                      -{discountPercentage}%
                    </span>
                  )}
                </>
              )}
            </div>
            {!isOutOfStock && (
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                In Stock: {stockQuantity} units available
              </p>
            )}
          </div>

          {/* Stock Alerts */}
          {(isOutOfStock || isLowStock) && (
            <div className={`rounded-xl p-4 border ${isOutOfStock
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
              }`}>
              <div className="flex gap-3">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                <div>
                  <p className={`font-medium ${isOutOfStock ? 'text-red-900' : 'text-yellow-900'}`}>
                    {isOutOfStock ? 'Out of Stock' : 'Limited Stock'}
                  </p>
                  <p className={`text-sm ${isOutOfStock ? 'text-red-700' : 'text-yellow-700'}`}>
                    {isOutOfStock
                      ? 'This item is currently unavailable. Check back later!'
                      : `Only ${stockQuantity} left - order soon!`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Fast Delivery</p>
                <p className="text-xs text-gray-600">2-3 business days</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Quality Guarantee</p>
                <p className="text-xs text-gray-600">100% authentic products</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                GHS {(product.effectivePrice || product.price || 0).toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1"
              >
                {isAddingToCart ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                className={`flex-1 sm:flex-initial ${inWishlist ? 'border-red-200 bg-red-50' : ''}`}
              >
                <Heart className={`w-5 h-5 mr-2 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                {inWishlist ? 'Saved' : 'Save'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="flex-1 sm:flex-initial"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Product Information</h3>
            <div className="space-y-3 text-sm">
              {product.sku && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">SKU</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
              )}
              {product.category && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <Link
                    href={`/shop/products?category=${product.category.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Condition</span>
                <span className="font-medium">New</span>
              </div>
              {product.weight && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-medium">{product.weight} kg</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Description</h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((relatedProduct: any) => (
              <Link
                key={relatedProduct.id}
                href={`/shop/products/${relatedProduct.slug}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <Image
                    src={getImageUrl(relatedProduct.imageUrl || relatedProduct.image || relatedProduct.images?.[0])}
                    alt={relatedProduct.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      GHS {(relatedProduct.effectivePrice || relatedProduct.price || 0).toFixed(2)}
                    </span>
                    {relatedProduct.discountPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        GHS {(relatedProduct.price || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <ProductReviews
        productId={product.id}
        productName={product.name}
        initialAverageRating={product.ratingAverage}
        initialTotalReviews={product.ratingCount}
      />
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // GraphQL Hook for fetching product (following API strategy)
  const {
    product,
    loading: productLoading,
    error: productError
  } = useProductBySlug(slug, {
    skip: !slug,
  });

  // GraphQL Hook for fetching related products
  const {
    products: relatedProducts,
    loading: relatedLoading,
  } = useRelatedProducts({
    categoryId: product?.category?.id,
    excludeProductId: product?.id,
    limit: 4,
    skip: !product?.category?.id || !product?.id,
  });

  // Filter out current product from related products
  const filteredRelatedProducts = relatedProducts?.filter(
    (p: any) => p.id !== product?.id
  ).slice(0, 4) || [];

  // Loading state
  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            {productError?.message || 'The product you are looking for could not be found.'}
          </p>
          <div className="space-y-3">
            <Link
              href="/shop/products"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductDetailContent
        product={product}
        relatedProducts={filteredRelatedProducts}
      />
    </div>
  );
}
