'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FulfillmentType, PromotionType, ProductCondition, SellerType } from '@/types';

export interface FilterState {
  // Stock filters
  inStock: boolean;
  outOfStock: boolean;
  lowStock: boolean;
  availableToday: boolean;

  // Fulfillment filters
  fulfillmentTypes: FulfillmentType[];

  // Price filters
  priceRange: [number, number];
  minDiscount: number;
  discountedOnly: boolean;
  flashSaleOnly: boolean;
  freeShippingOnly: boolean;

  // Condition filters
  condition: ProductCondition[];

  // Seller filters
  sellerTypes: SellerType[];
  verifiedSellerOnly: boolean;

  // Customer signals
  topRatedOnly: boolean;
  mostPurchasedOnly: boolean;
  trendingOnly: boolean;
  recentlyViewedOnly: boolean;
  recommendedOnly: boolean;

  // Sorting
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'trending' | 'most-purchased';

  // Search
  searchQuery: string;

  // Category
  categoryId?: number;
}

interface FilterContextType {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  applyFilters: (newFilters: Partial<FilterState>) => void;
  getQueryString: () => string;
  loadFiltersFromQuery: () => void;
}

const defaultFilters: FilterState = {
  inStock: false,
  outOfStock: false,
  lowStock: false,
  availableToday: false,
  fulfillmentTypes: [],
  priceRange: [0, 10000],
  minDiscount: 0,
  discountedOnly: false,
  flashSaleOnly: false,
  freeShippingOnly: false,
  condition: [],
  sellerTypes: [],
  verifiedSellerOnly: false,
  topRatedOnly: false,
  mostPurchasedOnly: false,
  trendingOnly: false,
  recentlyViewedOnly: false,
  recommendedOnly: false,
  sortBy: 'featured',
  searchQuery: '',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load filters from URL on mount
  useEffect(() => {
    loadFiltersFromQuery();
  }, []);

  const loadFiltersFromQuery = useCallback(() => {
    const newFilters = { ...defaultFilters };

    // Parse stock filters
    if (searchParams.get('inStock') === 'true') newFilters.inStock = true;
    if (searchParams.get('outOfStock') === 'true') newFilters.outOfStock = true;
    if (searchParams.get('lowStock') === 'true') newFilters.lowStock = true;
    if (searchParams.get('availableToday') === 'true') newFilters.availableToday = true;

    // Parse fulfillment types
    const fulfillmentParam = searchParams.get('fulfillment');
    if (fulfillmentParam) {
      newFilters.fulfillmentTypes = fulfillmentParam.split(',') as FulfillmentType[];
    }

    // Parse price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      newFilters.priceRange = [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 10000,
      ];
    }

    // Parse discount filters
    const minDiscount = searchParams.get('minDiscount');
    if (minDiscount) newFilters.minDiscount = parseInt(minDiscount);
    if (searchParams.get('discountedOnly') === 'true') newFilters.discountedOnly = true;
    if (searchParams.get('flashSaleOnly') === 'true') newFilters.flashSaleOnly = true;
    if (searchParams.get('freeShippingOnly') === 'true') newFilters.freeShippingOnly = true;

    // Parse condition
    const conditionParam = searchParams.get('condition');
    if (conditionParam) {
      newFilters.condition = conditionParam.split(',') as ProductCondition[];
    }

    // Parse seller types
    const sellerParam = searchParams.get('seller');
    if (sellerParam) {
      newFilters.sellerTypes = sellerParam.split(',') as SellerType[];
    }
    if (searchParams.get('verifiedSeller') === 'true') newFilters.verifiedSellerOnly = true;

    // Parse customer signals
    if (searchParams.get('topRated') === 'true') newFilters.topRatedOnly = true;
    if (searchParams.get('mostPurchased') === 'true') newFilters.mostPurchasedOnly = true;
    if (searchParams.get('trending') === 'true') newFilters.trendingOnly = true;
    if (searchParams.get('recentlyViewed') === 'true') newFilters.recentlyViewedOnly = true;
    if (searchParams.get('recommended') === 'true') newFilters.recommendedOnly = true;

    // Parse sort
    const sortParam = searchParams.get('sort');
    if (sortParam && ['featured', 'price-low', 'price-high', 'rating', 'newest', 'trending', 'most-purchased'].includes(sortParam)) {
      newFilters.sortBy = sortParam as FilterState['sortBy'];
    }

    // Parse search and category
    const search = searchParams.get('q');
    if (search) newFilters.searchQuery = search;
    
    const categoryId = searchParams.get('categoryId');
    if (categoryId) newFilters.categoryId = parseInt(categoryId);

    setFilters(newFilters);
  }, [searchParams]);

  const getQueryString = useCallback((): string => {
    const params = new URLSearchParams();

    if (filters.inStock) params.append('inStock', 'true');
    if (filters.outOfStock) params.append('outOfStock', 'true');
    if (filters.lowStock) params.append('lowStock', 'true');
    if (filters.availableToday) params.append('availableToday', 'true');

    if (filters.fulfillmentTypes.length > 0) {
      params.append('fulfillment', filters.fulfillmentTypes.join(','));
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      params.append('minPrice', filters.priceRange[0].toString());
      params.append('maxPrice', filters.priceRange[1].toString());
    }

    if (filters.minDiscount > 0) params.append('minDiscount', filters.minDiscount.toString());
    if (filters.discountedOnly) params.append('discountedOnly', 'true');
    if (filters.flashSaleOnly) params.append('flashSaleOnly', 'true');
    if (filters.freeShippingOnly) params.append('freeShippingOnly', 'true');

    if (filters.condition.length > 0) params.append('condition', filters.condition.join(','));
    if (filters.sellerTypes.length > 0) params.append('seller', filters.sellerTypes.join(','));
    if (filters.verifiedSellerOnly) params.append('verifiedSeller', 'true');

    if (filters.topRatedOnly) params.append('topRated', 'true');
    if (filters.mostPurchasedOnly) params.append('mostPurchased', 'true');
    if (filters.trendingOnly) params.append('trending', 'true');
    if (filters.recentlyViewedOnly) params.append('recentlyViewed', 'true');
    if (filters.recommendedOnly) params.append('recommended', 'true');

    if (filters.sortBy !== 'featured') params.append('sort', filters.sortBy);
    if (filters.searchQuery) params.append('q', filters.searchQuery);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());

    return params.toString();
  }, [filters]);

  const updateFilter = useCallback<FilterContextType['updateFilter']>(
    (key, value) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    router.push('?');
  }, [router]);

  const applyFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilter,
        resetFilters,
        applyFilters,
        getQueryString,
        loadFiltersFromQuery,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}
