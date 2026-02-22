'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/features/products/ProductCard';
import { useProductCatalog } from '@/hooks/domain/use-products-graphql';
import { SkeletonProductCardGrid } from '@/components/skeletons';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * New Arrivals Page - GraphQL Implementation
 * 
 * Following REST/GraphQL API Strategy:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations) only
 */

export default function NewArrivalsPage() {
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Determine sort parameters for GraphQL
  const getSortParams = useCallback(() => {
    switch (sortBy) {
      case 'newest':
        return { sortBy: 'createdAt', direction: 'DESC' as const };
      case 'price-low':
        return { sortBy: 'price', direction: 'ASC' as const };
      case 'price-high':
        return { sortBy: 'price', direction: 'DESC' as const };
      case 'rating':
        return { sortBy: 'averageRating', direction: 'DESC' as const };
      default:
        return { sortBy: 'createdAt', direction: 'DESC' as const };
    }
  }, [sortBy]);

  const { sortBy: sortKey, direction } = getSortParams();

  // GraphQL Hook for fetching new arrivals
  // Using useProductCatalog with isNew filter
  const {
    products,
    loading: isLoading,
    error,
    totalCount,
    pageInfo
  } = useProductCatalog({
    isNew: true, // Filter for new products only
    sortBy: sortKey,
    direction: direction,
    page: currentPage,
    size: pageSize,
  });

  // Pagination info
  const pagination = React.useMemo(() => {
    if (!pageInfo) {
      return {
        page: currentPage,
        size: pageSize,
        totalElements: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNext: (currentPage + 1) * pageSize < totalCount,
        hasPrevious: currentPage > 0,
      };
    }
    
    return {
      page: pageInfo.pageNumber || currentPage,
      size: pageInfo.pageSize || pageSize,
      totalElements: pageInfo.totalElements || totalCount,
      totalPages: pageInfo.totalPages || Math.ceil(totalCount / pageSize),
      hasNext: !pageInfo.last,
      hasPrevious: !pageInfo.first,
    };
  }, [currentPage, totalCount, pageInfo]);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!products || products.length === 0) {
      return {
        totalProducts: 0,
        avgRating: 0,
        lowestPrice: 0,
      };
    }

    const totalRating = products.reduce((sum: number, p: any) => 
      sum + (p.averageRating || p.rating || 0), 0
    );
    const prices = products.map((p: any) => p.discountPrice || p.effectivePrice || p.price || 0);
    
    return {
      totalProducts: totalCount,
      avgRating: products.length > 0 ? totalRating / products.length : 0,
      lowestPrice: prices.length > 0 ? Math.min(...prices) : 0,
    };
  }, [products, totalCount]);

  // Reset to first page when sort changes
  useEffect(() => {
    setCurrentPage(0);
  }, [sortBy]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && pagination && newPage < pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-4">
            <Sparkles className="w-10 h-10" />
            <span className="text-lg font-semibold">JUST ARRIVED</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">New Arrivals</h1>
          <p className="text-xl text-green-100">
            Check out our latest collection of premium products, freshly added to our store
          </p>
          {pagination && (
            <p className="text-green-200 mt-2">
              {pagination.totalElements} new product{pagination.totalElements !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.totalProducts}
            </div>
            <p className="text-gray-600">New Products</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-'}
            </div>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.lowestPrice > 0 ? `GHS ${stats.lowestPrice.toFixed(2)}` : '-'}
            </div>
            <p className="text-gray-600">Starting Price</p>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Browse New Arrivals
                {pagination && (
                  <span className="text-base font-normal text-gray-500 ml-2">
                    ({pagination.totalElements} products)
                  </span>
                )}
              </h2>
              <p className="text-gray-600 text-sm mt-1">Discover the latest products added to our catalog</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="mb-12">
            <SkeletonProductCardGrid count={8} />
          </div>
        ) : error ? (
          <div className="mb-12 text-center py-12">
            <p className="text-red-600 mb-4">Error loading new arrivals. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product: any, index: number) => (
                <div key={product.id} className="relative group">
                  {index < 3 && currentPage === 0 && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      NEW
                    </div>
                  )}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-4 mb-12">
                <div className="text-sm text-gray-600">
                  Showing {currentPage * pagination.size + 1}-{Math.min((currentPage + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} products
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevious}
                    className={`p-2 rounded-lg border ${
                      pagination.hasPrevious
                        ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum = i;
                      if (pagination.totalPages > 5) {
                        if (currentPage < 3) {
                          pageNum = i;
                        } else if (currentPage > pagination.totalPages - 4) {
                          pageNum = pagination.totalPages - 5 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-green-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`p-2 rounded-lg border ${
                      pagination.hasNext
                        ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mb-12">
            <EmptyState
              icon={<Sparkles className="w-16 h-16 text-gray-300" />}
              title="No new arrivals yet"
              description="We're constantly adding new products. Check back soon for the latest additions!"
              action={{
                label: 'Browse All Products',
                onClick: () => window.location.href = '/shop/products',
              }}
            />
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Discover What's New</h2>
          <p className="mb-6 text-green-100">
            New products arrive weekly! Be the first to know by following us on social media
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/shop/products">
              <button className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
