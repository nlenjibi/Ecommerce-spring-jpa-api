'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api';
import { useDebounce } from '@/hooks';
import { ProductCard } from '@/components/features/products/ProductCard';
import { SkeletonProductCardGrid } from '@/components/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { useProductCatalog, useCategories, useSearchProducts, useProductsByCategory, useFeaturedProducts } from '@/hooks/domain/use-products-graphql';

// Sort options
const sortOptions = [
  { value: 'name-asc', label: 'Name: A to Z', sortBy: 'name', direction: 'asc' },
  { value: 'name-desc', label: 'Name: Z to A', sortBy: 'name', direction: 'desc' },
  { value: 'price-asc', label: 'Price: Low to High', sortBy: 'price', direction: 'asc' },
  { value: 'price-desc', label: 'Price: High to Low', sortBy: 'price', direction: 'desc' },
  { value: 'createdAt-desc', label: 'Newest First', sortBy: 'createdAt', direction: 'desc' },
  { value: 'createdAt-asc', label: 'Oldest First', sortBy: 'createdAt', direction: 'asc' },
  { value: 'averageRating-desc', label: 'Highest Rated', sortBy: 'averageRating', direction: 'desc' },
  { value: 'salesCount-desc', label: 'Best Selling', sortBy: 'salesCount', direction: 'desc' },
];

// Rating filter options
const ratingOptions = [
  { value: '', label: 'All Ratings' },
  { value: '4', label: '4★ & Up' },
  { value: '3', label: '3★ & Up' },
  { value: '2', label: '2★ & Up' },
  { value: '1', label: '1★ & Up' },
];

// Inventory status options
const inventoryStatusOptions = [
  { value: '', label: 'All Stock Status' },
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'PRE_ORDER', label: 'Pre-Order' },
  { value: 'BACKORDER', label: 'Backorder' },
];

interface Category {
  id: string | number;
  name: string;
  slug?: string;
}

interface Product {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  sku?: string;
  price: number;
  effectivePrice?: number;
  discountPrice?: number;
  originalPrice?: number;
  images?: string[];
  imageUrl?: string;
  image?: string;
  category?: Category;
  categoryName?: string;
  categoryId?: string | number;
  averageRating?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: number;
  stockQuantity?: number;
  availableQuantity?: number;
  inventoryStatus?: string;
  inStock?: boolean;
  stockStatus?: string;
  featured?: boolean;
  discountPercentage?: number;
  promotion?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationData {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Helper function to normalize numeric values (handles number/string/object formats)
const normalizeNumeric = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  if (value && typeof value === 'object') {
    if ('parsedValue' in value) return normalizeNumeric((value as any).parsedValue);
    if ('source' in value) return normalizeNumeric((value as any).source);
  }
  return 0;
};

// Helper function to normalize a product object
const normalizeProduct = (product: any): Product => ({
  ...product,
  id: Number(product.id) || 0,
  price: normalizeNumeric(product.price),
  effectivePrice: product.effectivePrice != null ? normalizeNumeric(product.effectivePrice) : undefined,
  discountPrice: product.discountPrice != null ? normalizeNumeric(product.discountPrice) : undefined,
  originalPrice: product.originalPrice != null ? normalizeNumeric(product.originalPrice) : undefined,
  discountPercentage: normalizeNumeric(product.discountPercentage),
  averageRating: product.averageRating != null ? normalizeNumeric(product.averageRating) : (product.ratingAverage != null ? normalizeNumeric(product.ratingAverage) : undefined),
  rating: product.rating != null ? normalizeNumeric(product.rating) : undefined,
  reviewCount: product.reviewCount != null ? normalizeNumeric(product.reviewCount) : (product.ratingCount != null ? normalizeNumeric(product.ratingCount) : undefined),
  reviews: product.reviews != null ? normalizeNumeric(product.reviews) : undefined,
  availableQuantity: product.availableQuantity != null ? normalizeNumeric(product.availableQuantity) : (product.stockQuantity != null ? normalizeNumeric(product.stockQuantity) : undefined),
  inventoryStatus: product.inventoryStatus || undefined,
  imageUrl: product.imageUrl || product.thumbnailUrl || product.image,
  featured: product.featured || product.isFeatured || undefined,
  inStock: product.inStock ?? (product.availableQuantity ?? product.stockQuantity ?? 0) > 0,
});

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [newOnly, setNewOnly] = useState(searchParams.get('new') === 'true');
  const [bestsellerOnly, setBestsellerOnly] = useState(searchParams.get('bestseller') === 'true');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('onSale') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [inventoryStatus, setInventoryStatus] = useState(searchParams.get('status') || '');
  const [sortValue, setSortValue] = useState(searchParams.get('sort') || 'createdAt-desc');
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '0')
  );

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounce search and price inputs
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  const pageSize = 12;

  // Get sort params from value
  const getSortParams = (value: string) => {
    const option = sortOptions.find((o) => o.value === value);
    return option ? { sortBy: option.sortBy.trim(), direction: option.direction.trim() } : { sortBy: 'createdAt', direction: 'desc' };
  };

  // Update URL with current filters
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedCategory) params.set('category', selectedCategory.toString());
    if (debouncedMinPrice) params.set('minPrice', debouncedMinPrice);
    if (debouncedMaxPrice) params.set('maxPrice', debouncedMaxPrice);
    if (featuredOnly) params.set('featured', 'true');
    if (newOnly) params.set('new', 'true');
    if (bestsellerOnly) params.set('bestseller', 'true');
    if (inStockOnly) params.set('inStock', 'true');
    if (onSaleOnly) params.set('onSale', 'true');
    if (minRating) params.set('rating', minRating);
    if (inventoryStatus) params.set('status', inventoryStatus);
    if (sortValue !== 'createdAt-desc') params.set('sort', sortValue);
    if (currentPage > 0) params.set('page', currentPage.toString());

    const queryString = params.toString();
    router.replace(`/shop/products${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [debouncedSearch, selectedCategory, debouncedMinPrice, debouncedMaxPrice, featuredOnly, newOnly, bestsellerOnly, inStockOnly, onSaleOnly, minRating, inventoryStatus, sortValue, currentPage, router]);

  // Fetch categories using GraphQL
  const { categories: categoriesData, loading: categoriesLoading } = useCategories();
  const categories = categoriesData || [];
  const selectedCategorySlug =
    selectedCategory
      ? categories.find((c) => String(c.id) === String(selectedCategory))?.slug
      : undefined;

  // GraphQL Hook for fetching products with advanced filtering
  const { sortBy: sortKey, direction } = getSortParams(sortValue);
  const {
    products: productsData,
    loading: productsLoading,
    error: productsError,
    totalCount,
    pageInfo
  } = useProductCatalog({
    keyword: debouncedSearch || undefined,
    categoryId: selectedCategory || undefined,
    categoryIds: selectedCategory ? [selectedCategory] : undefined,
    categorySlug: selectedCategorySlug || undefined,
    minPrice: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
    maxPrice: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
    featured: featuredOnly || undefined,
    inStockOnly: inStockOnly || undefined,
    hasDiscount: onSaleOnly || undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    inventoryStatus: inventoryStatus || undefined,
    isNew: newOnly || undefined,
    isBestseller: bestsellerOnly || undefined,
    sortBy: sortKey,
    sortDirection: direction.toUpperCase() as 'ASC' | 'DESC',
    page: currentPage,
    size: pageSize,
  });

  // Dedicated category query for reliable category filtering.
  const {
    products: categoryProductsData,
    loading: categoryProductsLoading,
    error: categoryProductsError,
    totalCount: categoryProductsTotalCount,
    pageInfo: categoryProductsPageInfo,
  } = useProductsByCategory({
    categoryId: selectedCategory || undefined,
    pagination: {
      page: currentPage,
      size: pageSize,
      sortBy: sortKey,
      direction: direction.toUpperCase(),
    },
  });

  const shouldUseFeaturedQuery =
    featuredOnly &&
    !selectedCategory &&
    !debouncedSearch &&
    !debouncedMinPrice &&
    !debouncedMaxPrice &&
    !newOnly &&
    !bestsellerOnly &&
    !inStockOnly &&
    !onSaleOnly &&
    !minRating &&
    !inventoryStatus;

  const {
    products: featuredProductsData,
    loading: featuredProductsLoading,
    error: featuredProductsError,
    pageInfo: featuredProductsPageInfo,
  } = useFeaturedProducts({
    limit: pageSize,
    page: currentPage,
  });

  const hasFeaturedData = Array.isArray(featuredProductsData) && featuredProductsData.length > 0;

  // Fallback for backends where keyword filtering is exposed via `searchProducts`, not `products(filter.keyword)`.
  const {
    products: searchedProductsData,
    loading: searchedProductsLoading,
    error: searchedProductsError,
    totalCount: searchedProductsTotalCount,
    pageInfo: searchedProductsPageInfo,
  } = useSearchProducts({
    keyword: debouncedSearch || undefined,
    pagination: {
      page: currentPage,
      size: pageSize,
      sortBy: sortKey,
      direction: direction.toUpperCase(),
    },
  });

  const shouldUseSearchFallback =
    debouncedSearch.length > 0 &&
    !selectedCategory &&
    !debouncedMinPrice &&
    !debouncedMaxPrice &&
    !featuredOnly &&
    !newOnly &&
    !bestsellerOnly &&
    !inStockOnly &&
    !onSaleOnly &&
    !minRating &&
    !inventoryStatus &&
    Array.isArray(productsData) &&
    productsData.length === 0 &&
    Array.isArray(searchedProductsData) &&
    searchedProductsData.length > 0;

  const resolvedProductsData = shouldUseSearchFallback ? searchedProductsData : productsData;
  const resolvedPageInfo = shouldUseSearchFallback ? searchedProductsPageInfo : pageInfo;
  const resolvedTotalCount = shouldUseSearchFallback ? searchedProductsTotalCount : totalCount;
  const resolvedError = shouldUseSearchFallback ? searchedProductsError : productsError;
  const shouldUseCategoryQuery = !!selectedCategory;
  const useFeaturedDataset = shouldUseFeaturedQuery && (hasFeaturedData || featuredProductsLoading);
  const finalProductsData = useFeaturedDataset
    ? featuredProductsData
    : (shouldUseCategoryQuery ? categoryProductsData : resolvedProductsData);
  const finalPageInfo = useFeaturedDataset
    ? featuredProductsPageInfo
    : (shouldUseCategoryQuery ? categoryProductsPageInfo : resolvedPageInfo);
  const finalTotalCount = useFeaturedDataset
    ? (featuredProductsPageInfo?.totalElements ?? (Array.isArray(featuredProductsData) ? featuredProductsData.length : 0))
    : (shouldUseCategoryQuery ? categoryProductsTotalCount : resolvedTotalCount);
  const finalError = useFeaturedDataset
    ? featuredProductsError
    : (shouldUseCategoryQuery ? categoryProductsError : resolvedError);
  const loading =
    (useFeaturedDataset ? featuredProductsLoading : (shouldUseCategoryQuery ? categoryProductsLoading : productsLoading)) ||
    (debouncedSearch.length > 0 && searchedProductsLoading);
  const products = Array.isArray(finalProductsData) ? finalProductsData.map(normalizeProduct) : [];
  const error = finalError ? finalError.message : null;

  // Client-side fallback filtering to keep UI filters functional even when backend ignores some filter fields.
  const filteredProducts = products.filter((product) => {
    const text = debouncedSearch.trim().toLowerCase();
    const productText = [product.name, product.description, product.category?.name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = !text || productText.includes(text);
    const matchesCategory =
      !selectedCategory ||
      String(product.category?.id ?? product.categoryId ?? '') === String(selectedCategory) ||
      String(product.category?.slug ?? '') === String(selectedCategorySlug ?? '');

    const effectivePrice =
      (typeof product.effectivePrice === 'number' ? product.effectivePrice : undefined) ??
      (typeof product.discountPrice === 'number' ? product.discountPrice : undefined) ??
      (typeof product.price === 'number' ? product.price : 0);
    const minRaw = debouncedMinPrice.trim() !== '' ? Number(debouncedMinPrice) : undefined;
    const maxRaw = debouncedMaxPrice.trim() !== '' ? Number(debouncedMaxPrice) : undefined;
    const minParsed = minRaw !== undefined && Number.isFinite(minRaw) ? minRaw : undefined;
    const maxParsed = maxRaw !== undefined && Number.isFinite(maxRaw) ? maxRaw : undefined;
    const normalizedMin = minParsed !== undefined && maxParsed !== undefined ? Math.min(minParsed, maxParsed) : minParsed;
    const normalizedMax = minParsed !== undefined && maxParsed !== undefined ? Math.max(minParsed, maxParsed) : maxParsed;
    const matchesMinPrice = normalizedMin === undefined || effectivePrice >= normalizedMin;
    const matchesMaxPrice = normalizedMax === undefined || effectivePrice <= normalizedMax;

    // `featuredProducts` query may omit the `featured` field in each item.
    // If we are already on the dedicated featured query path, treat all returned items as featured.
    const matchesFeatured = !featuredOnly || (shouldUseFeaturedQuery ? true : !!product.featured);
    const matchesNew = !newOnly || !!(product as any).isNew;
    const matchesBestseller = !bestsellerOnly || !!(product as any).isBestseller;

    const derivedInventoryStatus =
      product.inventoryStatus ||
      (product.stockStatus === 'LOW_STOCK'
        ? 'LOW_STOCK'
        : product.stockStatus === 'OUT_OF_STOCK'
        ? 'OUT_OF_STOCK'
        : product.inStock === false || (product.availableQuantity ?? 1) <= 0
        ? 'OUT_OF_STOCK'
        : 'IN_STOCK');
    const isInStock = derivedInventoryStatus !== 'OUT_OF_STOCK';
    const matchesInStock = !inStockOnly || isInStock;
    const matchesInventoryStatus = !inventoryStatus || derivedInventoryStatus === inventoryStatus;

    const hasDiscount =
      !!product.discountPrice ||
      ((product.discountPercentage ?? 0) > 0) ||
      (product.discountPrice != null && product.price != null && product.discountPrice < product.price);
    const matchesOnSale = !onSaleOnly || hasDiscount;

    const ratingValue = product.averageRating ?? product.rating ?? 0;
    const minRatingValue = minRating ? parseFloat(minRating) : undefined;
    const matchesRating = minRatingValue === undefined || ratingValue >= minRatingValue;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesFeatured &&
      matchesNew &&
      matchesBestseller &&
      matchesInStock &&
      matchesOnSale &&
      matchesRating &&
      matchesInventoryStatus
    );
  });

  const pagination = finalPageInfo ? {
    page: finalPageInfo.page ?? currentPage,
    size: finalPageInfo.size ?? pageSize,
    totalElements: finalPageInfo.totalElements ?? finalTotalCount,
    totalPages: finalPageInfo.totalPages ?? Math.ceil(finalTotalCount / pageSize),
    hasNext: finalPageInfo.hasNext ?? !(finalPageInfo.isLast ?? true),
    hasPrevious: finalPageInfo.hasPrevious ?? !(finalPageInfo.isFirst ?? true),
  } : {
    page: currentPage,
    size: pageSize,
    totalElements: finalTotalCount,
    totalPages: Math.ceil(finalTotalCount / pageSize),
    hasNext: (currentPage + 1) * pageSize < finalTotalCount,
    hasPrevious: currentPage > 0,
  };

  // Sync state with URL params
  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  // Sync state with URL params when URL changes (e.g., navigation from categories page)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const newCategory = categoryParam || null;
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory);
    }

    const queryParam = searchParams.get('q') || '';
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }

    const pageParam = parseInt(searchParams.get('page') || '0');
    if (pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }

    const minPriceParam = searchParams.get('minPrice') || '';
    if (minPriceParam !== minPrice) {
      setMinPrice(minPriceParam);
    }

    const maxPriceParam = searchParams.get('maxPrice') || '';
    if (maxPriceParam !== maxPrice) {
      setMaxPrice(maxPriceParam);
    }

    const featuredParam = searchParams.get('featured') === 'true';
    if (featuredParam !== featuredOnly) {
      setFeaturedOnly(featuredParam);
    }

    const newParam = searchParams.get('new') === 'true';
    if (newParam !== newOnly) {
      setNewOnly(newParam);
    }

    const bestsellerParam = searchParams.get('bestseller') === 'true';
    if (bestsellerParam !== bestsellerOnly) {
      setBestsellerOnly(bestsellerParam);
    }

    const inStockParam = searchParams.get('inStock') === 'true';
    if (inStockParam !== inStockOnly) {
      setInStockOnly(inStockParam);
    }

    const onSaleParam = searchParams.get('onSale') === 'true';
    if (onSaleParam !== onSaleOnly) {
      setOnSaleOnly(onSaleParam);
    }

    const minRatingParam = searchParams.get('rating') || '';
    if (minRatingParam !== minRating) {
      setMinRating(minRatingParam);
    }

    const statusParam = searchParams.get('status') || '';
    if (statusParam !== inventoryStatus) {
      setInventoryStatus(statusParam);
    }

    const sortParam = searchParams.get('sort') || 'createdAt-desc';
    if (sortParam !== sortValue) {
      setSortValue(sortParam);
    }
  }, [searchParams]);

  // Reset to first page when filters change (except page itself)
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedCategory, debouncedMinPrice, debouncedMaxPrice, featuredOnly, newOnly, bestsellerOnly, inStockOnly, onSaleOnly, minRating, inventoryStatus, sortValue]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setFeaturedOnly(false);
    setNewOnly(false);
    setBestsellerOnly(false);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMinRating('');
    setInventoryStatus('');
    setSortValue('createdAt-desc');
    setCurrentPage(0);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory || minPrice || maxPrice || featuredOnly || newOnly || bestsellerOnly || inStockOnly || onSaleOnly || minRating || inventoryStatus;

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: number[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 0; i < 5; i++) pages.push(i);
        pages.push(-1); // ellipsis
        pages.push(total - 1);
      } else if (current >= total - 4) {
        pages.push(0);
        pages.push(-1);
        for (let i = total - 5; i < total; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-2);
        pages.push(total - 1);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h1>
          {pagination && (
            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredProducts.length} of {pagination.totalElements} products
            </p>
          )}
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={categoriesLoading}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range (GHS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    min="0"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Featured Only */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Featured Only</span>
                </label>
              </div>

              {/* New Products Only */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newOnly}
                    onChange={(e) => setNewOnly(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">New Arrivals</span>
                </label>
              </div>

              {/* Bestseller Only */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bestsellerOnly}
                    onChange={(e) => setBestsellerOnly(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Bestsellers</span>
                </label>
              </div>

              {/* In Stock Only */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>

              {/* On Sale Only */}
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">On Sale</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inventory Status Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status
                </label>
                <select
                  value={inventoryStatus}
                  onChange={(e) => setInventoryStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {inventoryStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters Tags */}
              {hasActiveFilters && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        Search: {searchQuery}
                        <button
                          onClick={() => setSearchQuery('')}
                          className="hover:text-primary/80"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        Category: {categories.find((c) => String(c.id) === String(selectedCategory))?.name}
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="hover:text-primary/80"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        Price: GHS {minPrice || '0'} - {maxPrice || '∞'}
                        <button
                          onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                          className="hover:text-primary/80"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {featuredOnly && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        Featured
                        <button
                          onClick={() => setFeaturedOnly(false)}
                          className="hover:text-primary/80"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {newOnly && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        New Arrivals
                        <button
                          onClick={() => setNewOnly(false)}
                          className="hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {bestsellerOnly && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        Bestsellers
                        <button
                          onClick={() => setBestsellerOnly(false)}
                          className="hover:text-orange-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {inStockOnly && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        In Stock
                        <button
                          onClick={() => setInStockOnly(false)}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {onSaleOnly && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        On Sale
                        <button
                          onClick={() => setOnSaleOnly(false)}
                          className="hover:text-red-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {minRating && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        {minRating}★ & Up
                        <button
                          onClick={() => setMinRating('')}
                          className="hover:text-yellow-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {inventoryStatus && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {inventoryStatusOptions.find(o => o.value === inventoryStatus)?.label}
                        <button
                          onClick={() => setInventoryStatus('')}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortValue}
                  onChange={(e) => setSortValue(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  title="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  title="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <SkeletonProductCardGrid count={pageSize} />
            ) : error ? (
              <EmptyState
                title="Unable to load products"
                description={error}
              />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title="No products found"
                description={
                  hasActiveFilters
                    ? 'Try adjusting your filters or search query'
                    : 'Check back later for new products'
                }
                action={hasActiveFilters ? { label: 'Clear Filters', onClick: clearFilters } : undefined}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow p-4 flex gap-4 hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="w-32 h-32 flex-shrink-0"
                    >
                      <img
                        src={
                          product.images?.[0] ||
                          product.imageUrl ||
                          '/placeholder.png'
                        }
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${product.slug || product.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-primary line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      {product.category && (
                        <p className="text-sm text-gray-500 mt-1">
                          {product.category.name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold text-primary">
                          GHS {product.price?.toFixed(2)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            GHS {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.averageRating !== undefined && product.averageRating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(product.averageRating!)
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
                          <span className="text-sm text-gray-500">
                            ({product.reviewCount || 0})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={!pagination.hasPrevious}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, idx) =>
                    pageNum < 0 ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${pageNum === pagination.page
                          ? 'bg-primary text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Summary */}
            {pagination && (
              <div className="mt-4 text-center text-sm text-gray-500">
                Page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} total products)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><SkeletonProductCardGrid count={12} /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
