'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/utils/api-error';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  sku: string;
  stockQuantity: number;
  categoryId: number | null;
  isActive: boolean;
  imageUrl: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0.01,
    discountedPrice: null,
    sku: '',
    stockQuantity: 1,
    categoryId: null,
    isActive: true,
    imageUrl: '',
  });

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['admin', 'product', productId],
    queryFn: () => productsApi.getById(productId),
    enabled: !!productId,
  });

  // Handle response: { success, data: {...} } or { product: {...} }
  const apiData = productData as any;
  const product = apiData?.data || apiData?.product || apiData;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  // Handle response: { success, data: [...] } or { categories: [...] }
  const catData = categoriesData as any;
  const categories = catData?.data?.content || catData?.data || catData?.categories || [];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0.01,
        discountedPrice: product.discountedPrice || product.discountPrice || null,
        sku: product.sku || '',
        stockQuantity: product.stockQuantity ?? 1,
        categoryId: product.category?.id || product.categoryId || null,
        isActive: product.isActive ?? true,
        imageUrl: product.imageUrl || '',
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsApi.update(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productId] });
      toast.success('Product updated successfully!');
      router.push('/dashboard/admin/products');
    },
    onError: (error: any) => {
      toast.error(getApiErrorMessage(error, 'Failed to update product'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submit
    if (formData.name.length < 2 || formData.name.length > 200) {
      toast.error('Product name must be between 2 and 200 characters');
      return;
    }
    if (formData.description.length > 1000) {
      toast.error('Description must not exceed 1000 characters');
      return;
    }
    if (formData.price < 0.01) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (formData.discountedPrice !== null) {
      if (formData.discountedPrice <= 0) {
        toast.error('Discounted price must be greater than 0');
        return;
      }
      if (formData.discountedPrice >= formData.price) {
        toast.error('Discounted price must be lower than the regular price');
        return;
      }
    }
    if (formData.sku.length < 3 || formData.sku.length > 50) {
      toast.error('SKU must be between 3 and 50 characters');
      return;
    }
    if (formData.stockQuantity < 1) {
      toast.error('Stock quantity must be positive');
      return;
    }
    
    // Send JSON data with correct field names for the API
    const productData: any = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      sku: formData.sku,
      isActive: formData.isActive,
    };
    
    // Only include optional fields if they have values
    if (formData.discountedPrice !== null && formData.discountedPrice >= 0) {
      productData.discountedPrice = formData.discountedPrice;
    }
    if (formData.categoryId) {
      productData.categoryId = formData.categoryId;
    }
    if (formData.imageUrl) {
      productData.imageUrl = formData.imageUrl;
    }

    updateMutation.mutate(productData);
  };

  if (productLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/admin/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name * <span className="text-xs text-gray-400">(2-200 characters)</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
              <p className="text-xs text-gray-400 mt-1">{formData.name.length}/200 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-xs text-gray-400">(max 1000 characters)</span>
              </label>
              <textarea
                rows={4}
                maxLength={1000}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
              <p className="text-xs text-gray-400 mt-1">{formData.description.length}/1000 characters</p>
            </div>
          </div>
        </div>

        {/* Product Image */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Product Image</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL <span className="text-xs text-gray-400">(e.g., /images/products/my-product.jpg)</span>
              </label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/images/products/product-name.jpg"
              />
            </div>
            {formData.imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={formData.imageUrl} 
                    alt="Product preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).alt = 'Image not found';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price * <span className="text-xs text-gray-400">(min $0.01)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price <span className="text-xs text-gray-400">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountedPrice ?? ''}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for no discount"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU * <span className="text-xs text-gray-400">(3-50 characters)</span></label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={50}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., PROD-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity * <span className="text-xs text-gray-400">(min 1)</span></label>
              <input
                type="number"
                required
                min="1"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Organization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories?.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Active (visible in store)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/admin/products" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
