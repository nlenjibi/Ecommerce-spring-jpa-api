'use client';

import React, { useState } from 'react';
import {
  Heart,
  Settings,
  BarChart3,
  FolderPlus,
  Download,
  Share2,
  Calendar,
  Target,
  Bell,
  Filter,
  Grid,
  List,
  TrendingDown,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ReminderManager, 
  PriceNotificationManager,
  GuestWishlistManager,
  ImportExportTools,
  WishlistAnalytics,
  CollectionManager,
} from './index';
import { Button } from '@/components/ui/Button';
import { WishlistItem } from '@/context/WishlistContext';
import toast from 'react-hot-toast';

interface ComprehensiveWishlistManagerProps {
  className?: string;
}

export function ComprehensiveWishlistManager({ className = '' }: ComprehensiveWishlistManagerProps) {
  const { 
    wishlist, 
    isInWishlist, 
    addToWishlist, 
    removeFromWishlist, 
    updateWishlistItem,
    getItemsByPriority,
    getItemsByCollection,
    moveToCollection,
    getItemsWithPriceDrops,
    getItemsBelowTargetPrice,
    getPurchasedItems,
    getUnpurchasedItems,
    getAvailableItems,
    loadSummary,
    loadAnalytics,
    optimizeWishlist,
    shareWishlist,
    moveToCart,
  } = useWishlist();
  
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'analytics' | 'collections' | 'settings'>('overview');
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Move single item to cart (add to cart + remove from wishlist)
  const handleMoveToCart = async (item: WishlistItem) => {
    try {
      setAddingToCart(item.productId);
      
      // For authenticated users, use moveToCart (adds to cart AND removes from wishlist)
      if (isAuthenticated) {
        await moveToCart(item.productId);
        toast.success(`${item.product.name} moved to cart!`);
      } else {
        // For guests, just add to cart (can't remove from wishlist without auth)
        await addToCart(item.productId);
        toast.success(`${item.product.name} added to cart!`);
      }
    } catch (error) {
      console.error('Failed to move to cart:', error);
      toast.error('Failed to move item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Add single item to cart only (keep in wishlist)
  const handleAddToCart = async (item: WishlistItem) => {
    try {
      setAddingToCart(item.productId);
      await addToCart(item.productId);
      toast.success(`${item.product.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // Add all items to cart handler
  const handleAddAllToCart = async () => {
    if (wishlist.length === 0) return;
    
    try {
      setIsAddingAll(true);
      let successCount = 0;
      
      for (const item of wishlist) {
        try {
          await addToCart(item.productId);
          successCount++;
        } catch (error) {
          console.error(`Failed to add ${item.product.name} to cart:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} items added to cart!`);
      } else {
        toast.error('Failed to add items to cart');
      }
    } finally {
      setIsAddingAll(false);
    }
  };

  // Tab panels
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Heart className="w-8 h-8 text-red-500 fill-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{wishlist.length}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            {getItemsBelowTargetPrice().length}
          </div>
          <div className="text-sm text-gray-600">Target Reached</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">
            {getItemsWithPriceDrops().length}
          </div>
          <div className="text-sm text-gray-600">Price Drops</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <Bell className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {getAvailableItems().length}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Button
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2 justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm hover:shadow-md hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200"
          >
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-blue-900 font-medium">View Analytics</span>
          </Button>
              <Button
            onClick={() => setActiveTab('collections')}
            className="flex items-center gap-2 justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm hover:shadow-md hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200"
          >
            <FolderPlus className="w-5 h-5 text-purple-600" />
            <span className="text-purple-900 font-medium">Manage Collections</span>
          </Button>
                  
              <Button
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2 justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm hover:shadow-md hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200"
          >
            <Download className="w-5 h-5 text-green-600" />
            <span className="text-green-900 font-medium">Import/Export</span>
          </Button>
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Recent Additions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.slice(-6).reverse().map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex gap-3">
                <img
                  src={item.product.imageUrl || '/placeholder.png'}
                  alt={item.product.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ${item.product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {item.isPriceDropped && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Price Drop
                      </span>
                    )}
                    {item.targetPrice && item.currentPrice <= item.targetPrice && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Target Reached
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ItemsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">All Wishlist Items</h3>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>All Items</option>
            <option>Available Only</option>
            <option>Price Drops</option>
            <option>High Priority</option>
          </select>
          <div className="flex items-center gap-1 border border border-gray-300 rounded-lg">
            <button className="p-2 hover:bg-gray-50">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-50">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <img
                  src={item.product.imageUrl || '/placeholder.png'}
                  alt={item.product.name}
                  className="w-20 h-20 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    ${item.product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {item.priority}
                    </span>
                    {item.isPriceDropped && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Save ${item.priceDifference.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedItem(item)}
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-1" />
                Details
              </Button>
              <Button
                size="sm"
                onClick={() => handleMoveToCart(item)}
                disabled={addingToCart === item.productId}
                className="flex-1"
              >
                {addingToCart === item.productId ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Move to Cart
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => removeFromWishlist(item.productId)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-gray-50 rounded-lg ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-t-lg border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Wishlist Manager</h2>
              <p className="text-sm text-gray-600">
                Complete control over your wishlist
              </p>
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddAllToCart}
                disabled={isAddingAll || wishlist.length === 0}
                className="flex items-center gap-2"
              >
                {isAddingAll ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add All to Cart
                  </>
                )}
              </Button>
              <Button
                onClick={() => shareWishlist({
                  shareName: 'My Awesome Wishlist',
                  description: 'Check out these great products!'
                })}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-gray-100 pt-4">
          {[
            { id: 'overview', label: 'Overview', icon: Heart },
            { id: 'items', label: 'Items', icon: Grid },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'collections', label: 'Collections', icon: FolderPlus },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'items' && <ItemsTab />}
        {activeTab === 'analytics' && (
          <WishlistAnalytics className="bg-white rounded-lg" />
        )}
        {activeTab === 'collections' && (
          <CollectionManager className="bg-white rounded-lg" />
        )}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
            <div className="space-y-4">
              <ImportExportTools />
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Enable email notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Enable push notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm text-gray-700">Auto-organize by priority</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedItem.product.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedItem.product.imageUrl || '/placeholder.png'}
                  alt={selectedItem.product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Product Details</h4>
                  <p className="text-sm text-gray-600">
                    {selectedItem.product.description || 'No description available'}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-medium">${selectedItem.product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Added:</span>
                      <span className="text-sm">
                        {new Date(selectedItem.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                  <div>
                  <h4 className="font-medium text-gray-900">Actions</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowReminders(true)}
                      variant="outline"
                      className="w-full flex items-center gap-2 justify-center"
                    >
                      <Calendar className="w-4 h-4" />
                      Set Reminder
                    </Button>
                    <Button
                      onClick={() => setShowNotifications(true)}
                      variant="outline"
                      className="w-full flex items-center gap-2 justify-center"
                    >
                      <Bell className="w-4 h-4" />
                      Notification Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPriceHistory && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Price History</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPriceHistory(false)}
              >
                ×
              </Button>
            </div>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Price history feature coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {showReminders && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Set Reminder</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReminders(false)}
              >
                ×
              </Button>
            </div>
            <ReminderManager
              item={selectedItem}
              onClose={() => setShowReminders(false)}
            />
          </div>
        </div>
      )}

      {showNotifications && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                ×
              </Button>
            </div>
            <PriceNotificationManager
              item={selectedItem}
            />
          </div>
        </div>
      )}

      {showImportExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Import & Export</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImportExport(false)}
              >
                ×
              </Button>
            </div>
            <ImportExportTools />
          </div>
        </div>
      )}
    </div>
  );
}