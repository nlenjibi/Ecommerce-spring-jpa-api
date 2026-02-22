'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Grid, List, ChevronLeft, ChevronRight, X, Folder, FolderTree } from 'lucide-react';
import { SkeletonLoader } from '@/components/shared/skeleton-loader';
import { useDebounce } from '@/hooks';
import { useCategories } from '@/hooks/domain/use-products-graphql';

interface Category {
  id: string | number;
  slug: string;
  name: string;
  description: string;
  image?: string;
  imageUrl?: string;
  displayOrder?: number;
  level?: number;
  isActive?: boolean;
  parent?: { id: number; slug: string; name: string };
  children?: any[];
  productsCount: number;
  productCount?: number;
  createdAt?: string;
}

interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

type FilterType = 'all' | 'root' | 'search';

/**
 * Categories Page - GraphQL Implementation
 * 
 * Following REST/GraphQL API Strategy:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations) only
 */
export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0'));
  
  const pageSize = 12;
  
  // Debounce search input
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // GraphQL Hook for fetching categories
  const { categories: categoriesData, loading: isLoading, error } = useCategories({
    fetchPolicy: 'cache-and-network',
  });
  
  // Process and filter categories client-side (since GraphQL returns all categories)
  const processedCategories = React.useMemo(() => {
    let filtered = categoriesData || [];
    
    // Apply search filter
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((cat: Category) => 
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description && cat.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply root filter (categories without parent)
    if (filterType === 'root') {
      filtered = filtered.filter((cat: Category) => !cat.parent);
    }
    
    // Only show active categories
    filtered = filtered.filter((cat: Category) => cat.isActive !== false);
    
    return filtered;
  }, [categoriesData, debouncedSearch, filterType]);
  
  // Pagination logic
  const pagination: PaginationInfo = React.useMemo(() => {
    const totalElements = processedCategories.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const hasNext = (page + 1) * pageSize < totalElements;
    const hasPrevious = page > 0;
    
    return {
      page,
      size: pageSize,
      totalElements,
      totalPages,
      hasNext,
      hasPrevious,
    };
  }, [processedCategories.length, page]);
  
  // Get paginated categories
  const categories = React.useMemo(() => {
    const startIndex = page * pageSize;
    return processedCategories.slice(startIndex, startIndex + pageSize);
  }, [processedCategories, page]);
  
  // Update URL with current filters
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (page > 0) params.set('page', page.toString());
    
    const queryString = params.toString();
    router.replace(`/shop/categories${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [debouncedSearch, page, router]);
  
  // Sync URL when filters change
  useEffect(() => {
    updateUrl();
  }, [updateUrl]);
  
  // Sync state with URL params when URL changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    if (queryParam !== searchTerm) {
      setSearchTerm(queryParam);
    }
    
    const pageParam = parseInt(searchParams.get('page') || '0');
    if (pageParam !== page) {
      setPage(pageParam);
    }
  }, [searchParams]);
  
  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [filterType, debouncedSearch]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim()) {
      setFilterType('search');
    } else {
      setFilterType('all');
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setPage(0);
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterType !== 'all';
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.totalPages;
    const currentPage = page;
    
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 4) pages.push('...');
      pages.push(totalPages - 1);
    }
    
    return pages;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Shop by Category</h1>
          <p className="text-lg text-blue-100">Explore our curated collections of premium products</p>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setFilterType('all'); setSearchTerm(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all' && !searchTerm
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <Grid className="w-4 h-4 inline mr-1.5" />
                All Categories
              </button>
              <button
                onClick={() => { setFilterType('root'); setSearchTerm(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'root'
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <Folder className="w-4 h-4 inline mr-1.5" />
                Main Categories
              </button>
              
              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Clear
                </button>
              )}
            </div>
            
            {/* View Toggle & Results Count */}
            <div className="flex items-center gap-4 lg:ml-auto">
              <span className="text-sm text-gray-500">
                {pagination.totalElements} categor{pagination.totalElements === 1 ? 'y' : 'ies'}
              </span>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="mb-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">×</button>
              </span>
            )}
            {filterType === 'root' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                Main Categories Only
                <button onClick={() => setFilterType('all')} className="hover:text-purple-900">×</button>
              </span>
            )}
          </div>
        )}
        
        {/* Categories Display */}
        {isLoading ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} variant="product" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error.message || 'Failed to fetch categories'}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No results for "${searchTerm}"` : 'No categories available at the moment'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category: Category) => (
              <Link key={category.id} href={`/shop/products?category=${category.id}`}>
                <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col border border-gray-100 hover:border-blue-200">
                  {/* Category Image/Icon Area */}
                  <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors">
                    {category.image || category.imageUrl ? (
                      <img 
                        src={category.image || category.imageUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">{category.parent ? '📁' : '🛍️'}</span>
                    )}
                    {category.parent && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {category.parent.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Category Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 flex-1 line-clamp-2">
                      {category.description || 'Explore products in this category'}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {category.productsCount || category.productCount || 0} products
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {categories.map((category: Category) => (
              <Link key={category.id} href={`/shop/products?category=${category.id}`}>
                <div className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 p-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {category.image || category.imageUrl ? (
                      <img 
                        src={category.image || category.imageUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <span className="text-2xl">{category.parent ? '📁' : '🛍️'}</span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {category.name}
                      </h3>
                      {category.parent && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex-shrink-0">
                          in {category.parent.name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-1">
                      {category.description || 'Explore products in this category'}
                    </p>
                  </div>
                  
                  {/* Product Count & Arrow */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {category.productsCount || category.productCount || 0} products
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-600">
              Showing {page * pagination.size + 1}-{Math.min((page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} categories
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrevious}
                className={`p-2 rounded-lg border ${
                  pagination.hasPrevious
                    ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => (
                  pageNum === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum as number)}
                      className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {(pageNum as number) + 1}
                    </button>
                  )
                ))}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => handlePageChange(page + 1)}
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
      </div>
      
      {/* Trust Badges Section */}
      <div className="bg-white py-12 mt-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Curated Selection</h3>
              <p className="text-gray-600 text-sm">Hand-picked products from trusted brands</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Great Prices</h3>
              <p className="text-gray-600 text-sm">Competitive prices with regular discounts</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600 text-sm">Quick delivery with real-time tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
