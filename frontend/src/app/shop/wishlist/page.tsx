'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  X,
  Grid,
  List,
  Search,
  Filter,
  SortAsc,
  Trash2,
  ArrowRight,
  Package,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { WishlistItem, getWishlistItemProductId } from '@/context/WishlistContext';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'available' | 'price-drops' | 'purchased';

export default function WishlistPage() {
  const {
    wishlist,
    isLoading,
    removeFromWishlist,
    getItemsWithPriceDrops,
    getPurchasedItems,
    getAvailableItems,
    moveToCart,
  } = useWishlist();

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-added');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [movingItem, setMovingItem] = useState<number | null>(null);

  // Apply filters
  const filteredItems = useMemo(() => {
    let items = [...wishlist];

    // Tab filter
    if (filterTab === 'available') {
      items = getAvailableItems();
    } else if (filterTab === 'price-drops') {
      items = getItemsWithPriceDrops();
    } else if (filterTab === 'purchased') {
      items = getPurchasedItems();
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.product?.name?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-added':
        items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      case 'price-low':
        items.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
        break;
      case 'price-high':
        items.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
        break;
      case 'name':
        items.sort((a, b) => (a.product?.name || '').localeCompare(b.product?.name || ''));
        break;
    }

    return items;
  }, [wishlist, filterTab, searchQuery, sortBy, getAvailableItems, getItemsWithPriceDrops, getPurchasedItems]);

  const handleMoveToCart = async (item: WishlistItem) => {
    const productId = getWishlistItemProductId(item);
    if (!productId) return;
    
    setMovingItem(productId);
    try {
      if (isAuthenticated) {
        await moveToCart(productId);
        toast.success(`${item.product?.name || 'Item'} moved to cart!`);
      } else {
        await addToCart(productId);
        toast.success(`${item.product?.name || 'Item'} added to cart!`);
      }
    } catch (error) {
      console.error('Failed to move to cart:', error);
      toast.error('Failed to move item to cart');
    } finally {
      setMovingItem(null);
    }
  };

  const handleRemove = async (item: WishlistItem) => {
    const productId = getWishlistItemProductId(item);
    if (!productId) return;
    
    try {
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const toggleSelection = (productId: number) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    setSelectedItems(filteredItems.map(getWishlistItemProductId).filter(Boolean) as number[]);
  };

  const invertSelection = () => {
    const allIds = filteredItems.map(getWishlistItemProductId).filter(Boolean) as number[];
    setSelectedItems(prev => 
      allIds.filter(id => !prev.includes(id))
    );
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkMoveToCart = async () => {
    for (const productId of selectedItems) {
      try {
        await moveToCart(productId);
      } catch (error) {
        console.error(`Failed to move ${productId} to cart:`, error);
      }
    }
    toast.success(`${selectedItems.length} items moved to cart`);
    clearSelection();
  };

  const handleBulkRemove = async () => {
    if (!confirm(`Remove ${selectedItems.length} items from wishlist?`)) return;
    
    for (const productId of selectedItems) {
      try {
        await removeFromWishlist(productId);
      } catch (error) {
        console.error(`Failed to remove ${productId}:`, error);
      }
    }
    toast.success(`${selectedItems.length} items removed`);
    clearSelection();
  };

  // Empty state
  if (!isLoading && wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-8">
            Save items you love by clicking the heart icon on any product
          </p>
          <Link href="/shop/products">
            <Button size="lg" className="bg-red-500 hover:bg-red-600">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-500">{wishlist.length} items</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSelectionMode && filteredItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={selectedItems.length === filteredItems.length}
                >
                  {selectedItems.length === filteredItems.length ? 'All Selected' : `Select All (${filteredItems.length})`}
                </Button>
              )}
              
              {isSelectionMode && selectedItems.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMoveToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Move to Cart ({selectedItems.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleBulkRemove}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </>
              )}
              
              <Button
                variant={isSelectionMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isSelectionMode) {
                    clearSelection();
                  } else {
                    setIsSelectionMode(true);
                  }
                }}
              >
                {isSelectionMode ? 'Done' : 'Select'}
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2 -mb-2">
            {[
              { id: 'all', label: 'All Items', count: wishlist.length },
              { id: 'available', label: 'In Stock', count: getAvailableItems().length },
              { id: 'price-drops', label: 'Price Drops', count: getItemsWithPriceDrops().length },
              { id: 'purchased', label: 'Purchased', count: getPurchasedItems().length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as FilterTab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filterTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="date-added">Date Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Bar */}
      {isSelectionMode && (
        <div className="bg-gray-900 text-white py-2 sticky top-[108px] z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 rounded"
                />
                {selectedItems.length === filteredItems.length && filteredItems.length > 0 ? 'All Selected' : 'Select All'}
              </label>
              <button 
                onClick={invertSelection} 
                className="text-sm hover:underline"
                disabled={filteredItems.length === 0}
              >
                Invert
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-sm">{selectedItems.length} of {filteredItems.length} selected</span>
            </div>
            {selectedItems.length > 0 && (
              <button onClick={() => { clearSelection(); setIsSelectionMode(false); }} className="text-sm hover:underline">
                Clear & Exit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No items match your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterTab('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => {
              const productId = getWishlistItemProductId(item);
              const isSelected = selectedItems.includes(productId);
              const isOutOfStock = !item.inStock;
              
              return (
                <div
                  key={item.id}
                  className={`relative bg-white rounded-xl border transition-all ${
                    isSelected ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'
                  } ${isOutOfStock ? 'opacity-75' : ''}`}
                >
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(productId)}
                        className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
                    <img
                      src={item.product?.imageUrl || '/placeholder.png'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                    {item.isPriceDropped && (
                      <div className={`absolute bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${isSelectionMode ? 'left-10' : 'right-2'}`}>
                        <TrendingDown className="w-3 h-3" />
                        Save ${item.priceDifference?.toFixed(2)}
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Out of Stock</span>
                      </div>
                    )}
                    {!isSelectionMode && (
                      <button
                        onClick={() => handleRemove(item)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                      {item.product?.name || 'Unknown Product'}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        ${item.currentPrice?.toFixed(2)}
                      </span>
                      {item.priceWhenAdded && item.currentPrice && item.currentPrice < item.priceWhenAdded && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.priceWhenAdded.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        disabled={movingItem === productId || isOutOfStock}
                        onClick={() => handleMoveToCart(item)}
                      >
                        {movingItem === productId ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            {isOutOfStock ? 'Notify' : 'Move'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const productId = getWishlistItemProductId(item);
              const isSelected = selectedItems.includes(productId);
              
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4 flex gap-4 transition-all ${
                    isSelected ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelection(productId)}
                      className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                  )}
                  
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.imageUrl || '/placeholder.png'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.product?.name || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.product?.categoryName}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        ${item.currentPrice?.toFixed(2)}
                      </span>
                      {item.isPriceDropped && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Save ${item.priceDifference?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 justify-center">
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600"
                      disabled={movingItem === productId || !item.inStock}
                      onClick={() => handleMoveToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {item.inStock ? 'Move to Cart' : 'Notify Me'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRemove(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
