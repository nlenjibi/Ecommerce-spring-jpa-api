'use client';

import { useState } from 'react';
import { Pagination } from '@/components/features/admin/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api';
import { Plus, Edit, Trash2, X, FolderTree, Folder, Search, Filter, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useDebounce } from '@/hooks';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  level?: number;
  isActive?: boolean;
  active?: boolean;
  parent?: { id: number; slug: string | null; name: string | null };
  children?: Category[];
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  parentId: number | null;
  displayOrder: number;
}

const defaultFormData: CategoryFormData = {
  name: '',
  description: '',
  imageUrl: '',
  parentId: null,
  displayOrder: 0,
};

type FilterType = 'all' | 'root' | 'active' | 'search' | 'children';

export default function AdminCategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [categoryType, setCategoryType] = useState<'parent' | 'child'>('parent');
  const [page, setPage] = useState(0); // 0-based for API
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const size = 12;
  const queryClient = useQueryClient();

  // Main categories query - changes based on filter type
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'categories', { page, size, filterType, search: debouncedSearch, parentId: selectedParentId }],
    queryFn: () => {
      switch (filterType) {
        case 'root':
          return categoriesApi.getRoot();
        case 'active':
          return categoriesApi.getActive();
        case 'search':
          return debouncedSearch ? categoriesApi.search(debouncedSearch) : categoriesApi.getAll({ page, size });
        case 'children':
          return selectedParentId ? categoriesApi.getChildren(selectedParentId) : categoriesApi.getAll({ page, size });
        default:
          return categoriesApi.getAll({ page, size });
      }
    },
  });

  // Fetch category hierarchy for parent dropdown and children filter
  const { data: hierarchyData } = useQuery({
    queryKey: ['categories', 'hierarchy'],
    queryFn: () => categoriesApi.getHierarchy(),
  });

  // Handle API response - could be paginated or array
  const apiData = data as any;
  const categories = apiData?.data?.content || apiData?.data || [];
  const totalPages = apiData?.data?.totalPages || 1;
  const totalElements = apiData?.data?.totalElements || categories.length || 0;
  const isPaginated = filterType === 'all';

  // Get parent categories from hierarchy
  const hierarchyResponse = hierarchyData as any;
  const parentCategories: Category[] = hierarchyResponse?.data || hierarchyResponse || [];

  const createParentMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; imageUrl?: string; displayOrder?: number }) => 
      categoriesApi.createParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'hierarchy'] });
      toast.success('Parent category created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create parent category'),
  });

  const createChildMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; imageUrl?: string; parentId: number; displayOrder?: number }) => 
      categoriesApi.createChild(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'hierarchy'] });
      toast.success('Child category created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create child category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) => 
      categoriesApi.update(id, {
        name: data.name,
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
        parentId: data.parentId || undefined,
        displayOrder: data.displayOrder || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Category updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Category deleted successfully');
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Category activated');
    },
    onError: () => toast.error('Failed to activate category'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Category deactivated');
    },
    onError: () => toast.error('Failed to deactivate category'),
  });

  const toggleCategoryStatus = (category: Category) => {
    const isActive = category.isActive ?? category.active ?? true;
    if (isActive) {
      deactivateMutation.mutate(category.id);
    } else {
      activateMutation.mutate(category.id);
    }
  };

  const clearFilters = () => {
    setFilterType('all');
    setSearchTerm('');
    setSelectedParentId(null);
    setPage(0);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        parentId: category.parent?.id || null,
        displayOrder: category.displayOrder || 0,
      });
      // Set category type based on whether it has a parent
      setCategoryType(category.parent?.id ? 'child' : 'parent');
    } else {
      setEditingCategory(null);
      setFormData(defaultFormData);
      setCategoryType('parent');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(defaultFormData);
    setCategoryType('parent');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate name length
    if (formData.name.length < 2 || formData.name.length > 100) {
      toast.error('Category name must be between 2 and 100 characters');
      return;
    }
    if (formData.description.length > 500) {
      toast.error('Description must not exceed 500 characters');
      return;
    }
    
    // For child categories, parentId is required
    if (categoryType === 'child' && !formData.parentId) {
      toast.error('Please select a parent category');
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      // Use different endpoints for parent vs child categories
      if (categoryType === 'parent') {
        createParentMutation.mutate({
          name: formData.name,
          description: formData.description || undefined,
          imageUrl: formData.imageUrl || undefined,
          displayOrder: formData.displayOrder || 0,
        });
      } else {
        createChildMutation.mutate({
          name: formData.name,
          description: formData.description || undefined,
          imageUrl: formData.imageUrl || undefined,
          parentId: formData.parentId!,
          displayOrder: formData.displayOrder || 0,
        });
      }
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Organize your products into categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => {
                const nextValue = e.target.value;
                const trimmedValue = nextValue.trim();
                setSearchTerm(nextValue);
                setFilterType(trimmedValue ? 'search' : 'all');
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Type Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setFilterType('all'); setPage(0); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilterType('root'); setPage(0); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'root' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Folder className="w-4 h-4 inline mr-1" />
              Root Only
            </button>
            <button
              onClick={() => { setFilterType('active'); setPage(0); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ToggleRight className="w-4 h-4 inline mr-1" />
              Active
            </button>

            {/* Children Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedParentId || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setSelectedParentId(val);
                  setFilterType(val ? 'children' : 'all');
                  setPage(0);
                }}
                className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                  filterType === 'children' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <option value="">Children of...</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(filterType !== 'all' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <X className="w-4 h-4 inline mr-1" />
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500 lg:ml-auto">
            {totalElements} categor{totalElements === 1 ? 'y' : 'ies'}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-100 rounded mb-3"></div>
              <div className="h-4 w-20 bg-gray-100 rounded"></div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-12 text-red-500">
            Failed to load categories. Please try again.
          </div>
        ) : categories?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No categories found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterType !== 'all' ? 'Try adjusting your filters' : 'Create your first category to get started'}
            </p>
          </div>
        ) : (
          categories?.map((category: Category) => {
            const isActive = category.isActive ?? category.active ?? true;
            return (
              <div key={category.id} className={`bg-white rounded-xl shadow-sm p-6 border ${isActive ? 'border-gray-100' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{category.name}</h3>
                      {!isActive && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          Inactive
                        </span>
                      )}
                      {category.parent && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                          Child
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description || 'No description'}</p>
                    {category.parent && (
                      <p className="text-xs text-purple-600 mt-2">
                        Parent: {category.parent.name}
                      </p>
                    )}
                    <p className="text-sm text-blue-600 mt-2">{category.productCount || 0} products</p>
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    {/* Toggle Active/Inactive */}
                    <button
                      onClick={() => toggleCategoryStatus(category)}
                      disabled={activateMutation.isPending || deactivateMutation.isPending}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                        isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={isActive ? 'Deactivate category' : 'Activate category'}
                    >
                      {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openModal(category)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination - only show for paginated results */}
      {filterType === 'all' && totalPages > 1 && (
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          onPageChange={setPage}
          totalElements={totalElements}
          size={size}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Type Toggle - only show for new categories */}
              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryType('parent');
                        setFormData({ ...formData, parentId: null });
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        categoryType === 'parent'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Folder className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">Parent Category</p>
                        <p className="text-xs opacity-75">Top-level category</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryType('child')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                        categoryType === 'child'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FolderTree className="w-5 h-5" />
                      <div className="text-left">
                        <p className="font-medium">Child Category</p>
                        <p className="text-xs opacity-75">Under a parent</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Parent Category Dropdown - only show for child categories */}
              {categoryType === 'child' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category *
                  </label>
                  <select
                    required
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a parent category</option>
                    {parentCategories
                      .filter((cat: Category) => cat.id !== editingCategory?.id)
                      .map((cat: Category) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  {parentCategories.length === 0 && (
                    <p className="text-sm text-amber-600 mt-1">
                      No parent categories found. Create a parent category first.
                    </p>
                  )}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name * <span className="text-xs text-gray-400">(2-100 characters)</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-xs text-gray-400">(max 500 characters)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the category"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL <span className="text-xs text-gray-400">(max 500 characters)</span>
                </label>
                <input
                  type="url"
                  maxLength={500}
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={formData.imageUrl}
                      alt="Category preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.png';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  min={0}
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createParentMutation.isPending || createChildMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {(createParentMutation.isPending || createChildMutation.isPending || updateMutation.isPending) 
                    ? 'Saving...' 
                    : editingCategory 
                      ? 'Save Changes' 
                      : categoryType === 'parent' 
                        ? 'Create Parent Category' 
                        : 'Create Child Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
