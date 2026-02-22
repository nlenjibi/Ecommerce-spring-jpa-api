"use client";
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import { useProducts } from '@/hooks/domain/use-products-graphql';
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

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (updatedOrder: Order) => void;
}

interface ProductSelectItem {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
}

export default function EditOrderModal({ order, onClose, onUpdate }: EditOrderModalProps) {
  const [items, setItems] = useState<OrderItem[]>(order.items || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { products, loading: loadingProducts } = useProducts({
    search: searchQuery,
    page: 0,
    size: 20,
  });

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

      const { subtotal, taxAmount, shippingCost, totalAmount } = calculateTotals();
      
      const updatedOrder = {
        ...order,
        items,
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
      };
      
      toast.success('Order updated successfully');
      onUpdate(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Order</h2>
            <p className="text-sm text-gray-600">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Current Items */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Order Items</h3>
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="mx-auto mb-2" size={24} />
                  <p>No items in order</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                    <img
                      src={item.productImageUrl || '/placeholder.png'}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-600">{formatPrice(item.unitPrice)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="text-right w-24">
                      <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Product */}
          <div>
            <button
              onClick={() => setShowProductSearch(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Product Search */}
          {showProductSearch && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              
              {loadingProducts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {availableProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-2">No products found</p>
                  ) : (
                    availableProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAddProduct(product)}
                        disabled={!product.inStock}
                        className="w-full flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(product.price)} • {product.inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
                          </p>
                        </div>
                        <Plus size={16} className="text-gray-400" />
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Order Summary */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="text-gray-900">{formatPrice(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">{totals.shippingCost === 0 ? 'Free' : formatPrice(totals.shippingCost)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-gray-900">{formatPrice(totals.totalAmount)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || items.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
  );
}
