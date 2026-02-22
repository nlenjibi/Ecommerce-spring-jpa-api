"use client";
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Upload,
  Check,
  X,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { sellerApi } from '@/lib/sellerApi';
import { LoadingState, ErrorState, EmptyState } from '@/components/customer-dashboard/LoadingStates';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  categoryId?: number;
  categoryName?: string;
  tags?: string[];
  specifications?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  salesCount?: number;
  views?: number;
}

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  categoryId?: number;
  imageUrls: string[];
  tags: string[];
  isActive: boolean;
}

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    stock: 0,
    imageUrls: [],
    tags: [],
    isActive: true,
  });

  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedStatus, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await sellerApi.getProducts(params);
      setProducts(response.products || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.total || 0);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await sellerApi.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setTotalElements(totalElements - 1);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleToggleProductStatus = async (productId: number, currentStatus: boolean) => {
    const newStatus = currentStatus ? 'inactive' : 'active';
    try {
      await sellerApi.updateProductStatus(productId, newStatus);
      setProducts(products.map(p => 
        p.id === productId ? { ...p, isActive: !currentStatus } : p
      ));
    } catch (err: any) {
      console.error('Failed to update product status:', err);
      alert('Failed to update product status. Please try again.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: 0,
      stock: 0,
      imageUrls: [],
      tags: [],
      isActive: true,
    });
    setIsEditModalOpen(true);
  }; 

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditModalOpen && editingProduct) {
        await sellerApi.updateProduct(editingProduct.id, formData);
        setProducts(products.map(p => 
          p.id === editingProduct.id ? { ...p, ...formData } : p
        ));
      } else {
        await sellerApi.createProduct({ ...formData, images: formData.imageUrls || [] } as any);
        // Refresh the product list
        fetchProducts();
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: 0,
        stock: 0,
        imageUrls: [],
        tags: [],
        isActive: true,
      });
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedProducts.length === 0) return;
    
    const actionMessage = {
      activate: 'Are you sure you want to activate the selected products?',
      deactivate: 'Are you sure you want to deactivate the selected products?',
      delete: 'Are you sure you want to delete the selected products? This action cannot be undone.',
    };
    
    if (!confirm(actionMessage[action])) return;

    try {
      for (const productId of selectedProducts) {
        if (action === 'delete') {
          await sellerApi.deleteProduct(productId);
        } else {
          const newStatus = action === 'activate' ? 'active' : 'inactive';
          await sellerApi.updateProductStatus(productId, newStatus);
        }
      }
      
      // Refresh product list
      fetchProducts();
      setSelectedProducts([]);
    } catch (err: any) {
      console.error('Failed to perform bulk action:', err);
      alert('Failed to perform action. Please try again.');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'active' && product.isActive) ||
                           (selectedStatus === 'inactive' && !product.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingState type="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={fetchProducts}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('inactive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedStatus === 'inactive' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <EmptyState 
                      title="No products found"
                      description={searchTerm || selectedStatus !== 'all' 
                        ? "Try adjusting your search or filters" 
                        : "Add your first product to get started"
                      }
                      icon={<Package className="text-gray-400" size={48} />}
                      action={{
                        label: "Add Product",
                        onClick: () => setIsAddModalOpen(true)
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg object-cover flex items-center justify-center">
                          {((product as any).imageUrls?.length || 0) > 0 ? (
                            <img 
                              src={(product as any).imageUrls[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="text-gray-400" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{formatPrice(product.price)}</div>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <div className="text-sm text-green-600">Save {formatPrice(product.comparePrice - product.price)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(product.isActive)}`}>
                          {product.stock}
                        </span>
                        {product.stock <= 5 && (
                          <AlertTriangle className="text-yellow-500" size={16} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(product.isActive)}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.salesCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleProductStatus(product.id, product.isActive)}
                          className={`p-1 rounded transition-colors ${
                            product.isActive 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalElements)} of {totalElements} products
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    if (index === 0 || index === totalPages - 1 || 
                        (index >= currentPage - 2 && index <= currentPage)) {
                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`w-8 h-8 rounded ${
                            index + 1 === currentPage 
                              ? 'bg-blue-600 text-white' 
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}