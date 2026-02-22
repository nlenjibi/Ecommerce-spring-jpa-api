'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ProductCard } from '@/components/features/products/ProductCard';
import { useCategoryBySlug, useProductsByCategoryName } from '@/hooks/domain/use-products-graphql';

/**
 * Individual Category Page - GraphQL Implementation
 * 
 * Following REST/GraphQL API Strategy:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations) only
 */
export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.slug as string;
  const sortParam = searchParams.get('sort') || 'featured';
  
  // State for filters
  const [sortBy, setSortBy] = useState(sortParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;
  
  // GraphQL Hooks
  const { 
    category: categoryData, 
    loading: categoryLoading, 
    error: categoryError 
  } = useCategoryBySlug(categorySlug);
  
  const {
    products: productsData,
    loading: productsLoading,
    error: productsError,
    totalCount
  } = useProductsByCategoryName({
    categoryName: categoryData?.name || categorySlug,
    pagination: {
      page: currentPage,
      size: pageSize,
    }
  });
  
  const isLoading = categoryLoading || productsLoading;
  
  // Client-side filtering and sorting
  const processedProducts = useMemo(() => {
    if (!productsData) return [];
    
    let filtered = [...productsData];
    
    // Filter by price range
    filtered = filtered.filter((p: any) => {
      const price = p.effectivePrice || p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Sort results
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a: any, b: any) => (a.effectivePrice || a.price || 0) - (b.effectivePrice || b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a: any, b: any) => (b.effectivePrice || b.price || 0) - (a.effectivePrice || a.price || 0));
        break;
      case 'rating':
        filtered.sort((a: any, b: any) => (b.ratingAverage || b.rating || 0) - (a.ratingAverage || a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'featured':
      default:
        // Keep original order (featured first from API)
        break;
    }
    
    return filtered;
  }, [productsData, sortBy, priceRange]);
  
  // Pagination info
  const pagination = useMemo(() => {
    return {
      page: currentPage,
      size: pageSize,
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      hasNext: (currentPage + 1) * pageSize < totalCount,
      hasPrevious: currentPage > 0,
    };
  }, [currentPage, totalCount]);
  
  // Handle errors
  useEffect(() => {
    if (categoryError || productsError) {
      console.error('Error fetching category data:', categoryError || productsError);
    }
  }, [categoryError, productsError]);
  
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
  ];
  
  if (categoryError && !categoryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Category Not Found</h2>
          <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/shop/categories')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View All Categories
          </button>
        </div>
      </div>
    );
  }
  
  const categoryName = categoryData?.name || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const categoryDescription = categoryData?.description || '';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
            {categoryDescription && (
              <p className="text-xl text-gray-600">{categoryDescription}</p>
            )}
            <div className="mt-4 text-gray-500">
              Showing <span className="font-semibold text-gray-900">{processedProducts.length}</span> products
              {totalCount > 0 && (
                <span> of {totalCount} total</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-20">
              {/* Sort */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sort By</h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Min: ${priceRange[0]}</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Max: ${priceRange[1]}</label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            ) : processedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => p - 1)}
                      disabled={!pagination.hasPrevious}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        pagination.hasPrevious
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      Page {pagination.page + 1} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!pagination.hasNext}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        pagination.hasNext
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h2>
                <p className="text-gray-600">Try adjusting your filters to find products</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
