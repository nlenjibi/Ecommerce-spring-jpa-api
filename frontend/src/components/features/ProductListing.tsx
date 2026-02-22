/**
 * Product Listing Component - Mixed REST/GraphQL Strategy Example
 * 
 * This component demonstrates the optimal use of REST and GraphQL APIs.
 * GraphQL is used for complex data fetching, while REST handles mutations.
 */

'use client';

import React from 'react';
import { toast } from 'react-hot-toast';
import { useProducts, useSearchProducts, useFeaturedProducts, useCategories } from '@/hooks/domain/use-products-graphql';
import { useCart } from '@/hooks/domain/use-cart';

interface ProductProps {
  initialFilter?: {
    category?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  };
}

export const ProductListingExample: React.FC<ProductProps> = ({
  initialFilter = {},
}) => {
  // GraphQL hooks for complex data fetching
  const {
    products: productsList,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useProducts(initialFilter);

  const {
    products: featuredProducts,
    loading: featuredLoading,
    error: featuredError
  } = useFeaturedProducts();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useCategories();

  const {
    products: searchResults,
    loading: searchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useSearchProducts();

  // REST hooks for cart operations
  const {
    cartData,
    addToCart,
    removeFromCart,
    isLoading: cartLoading,
    error: cartError
  } = useCart();

  const handleFilterChange = (newFilter: any) => {
    // Update GraphQL queries with new filters
    refetchProducts();
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart({ productId });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleSearch = (searchTerm: string) => {
    refetchSearch({ keyword: searchTerm });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Product Listing - Mixed API Strategy</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Search Section */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Search Products</h2>
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {searchLoading && <div>Loading search results...</div>}
          {searchError && <div className="text-red-500">Search failed: {searchError.message}</div>}
          {searchResults?.map((product: any) => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-md">
              <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} className="w-full h-32 object-cover mb-2" />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600">${product.price}</p>
              <button
                onClick={() => handleAddToCart(product.id)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Categories Filter */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <select
            onChange={(e) => handleFilterChange({ category: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories?.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesLoading && <div>Loading categories...</div>}
          {categoriesError && <div className="text-red-500">Failed to load categories</div>}
        </div>

        {/* Featured Products */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Featured Products</h2>
          {featuredLoading && <div>Loading featured products...</div>}
          {featuredError && <div className="text-red-500">Failed to load featured products</div>}
          {featuredProducts?.map((product: any) => (
            <div key={product.id} className="border rounded-lg p-4 hover:shadow-md">
              <div className="relative">
                <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} className="w-full h-32 object-cover mb-2" />
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Featured
                </div>
              </div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600">${product.price}</p>
              <button
                onClick={() => handleAddToCart(product.id)}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Cart Status */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>
          {cartLoading ? (
            <div>Loading cart...</div>
          ) : cartError ? (
            <div className="text-red-500">Cart error: {cartError.message}</div>
          ) : cartData ? (
            <div className="space-y-4">
              {cartData.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border rounded-lg p-4 mb-2">
                  <div>
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-gray-600">{item.quantity} × ${item.product.price}</p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:bg-red-600 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {cartData.items?.length === 0 && (
                <div className="text-gray-500">Your cart is empty</div>
              )}
              <div className="mt-4 border-t pt-4">
                <div className="text-2xl font-bold">
                  Total: ${cartData?.totalAmount || 0}
                </div>
              </div>
            </div>
          ) : (
            <div>No cart data available</div>
          )}
        </div>
      </div>

      {/* API Strategy Information */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-bold mb-4">API Strategy Demonstration</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p><strong>REST</strong></p>
              <p className="text-xs">Cart mutations (add, update, remove)</p>
              <p className="text-xs">Admin operations (create, update, delete)</p>
            </div>
            <div className="flex-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p><strong>GraphQL</strong></p>
                <p className="text-xs">Product listings, search, categories</p>
                <p className="text-xs">Cart details, user profiles</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="space-y-2">
            <h4 className="font-semibold mb-2">Product Listing (GraphQL)</h4>
            <p>✅ Single query gets products + categories + filters</p>
            <p>✅ Automatic caching and optimistic updates</p>
            <p>✅ Reduced network requests</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold mb-2">Cart Details (GraphQL)</h4>
            <p>✅ Enriched data with product information</p>
            <p>✅ Better user experience</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold mb-2">Cart Mutations (REST)</h4>
            <p>✅ Immediate feedback and status codes</p>
            <p>✅ Perfect for state changes</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold mb-2">Search (GraphQL)</h4>
            <p>✅ Complex filtering across multiple fields</p>
            <p>✅ Reduced overfetching</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingExample;