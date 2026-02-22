'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import { useProducts, useSearchProducts } from '@/hooks/domain/use-products-graphql';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
}

interface ProductSelectItem {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
}

function EditOrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { products, loading: loadingProducts } = useSearchProducts({
    keyword: searchQuery,
    pagination: { page: 0, size: 20 },
  });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        toast.error('Order ID not found');
        router.push('/dashboard/customer?tab=orders');
        return;
      }

      try {
        const response = await ordersApi.getById(Number(orderId));
        const orderData = (response as any).data || response;
        setOrder(orderData);
        setItems(orderData.items || []);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order');
        router.push('/dashboard/customer?tab=orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const availableProducts: ProductSelectItem[] = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl || p.thumbnailUrl || '/placeholder.png',
    price: p.effectivePrice || p.price,
    inStock: p.inStock ?? true,
    stockQuantity: p.stockQuantity || 0,
  }));

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.unitPrice
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddProduct = (product: ProductSelectItem) => {
    const existingItem = items.find(item => item.productId === product.id);
    if (existingItem) {
      handleQuantityChange(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        productSku: '',
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
      };
      setItems(prev => [...prev, newItem]);
    }
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = 0.1;
    const taxAmount = subtotal * taxRate;
    const shippingCost = subtotal > 100 ? 0 : 10;
    const totalAmount = subtotal + taxAmount + shippingCost;
    return { subtotal, taxAmount, shippingCost, totalAmount };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleSave = async () => {
    if (!order) return;
    
    setIsSaving(true);
    try {
      const originalItems = order.items || [];
      const originalProductIds = new Set(originalItems.map(i => i.productId));
      const newProductIds = new Set(items.map(i => i.productId));

      for (const item of items) {
        const originalItem = originalItems.find(i => i.productId === item.productId);
        if (!originalItem) {
          await ordersApi.addItem(order.id, item.productId, item.quantity);
        } else if (originalItem.quantity !== item.quantity) {
          await ordersApi.updateItemQuantity(order.id, item.productId, item.quantity);
        }
      }

      for (const originalItem of originalItems) {
        if (!newProductIds.has(originalItem.productId)) {
          await ordersApi.removeItem(order.id, originalItem.productId);
        }
      }

      toast.success('Order updated successfully');
      router.push(`/dashboard/customer?tab=orders`);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/customer?tab=orders');
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={32} />
          <p className="text-gray-600">Order not found</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Order</h1>
                <p className="text-sm text-gray-600">{order.orderNumber}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || items.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="mx-auto mb-2" size={24} />
                    <p>No items in order</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.productImageUrl || '/placeholder.png'}
                        alt={item.productName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-600">{formatPrice(item.unitPrice)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right w-28">
                        <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Product */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Products</h2>
              
              {!showProductSearch ? (
                <button
                  onClick={() => setShowProductSearch(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Product
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setSearchQuery(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <button
                      onClick={() => {
                        setShowProductSearch(false);
                        setSearchTerm('');
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-gray-400" size={24} />
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {availableProducts.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No products found</p>
                      ) : (
                        availableProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleAddProduct(product)}
                            disabled={!product.inStock}
                            className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-14 h-14 rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">
                                {formatPrice(product.price)} • {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                              </p>
                            </div>
                            <Plus size={18} className="text-gray-400" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="text-gray-900">{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="text-gray-900">{formatPrice(totals.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {totals.shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(totals.shippingCost)
                    )}
                  </span>
                </div>
                {totals.subtotal < 100 && (
                  <p className="text-xs text-gray-500">Add {formatPrice(100 - totals.subtotal)} more for free shipping</p>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">{formatPrice(totals.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Original Order Summary */}
              {order && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Original Order Total</p>
                  <p className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</p>
                  {totals.totalAmount !== order.totalAmount && (
                    <p className="text-sm text-green-600 mt-1">
                      {totals.totalAmount > order.totalAmount ? '+' : ''}{formatPrice(totals.totalAmount - order.totalAmount)} change
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function X({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function EditOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <EditOrderPageContent />
    </Suspense>
  );
}
