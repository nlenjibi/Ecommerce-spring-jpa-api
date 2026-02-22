'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import { ProductCard } from '@/components/features/products/ProductCard';
import { SkeletonLoader } from '@/components/shared/skeleton-loader';
import { useDebounce } from '@/hooks';
import { useProductCatalog, useLazySearchProducts, useSearchProducts } from '@/hooks/domain/use-products-graphql';

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant', sortBy: 'relevance', direction: 'ASC' },
  { value: 'price-low', label: 'Price: Low to High', sortBy: 'price', direction: 'ASC' },
  { value: 'price-high', label: 'Price: High to Low', sortBy: 'price', direction: 'DESC' },
  { value: 'rating', label: 'Highest Rated', sortBy: 'averageRating', direction: 'DESC' },
  { value: 'newest', label: 'Newest', sortBy: 'createdAt', direction: 'DESC' },
];

const inventoryStatusOptions = [
  { value: '', label: 'All Status' },
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
  { value: 'PRE_ORDER', label: 'Pre-Order' },
  { value: 'BACKORDER', label: 'Backorder' },
];

interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  effectivePrice?: number;
  discountPrice?: number;
  originalPrice?: number;
  images?: string[];
  imageUrl?: string;
  image?: string;
  category?: { id: number; name: string; slug?: string };
  averageRating?: number;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  availableQuantity?: number;
  inventoryStatus?: string;
  inStock?: boolean;
  stockStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

const normalizeNumeric = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (value && typeof value === 'object') {
    if ('parsedValue' in value) return normalizeNumeric((value as any).parsedValue);
    if ('source' in value) return normalizeNumeric((value as any).source);
  }
  return 0;
};

const normalizeSearchProduct = (product: any): Product => {
  const inventoryStatus = (product.inventoryStatus || product.stockStatus || '').toString();
  const stockStatus =
    inventoryStatus === 'LOW_STOCK'
      ? 'LOW_STOCK'
      : inventoryStatus === 'OUT_OF_STOCK' || inventoryStatus === 'DISCONTINUED'
      ? 'OUT_OF_STOCK'
      : 'IN_STOCK';

  return {
    ...product,
    id: Number(product.id) || 0,
    price: normalizeNumeric(product.price),
    effectivePrice: normalizeNumeric(product.effectivePrice),
    discountPrice: product.discountPrice != null ? normalizeNumeric(product.discountPrice) : undefined,
    originalPrice: product.originalPrice != null ? normalizeNumeric(product.originalPrice) : undefined,
    averageRating: product.averageRating != null ? normalizeNumeric(product.averageRating) : undefined,
    rating: product.rating != null ? normalizeNumeric(product.rating) : undefined,
    reviewCount: product.reviewCount != null ? normalizeNumeric(product.reviewCount) : undefined,
    stockQuantity: product.stockQuantity != null ? normalizeNumeric(product.stockQuantity) : undefined,
    availableQuantity: product.availableQuantity != null ? normalizeNumeric(product.availableQuantity) : undefined,
    inventoryStatus,
    stockStatus,
    inStock: stockStatus !== 'OUT_OF_STOCK',
    imageUrl: product.imageUrl || product.thumbnailUrl || product.image,
  };
};

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 500]);
  const [inventoryStatus, setInventoryStatus] = useState(searchParams.get('status') || '');
  const [needsReorder, setNeedsReorder] = useState(searchParams.get('reorder') === 'true');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '0'));
  const pageSize = 24;
  
  const debounceRef = useRef<number | null>(null);
  
  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Check admin status on component mount
  useEffect(() => {
    const checkAdminStatus = () => {
      if (typeof window !== 'undefined') {
        const tokens = localStorage.getItem('auth_tokens');
        if (tokens) {
          try {
            const { accessToken } = JSON.parse(tokens);
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            setIsAdmin(payload.role === 'ADMIN' || payload.authorities?.includes('ROLE_ADMIN'));
          } catch (error) {
            console.error('Error parsing token:', error);
            setIsAdmin(false);
          }
        }
      }
    };

    checkAdminStatus();
  }, []);

  // Get sort params from value
  const getSortParams = (value: string) => {
    const option = sortOptions.find((o) => o.value === value);
    return option ? { sortBy: option.sortBy, direction: option.direction } : { sortBy: 'relevance', direction: 'ASC' };
  };

  // Update URL with current filters
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (inventoryStatus) params.set('status', inventoryStatus);
    if (needsReorder) params.set('reorder', 'true');
    if (currentPage > 0) params.set('page', currentPage.toString());
    
    // Only add price params if they're different from bounds
    if (priceRange[0] > priceBounds[0]) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < priceBounds[1]) params.set('maxPrice', priceRange[1].toString());

    const queryString = params.toString();
    router.replace(`/shop/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [debouncedQuery, sortBy, inventoryStatus, needsReorder, currentPage, priceRange, priceBounds, router]);

  // Sync URL when filters change
  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // Sync state with URL params when URL changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }

    const sortParam = searchParams.get('sort') || 'relevance';
    if (sortParam !== sortBy) {
      setSortBy(sortParam);
    }

    const statusParam = searchParams.get('status') || '';
    if (statusParam !== inventoryStatus) {
      setInventoryStatus(statusParam);
    }

    const reorderParam = searchParams.get('reorder') === 'true';
    if (reorderParam !== needsReorder) {
      setNeedsReorder(reorderParam);
    }

    const pageParam = parseInt(searchParams.get('page') || '0');
    if (pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQuery, sortBy, inventoryStatus, needsReorder, priceRange]);

  // Track active filters
  useEffect(() => {
    const filters = new Set<string>();
    if (debouncedQuery) filters.add('search');
    if (inventoryStatus) filters.add('inventory');
    if (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) filters.add('price');
    if (needsReorder && isAdmin) filters.add('reorder');
    setActiveFilters(filters);
  }, [debouncedQuery, inventoryStatus, priceRange, needsReorder, isAdmin, priceBounds]);

  // Lazy search for suggestions
  const [executeSearch, { products: suggestionProducts, loading: suggestionsLoading }] = useLazySearchProducts();

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      executeSearch({
        variables: {
          keyword: debouncedQuery,
          pagination: { page: 0, size: 5, sortBy: 'name', direction: 'ASC' },
        },
      });
      setIsSuggesting(true);
    } else {
      setSuggestions([]);
      setIsSuggesting(false);
    }
  }, [debouncedQuery, executeSearch]);

  // Update suggestions when data arrives
  useEffect(() => {
    if (Array.isArray(suggestionProducts)) {
      const normalizedSuggestions = suggestionProducts.map(normalizeSearchProduct);
      setSuggestions((prev) => {
        const same =
          prev.length === normalizedSuggestions.length &&
          prev.every((item, idx) => item.id === normalizedSuggestions[idx]?.id);
        return same ? prev : normalizedSuggestions;
      });
    }
  }, [suggestionProducts]);

  // Main product search using GraphQL
  const { sortBy: sortKey, direction } = getSortParams(sortBy);
  const {
    products: productsData,
    loading: isLoading,
    error,
    totalCount,
    pageInfo,
  } = useProductCatalog({
    keyword: debouncedQuery || undefined,
    minPrice: priceRange[0] > priceBounds[0] ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < priceBounds[1] ? priceRange[1] : undefined,
    inventoryStatus: inventoryStatus || undefined,
    sortBy: sortKey === 'relevance' ? 'name' : sortKey, // 'relevance' is handled by keyword search
    sortDirection: direction as 'ASC' | 'DESC',
    page: currentPage,
    size: pageSize,
  });

  // Fallback for APIs where keyword filtering is exposed via `searchProducts` but not `products(filter.keyword)`
  const {
    products: keywordProductsData,
    loading: isKeywordLoading,
    error: keywordError,
    totalCount: keywordTotalCount,
    pageInfo: keywordPageInfo,
  } = useSearchProducts({
    keyword: debouncedQuery || undefined,
    pagination: {
      page: currentPage,
      size: pageSize,
      sortBy: sortKey === 'relevance' ? 'name' : sortKey,
      direction: direction as 'ASC' | 'DESC',
    },
  });

  const shouldUseKeywordFallback =
    debouncedQuery.length > 0 &&
    Array.isArray(productsData) &&
    productsData.length === 0 &&
    Array.isArray(keywordProductsData) &&
    keywordProductsData.length > 0;

  const resolvedProducts = shouldUseKeywordFallback ? keywordProductsData : productsData;
  const resolvedPageInfo = shouldUseKeywordFallback ? keywordPageInfo : pageInfo;
  const resolvedTotalCount = shouldUseKeywordFallback ? keywordTotalCount : totalCount;
  const resolvedError = shouldUseKeywordFallback ? keywordError : error;
  const resolvedLoading = isLoading || (debouncedQuery.length > 0 && isKeywordLoading);

  // Apply client-side filtering as fallback
  const allProducts = Array.isArray(resolvedProducts)
    ? resolvedProducts.map(normalizeSearchProduct)
    : [];

  // Client-side filtering to ensure filters work even if backend doesn't filter properly
  const filteredProducts = allProducts.filter((product) => {
    // Price range filter
    const effectivePrice = product.effectivePrice ?? product.discountPrice ?? product.price ?? 0;
    const matchesMinPrice = priceRange[0] <= effectivePrice;
    const matchesMaxPrice = priceRange[1] >= effectivePrice;
    if (!matchesMinPrice || !matchesMaxPrice) return false;

    // Inventory status filter
    if (inventoryStatus) {
      const productStatus = product.inventoryStatus || product.stockStatus || 'IN_STOCK';
      if (productStatus !== inventoryStatus) return false;
    }

    // Search query filter (client-side fallback)
    if (debouncedQuery) {
      const searchText = debouncedQuery.toLowerCase();
      const productText = [product.name, product.description, product.category?.name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!productText.includes(searchText)) return false;
    }

    return true;
  });

  // Calculate pagination info based on filtered products
  const pagination = resolvedPageInfo && filteredProducts.length > 0 ? {
    page: resolvedPageInfo.page ?? currentPage,
    size: resolvedPageInfo.size ?? pageSize,
    totalElements: resolvedPageInfo.totalElements ?? resolvedTotalCount,
    totalPages: resolvedPageInfo.totalPages ?? Math.ceil(resolvedTotalCount / pageSize),
    hasNext: resolvedPageInfo.hasNext ?? !(resolvedPageInfo.isLast ?? true),
    hasPrevious: resolvedPageInfo.hasPrevious ?? !(resolvedPageInfo.isFirst ?? true),
  } : {
    page: currentPage,
    size: pageSize,
    totalElements: filteredProducts.length,
    totalPages: Math.ceil(filteredProducts.length / pageSize),
    hasNext: (currentPage + 1) * pageSize < filteredProducts.length,
    hasPrevious: currentPage > 0,
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggesting(false);
    router.push(`/shop/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Clear all filters
  const clearSearch = () => {
    setSearchQuery('');
    setInventoryStatus('');
    setNeedsReorder(false);
    setPriceRange(priceBounds);
    setCurrentPage(0);
    setIsSuggesting(false);
    router.push('/shop/search');
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 0; i < 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total - 1);
      } else if (current >= total - 4) {
        pages.push(0);
        pages.push('...');
        for (let i = total - 5; i < total; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total - 1);
      }
    }
    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Suggestions dropdown */}
              {isSuggesting && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                      onMouseDown={() => {
                        setSearchQuery(s.name || '');
                        setIsSuggesting(false);
                        router.push(`/shop/search?q=${encodeURIComponent(s.name || '')}`);
                      }}
                    >
                      <img 
                        src={s.image || s.imageUrl || '/placeholder.png'} 
                        alt={s.name} 
                        className="w-10 h-10 object-cover rounded" 
                      />
                      <div className="text-sm text-gray-800 truncate">{s.name}</div>
                    </li>
                  ))}
                </ul>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
          
          {/* Active Filters Display */}
          {activeFilters.size > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeFilters.has('search') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Search: &quot;{searchQuery}&quot;
                </span>
              )}
              {activeFilters.has('price') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                </span>
              )}
              {activeFilters.has('inventory') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Status: {inventoryStatusOptions.find(opt => opt.value === inventoryStatus)?.label}
                </span>
              )}
              {activeFilters.has('reorder') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Needs Reorder
                </span>
              )}
              {activeFilters.size > 1 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setInventoryStatus('');
                    setNeedsReorder(false);
                    setPriceRange(priceBounds);
                    setCurrentPage(0);
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Clear All
                </button>
              )}
            </div>
          )}
          
          {searchQuery && activeFilters.size === 1 && (
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{pagination.totalElements}</span> products for &quot;{searchQuery}&quot;
            </p>
          )}
          {activeFilters.size > 0 && (
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{pagination.totalElements}</span> products
            </p>
          )}
          {activeFilters.size === 0 && (
            <p className="text-gray-600">Enter a search term or apply filters to find products</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
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
                {isLoading && priceBounds[0] === 0 && priceBounds[1] === 500 ? (
                  <div className="text-sm text-gray-500">Loading price range...</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Min: ${priceRange[0]}</label>
                      <input
                        type="range"
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Max: ${priceRange[1]}</label>
                      <input
                        type="range"
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Range: ${priceBounds[0]} - ${priceBounds[1]}
                    </div>
                  </div>
                )}
              </div>

              {/* Inventory Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
                <div className="space-y-2">
                  {inventoryStatusOptions.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="inventory"
                        value={option.value}
                        checked={inventoryStatus === option.value}
                        onChange={(e) => setInventoryStatus(e.target.value)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Admin-only Needs Reorder Filter */}
              {isAdmin && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Filters</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={needsReorder}
                        onChange={(e) => setNeedsReorder(e.target.checked)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900 flex items-center gap-2">
                        Products Needing Reorder
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {resolvedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonLoader key={i} variant="product" />
                ))}
              </div>
            ) : resolvedError ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{resolvedError.message || 'Failed to fetch products'}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product: Product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, pagination.totalElements)} of {pagination.totalElements} products
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevious}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((pageNum, idx) =>
                          pageNum === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum as number)}
                              className={`min-w-[40px] h-10 rounded-lg text-sm font-medium ${currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {(pageNum as number) + 1}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h2>
                <p className="text-gray-600 mb-6">
                  {activeFilters.size > 0
                    ? 'Try adjusting your search terms or filters'
                    : 'Start by searching for a product or applying filters'}
                </p>
                {activeFilters.size > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setInventoryStatus('');
                      setPriceRange(priceBounds);
                      setCurrentPage(0);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
