"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, MapPin, CreditCard, Truck, CheckCircle, XCircle, AlertCircle, Pencil, Loader2 } from 'lucide-react';

interface OrderDetailProps {
  order: any;
  onClose?: () => void;
  onCancel?: (orderId: number, reason: string) => void;
  onOrderUpdate?: (order: any) => void;
}

export default function OrderDetail({ order, onClose, onCancel, onOrderUpdate }: OrderDetailProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'CANCELLED':
        return <XCircle className="text-red-600" size={20} />;
      case 'SHIPPED':
        return <Truck className="text-blue-600" size={20} />;
      default:
        return <AlertCircle className="text-yellow-600" size={20} />;
    }
  };

  const getProgressPercentage = (status: string) => {
    const progressMap: Record<string, number> = {
      PENDING: 25,
      PROCESSING: 50,
      SHIPPED: 75,
      DELIVERED: 100,
      CANCELLED: 0,
    };
    return progressMap[status] || 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const progressSteps = [
    { id: 'PENDING', label: 'Order Placed', completed: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) },
    { id: 'PROCESSING', label: 'Processing', completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) },
    { id: 'SHIPPED', label: 'Shipped', completed: ['SHIPPED', 'DELIVERED'].includes(order.status) },
    { id: 'DELIVERED', label: 'Delivered', completed: order.status === 'DELIVERED' },
  ];

  const handleCancel = () => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason && onCancel) {
      onCancel(order.id, reason);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  Placed on {formatDate(order.orderDate)}
                </span>
              </div>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-1 bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(order.status)}%` }}
            ></div>
          </div>
          <div className="relative flex justify-between">
            {progressSteps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  step.completed 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <p className="text-xs text-gray-600 mt-2 max-w-20">{step.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {order.trackingNumber && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="text-blue-600" size={20} />
                <div>
                  <p className="font-medium text-blue-900">Tracking Information</p>
                  <p className="text-sm text-blue-700">
                    {order.trackingNumber} {order.carrier && `• ${order.carrier}`}
                  </p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Track Package
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({order.items.length})</h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.productImageUrl || '/placeholder.png'}
                    alt={item.productName}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">Qty: {item.quantity || 1}</span>
                      <span className="font-medium text-gray-900">{formatPrice(item.totalPrice)}</span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Package size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-900">{order.shippingAddress}</p>
                    {order.estimatedDeliveryDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Est. Delivery: {formatDate(order.estimatedDeliveryDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CreditCard className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.paymentMethod.replace('_', ' ')}
                    </p>
                    <p className={`text-sm font-medium mt-1 ${
                      order.paymentStatus === 'PAID' ? 'text-green-600' :
                      order.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatPrice(order.shippingCost)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => router.push(`/shop/orders/edit?id=${order.id}`)}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Pencil size={16} />}
                    Edit Order
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                </>
              )}
              {order.status === 'DELIVERED' && (
                <button className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  Leave Review
                </button>
              )}
              <button className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Notes */}
      {order.customerNotes && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
            <p className="text-sm text-gray-600">{order.customerNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}