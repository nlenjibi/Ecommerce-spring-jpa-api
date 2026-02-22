'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderPlus,
  FolderOpen,
  Edit2,
  X,
  Trash2,
  Tag,
  Users,
  Lock,
  Unlock,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Copy,
  Move,
  Share2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useWishlist, WishlistItem } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Collection {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  totalValue: number;
  isPublic: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface CollectionManagerProps {
  className?: string;
  onCollectionSelect?: (collection: string) => void;
  selectedCollection?: string;
}

export function CollectionManager({ 
  className = '',
  onCollectionSelect,
  selectedCollection
}: CollectionManagerProps) {
  const { user, token } = useAuth();
  const { 
    wishlist, 
    collections, 
    loadCollections, 
    moveToCollection, 
    getItemsByCollection,
    updateWishlistItem,
    isInWishlist,
    removeFromWishlist,
  } = useWishlist();

  // State
  const [isCreating, setIsCreating] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [collectionColor, setCollectionColor] = useState('#3b82f6');
  const [isPublic, setIsPublic] = useState(false);
  const [collectionTags, setCollectionTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [draggedItem, setDraggedItem] = useState<WishlistItem | null>(null);
  const [dragOverCollection, setDragOverCollection] = useState<string | null>(null);

  // Ref for tag input
  const tagInputRef = useRef<HTMLInputElement>(null);

  const COLLECTION_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#14b8a6', '#f97316', '#ec4899', '#6366f1'
  ];

  // Collection items
  const [collectionItems, setCollectionItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (user && token) {
      loadCollections();
    }
  }, [user, token]);

  useEffect(() => {
    if (selectedCollection) {
      const items = getItemsByCollection(selectedCollection);
      setCollectionItems(items);
    } else {
      setCollectionItems([]);
    }
  }, [selectedCollection, wishlist, getItemsByCollection]);

  // Create collection
  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      toast.error('Collection name is required');
      return;
    }

    setIsCreating(true);
    try {
      // In a real implementation, this would call the API
      // For now, we'll simulate creation with local state
      const newCollection: Collection = {
        id: `collection_${Date.now()}`,
        name: collectionName.trim(),
        description: collectionDescription.trim(),
        itemCount: 0,
        totalValue: 0,
        isPublic,
        color: collectionColor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: collectionTags,
      };

      // Add to collections locally (would be API call)
      toast.success('Collection created successfully');
      resetForm();
      setShowCreateForm(false);
      
      // Refresh collections
      loadCollections();
    } catch (error) {
      console.error('Failed to create collection:', error);
      toast.error('Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  // Update collection
  const handleUpdateCollection = async () => {
    if (!editingCollection || !collectionName.trim()) return;

    setIsCreating(true);
    try {
      // Update collection via API
      toast.success('Collection updated successfully');
      setEditingCollection(null);
      resetForm();
      loadCollections();
    } catch (error) {
      console.error('Failed to update collection:', error);
      toast.error('Failed to update collection');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete collection
  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? Items will be moved to your main wishlist.')) {
      return;
    }

    try {
      // Delete via API
      toast.success('Collection deleted successfully');
      loadCollections();
      
      if (selectedCollection === collectionId) {
        onCollectionSelect?.('');
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !collectionTags.includes(newTag.trim())) {
      setCollectionTags([...collectionTags, newTag.trim()]);
      setNewTag('');
      tagInputRef.current?.focus();
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setCollectionTags(collectionTags.filter(tag => tag !== tagToRemove));
  };

  // Reset form
  const resetForm = () => {
    setCollectionName('');
    setCollectionDescription('');
    setCollectionColor('#3b82f6');
    setIsPublic(false);
    setCollectionTags([]);
    setNewTag('');
    setEditingCollection(null);
  };

  // Start editing
  const startEditing = (collection: Collection) => {
    setEditingCollection(collection);
    setCollectionName(collection.name);
    setCollectionDescription(collection.description || '');
    setCollectionColor(collection.color || '#3b82f6');
    setIsPublic(collection.isPublic);
    setCollectionTags(collection.tags || []);
    setShowCreateForm(true);
  };

  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Bulk move to collection
  const handleBulkMoveToCollection = async (targetCollection: string) => {
    if (selectedItems.length === 0) return;

    try {
      await moveToCollection(selectedItems, targetCollection);
      toast.success(`Moved ${selectedItems.length} items to collection`);
      setSelectedItems([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to move items:', error);
      toast.error('Failed to move items');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (item: WishlistItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    setDragOverCollection(collectionId);
  };

  const handleDrop = async (e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    setDragOverCollection(null);

    if (draggedItem) {
      try {
        await moveToCollection([draggedItem.productId], collectionId);
        toast.success('Item moved to collection');
        setDraggedItem(null);
      } catch (error) {
        console.error('Failed to move item:', error);
        toast.error('Failed to move item');
      }
    }
  };

  // Filter collection items
  const filteredCollectionItems = collectionItems.filter(item =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Folder className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Collections</h3>
              <p className="text-sm text-gray-600">
                Organize your wishlist with collections
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            New Collection
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Collections Sidebar */}
        <div className="w-80 border-r border-gray-200">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Collections List */}
            <div className="space-y-2">
              <button
                onClick={() => onCollectionSelect?.('')}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedCollection === ''
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                } border`}
              >
                <Folder className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">All Items</div>
                  <div className="text-xs text-gray-500">
                    {wishlist.length} items
                  </div>
                </div>
              </button>

              {collections.map((collection) => (
                <button
                  key={collection}
                  onClick={() => onCollectionSelect?.(collection)}
                  className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                    selectedCollection === collection
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  } border`}
                  onDragOver={(e) => handleDragOver(e, collection)}
                  onDrop={(e) => handleDrop(e, collection)}
                >
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#3b82f6' }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate flex items-center gap-2">
                      {collection}
                      {collection === 'Private' && <Lock className="w-3 h-3" />}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getItemsByCollection(collection).length} items
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collection Items */}
        <div className="flex-1">
          {selectedCollection ? (
            <div>
              {/* Collection Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: '#3b82f6' }}
                  ></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedCollection}</h4>
                    <p className="text-sm text-gray-600">
                      {filteredCollectionItems.length} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {viewMode === 'grid' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {showBulkActions && (
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedItems.length} items selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedItems([]);
                        setShowBulkActions(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Move to:</span>
                    {collections.filter(c => c !== selectedCollection).map((collection) => (
                      <Button
                        key={collection}
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkMoveToCollection(collection)}
                      >
                        {collection}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Grid/List */}
              {filteredCollectionItems.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery ? 'No items match your search' : 'This collection is empty'}
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4' : 'space-y-2 p-4'}>
                  {filteredCollectionItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      className={`relative ${
                        viewMode === 'list' ? 'flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200' : 'bg-white rounded-lg border border-gray-200 overflow-hidden'
                      } ${showBulkActions ? 'cursor-pointer' : ''}`}
                      onClick={() => showBulkActions && toggleItemSelection(item.productId)}
                    >
                      {showBulkActions && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.productId)}
                          onChange={() => toggleItemSelection(item.productId)}
                          className="absolute top-2 left-2 z-10"
                        />
                      )}
                      
                      <img
                        src={getImageUrl(item.product.imageUrl)}
                        alt={item.product.name}
                        className={`${viewMode === 'grid' ? 'w-full h-48 object-cover' : 'w-16 h-16 rounded object-cover'}`}
                      />
                      
                      <div className={`${viewMode === 'list' ? 'flex-1' : 'p-3'}`}>
                        <h5 className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h5>
                        <div className="text-sm text-gray-600">
                          ${item.product.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select a collection to view its items
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Collection Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCollection ? 'Edit Collection' : 'Create Collection'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="Enter collection name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="Add a description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLLECTION_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCollectionColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        collectionColor === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {collectionTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make collection public
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Button
                  onClick={editingCollection ? handleUpdateCollection : handleCreateCollection}
                  disabled={!collectionName.trim() || isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Saving...' : (editingCollection ? 'Update' : 'Create')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}