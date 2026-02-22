'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { Plus, Edit, Trash2, Search, X, Loader2 } from 'lucide-react';
import { Pagination } from '@/components/features/admin/Pagination';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks';
import { getApiErrorMessage } from '@/lib/utils/api-error';

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const size = 10;
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(searchInput, 300);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  // Build filter params for REST API
  const filterParams = useMemo(() => {
    const params: any = {};
    
    const normalizedSearch = debouncedSearch.trim();
    if (normalizedSearch) {
      // ProductFilterRequest supports keyword/name, but not "search".
      params.keyword = normalizedSearch;
      params.name = normalizedSearch;
    }
    
    if (filterFeatured === 'featured') {
      params.featured = true;
    } else if (filterFeatured === 'not_featured') {
      params.featured = false;
    }
    
    // Filter by inventory status
    if (filterStatus === 'active') {
      params.inventoryStatus = 'IN_STOCK';
    } else if (filterStatus === 'inactive') {
      params.inventoryStatus = 'OUT_OF_STOCK';
    } else if (filterStatus === 'low_stock') {
      params.inventoryStatus = 'LOW_STOCK';
    }
    
    if (debouncedMinPrice) {
      params.minPrice = parseFloat(debouncedMinPrice);
    }
    if (debouncedMaxPrice) {
      params.maxPrice = parseFloat(debouncedMaxPrice);
    }
    
    return params;
  }, [debouncedSearch, filterStatus, filterFeatured, debouncedMinPrice, debouncedMaxPrice]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, filterStatus, filterFeatured, debouncedMinPrice, debouncedMaxPrice]);

  // Use REST API filter endpoint for fetching
  const { data: productsData, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['admin', 'products', page, size, filterParams],
    queryFn: () => productsApi.filter(filterParams, { page, size }),
    staleTime: 30000,
  });

  // Backend wraps paginated payload in ApiResponse.data.
  const productsPayload = (productsData as any)?.data ?? productsData ?? {};
  const products = productsPayload?.content || [];
  const totalPages = productsPayload?.totalPages || 1;
  const totalElements = productsPayload?.totalElements || 0;
  const currentPage = productsPayload?.page ?? page;
  const normalizedSearch = debouncedSearch.trim().toLowerCase();

  const displayedProducts = useMemo(() => {
    if (!normalizedSearch) return products;
    return products.filter((product: any) => {
      const haystack = [
        product?.name,
        product?.sku,
        product?.slug,
        product?.category?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [products, normalizedSearch]);

  // Use REST for delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted successfully');
      setDeleteId(null);
    },
    onError: (error: any) => {
      const errorMessage = getApiErrorMessage(error, 'Failed to delete product');
      toast.error(errorMessage);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Link
          href="/dashboard/admin/products/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="inactive">Out of Stock</option>
          </select>
          
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Products</option>
            <option value="featured">Featured</option>
            <option value="not_featured">Not Featured</option>
          </select>
          
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          
          {(minPrice || maxPrice) && (
            <button
              onClick={() => { setMinPrice(''); setMaxPrice(''); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {debouncedSearch && (
        <p className="text-sm text-gray-500">
          {displayedProducts.length} result{displayedProducts.length !== 1 ? 's' : ''} for "{debouncedSearch}"
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm">{getApiErrorMessage(error, 'An unexpected error occurred')}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[38%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="w-[14%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="w-[14%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-[10%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  displayedProducts.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                            {product.imageUrl || product.thumbnailUrl ? (
                              <img
                                src={product.imageUrl || product.thumbnailUrl}
                                alt={product.name || 'Product'}
                                loading="lazy"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs font-semibold">
                                IMG
                              </div>
                            )}
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {product.category?.name || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 truncate">{product.sku || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${product.price?.toFixed(2) || '0.00'}
                        </div>
                        {product.discountPrice && (
                          <div className="text-sm text-green-600">
                            ${product.discountPrice?.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.stockQuantity ?? product.availableQuantity ?? 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reserved: {product.reservedQuantity || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.inventoryStatus === 'IN_STOCK' || product.stockQuantity > 0
                            ? 'bg-green-100 text-green-800'
                            : product.inventoryStatus === 'LOW_STOCK'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inventoryStatus || (product.stockQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK')}
                        </span>
                        {product.featured && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/admin/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(Number(product.id))}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalElements={totalElements}
              size={size}
            />
          )}
        </>
      )}
    </div>
  );
}
