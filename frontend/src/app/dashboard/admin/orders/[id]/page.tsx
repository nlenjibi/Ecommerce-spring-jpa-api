'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminOrders } from '@/hooks/admin/use-admin-graphql';
import { adminApi } from '@/lib/api';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, Printer, AlertCircle, CreditCard, MapPin, User, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

// Status configuration
const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

const PAYMENT_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

type OrderStatus = keyof typeof ORDER_STATUSES;
type PaymentStatus = keyof typeof PAYMENT_STATUSES;

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  const orderId = Number(params.id);
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const canLoadOrder = !authLoading && isAuthenticated && isAdmin && !!orderId && !Number.isNaN(orderId);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.replace('/unauthorized');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  // Use GraphQL to get all orders and find the one we need (bypasses user ownership check)
  // refreshKey forces re-fetch when mutations complete
  const { orders: allOrders } = useAdminOrders({
    filter: {},
    pagination: { page: 0, size: 100 },
  }, { pollInterval: refreshKey > 0 ? 1000 : undefined });
  
  const order = allOrders.find((o: any) => o.id === String(orderId) || o.id === orderId) || null;
  const isLoading = !order && canLoadOrder;
  const error = null;

  const handleSuccess = () => {
    // Force re-fetch by incrementing refresh key
    setRefreshKey(prev => prev + 1);
  };

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => adminApi.orders.updateStatus(orderId, status),
    onSuccess: () => {
      handleSuccess();
      toast.success('Order status updated');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to update order status')),
  });

  const confirmOrderMutation = useMutation({
    mutationFn: () => adminApi.orders.confirm(orderId),
    onSuccess: () => {
      handleSuccess();
      toast.success('Order confirmed');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to confirm order')),
  });

  const deliverOrderMutation = useMutation({
    mutationFn: () => adminApi.orders.deliver(orderId),
    onSuccess: () => {
      handleSuccess();
      toast.success('Order marked as delivered');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to update order')),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (reason: string) => adminApi.orders.cancel(orderId, reason),
    onSuccess: () => {
      handleSuccess();
      toast.success('Order cancelled');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to cancel order')),
  });

  const deleteOrderMutation = useMutation({
    mutationFn: () => adminApi.orders.delete(orderId),
    onSuccess: () => {
      toast.success('Order deleted successfully');
      router.push('/dashboard/admin/orders');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to delete order')),
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: (status: string) => adminApi.orders.updatePaymentStatus(orderId, status),
    onSuccess: () => {
      handleSuccess();
      toast.success('Payment status updated');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to update payment status')),
  });

  const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const allPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Clock className="w-5 h-5" />;
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="w-5 h-5" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5" />;
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusConfig = (status: string) => {
    const upperStatus = status?.toUpperCase() as OrderStatus;
    return ORDER_STATUSES[upperStatus] || { label: status || 'Unknown', color: 'bg-gray-100 text-gray-700' };
  };

  const getPaymentStatusConfig = (status: string) => {
    const upperStatus = status?.toUpperCase() as PaymentStatus;
    return PAYMENT_STATUSES[upperStatus] || { label: status || 'Unknown', color: 'bg-gray-100 text-gray-700' };
  };

  const formatCurrency = (amount: number | { parsedValue?: number; source?: string } | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    if (typeof amount === 'object') {
      return `$${(amount.parsedValue ?? parseFloat(amount.source || '0')).toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="flex justify-between">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="h-3 w-16 bg-gray-100 rounded mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!canLoadOrder) {
    return null;
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          {error ? 'Failed to load order' : 'Order not found'}
        </h2>
        <p className="text-gray-500 mt-2">
          {error ? getApiErrorMessage(error, 'There was an error loading this order. Please try again.') : `Order #${orderId} could not be found.`}
        </p>
        <Link href="/dashboard/admin/orders" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderStatus = (order.status || order.orderStatus || 'PENDING').toUpperCase();
  const paymentStatus = (order.paymentStatus || 'PENDING').toUpperCase();
  const statusConfig = getStatusConfig(orderStatus);
  const paymentConfig = getPaymentStatusConfig(paymentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/admin/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {order.orderNumber || `Order #${order.id}`}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          {/* Quick Actions based on status */}
          {orderStatus === 'PENDING' && (
            <button
              onClick={() => confirmOrderMutation.mutate()}
              disabled={confirmOrderMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {confirmOrderMutation.isPending ? 'Confirming...' : 'Confirm Order'}
            </button>
          )}
          {orderStatus === 'SHIPPED' && (
            <button
              onClick={() => deliverOrderMutation.mutate()}
              disabled={deliverOrderMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {deliverOrderMutation.isPending ? 'Updating...' : 'Mark Delivered'}
            </button>
          )}
        </div>
      </div>

      {/* Status Update and Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Order Status Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Order Status:</label>
            <div className="relative">
              <select
                value={orderStatus}
                onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                disabled={updateStatusMutation.isPending}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {allStatuses.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUSES[status as OrderStatus]?.label || status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {updateStatusMutation.isPending && (
              <span className="text-sm text-gray-500">Updating...</span>
            )}
          </div>

          {/* Payment Status Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Payment Status:</label>
            <div className="relative">
              <select
                value={paymentStatus}
                onChange={(e) => updatePaymentStatusMutation.mutate(e.target.value)}
                disabled={updatePaymentStatusMutation.isPending}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 cursor-pointer"
              >
                {allPaymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {PAYMENT_STATUSES[status as PaymentStatus]?.label || status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {updatePaymentStatusMutation.isPending ? (
              <span className="text-sm text-gray-500">Updating...</span>
            ) : (
              <span className="text-sm text-gray-500">Editable</span>
            )}
          </div>

          {/* Delete Button */}
          <div className="flex items-center gap-2 lg:ml-auto">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Order
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                <span className="text-sm text-red-700">Are you sure?</span>
                <button
                  onClick={() => deleteOrderMutation.mutate()}
                  disabled={deleteOrderMutation.isPending}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteOrderMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
        <div className="flex items-center justify-between">
          {statuses.map((status, index) => {
            const currentIndex = statuses.indexOf(orderStatus);
            const isActive = index <= currentIndex && orderStatus !== 'CANCELLED';
            const isCancelled = orderStatus === 'CANCELLED';
            
            return (
              <div key={status} className="flex-1 flex items-center">
                {index > 0 && (
                  <div className={`h-1 flex-1 ${isActive ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCancelled ? 'bg-red-100 text-red-600' :
                    isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {getStatusIcon(status)}
                  </div>
                  <span className={`text-xs mt-2 text-center ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {ORDER_STATUSES[status as OrderStatus]?.label || status}
                  </span>
                </div>
                {index < statuses.length - 1 && (
                  <div className={`h-1 flex-1 ${isActive && index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Order Items ({order.items?.length || order.itemCount || 0})</h2>
          <div className="space-y-4">
            {order.items?.length > 0 ? (
              order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] || item.productImage ? (
                      <img 
                        src={item.product?.images?.[0] || item.productImage} 
                        alt={item.product?.name || item.productName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.product?.name || item.productName || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency((item.price || item.unitPrice || 0) * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.price || item.unitPrice || 0)} each
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No items found</p>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatCurrency(order.shipping || order.shippingFee || order.deliveryFee)}</span>
            </div>
            {(order.tax || order.taxAmount) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(order.tax || order.taxAmount)}</span>
              </div>
            )}
            {(order.discount || order.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount || order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(order.total || order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Customer</h2>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                {order.user?.firstName || order.customerName || 'Guest'} {order.user?.lastName || ''}
              </p>
              <p className="text-gray-600">{order.user?.email || order.customerEmail || `User #${order.userId || 'N/A'}`}</p>
              {(order.user?.phone || order.customerPhone) && (
                <p className="text-gray-600">{order.user?.phone || order.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Shipping Address</h2>
            </div>
            {order.shippingAddress || order.deliveryAddress ? (
              <div className="text-gray-600 space-y-1">
                {typeof order.shippingAddress === 'string' ? (
                  <p>{order.shippingAddress}</p>
                ) : (
                  <>
                    <p>{order.shippingAddress?.street || order.deliveryAddress?.street || order.shippingAddress?.address}</p>
                    <p>
                      {order.shippingAddress?.city || order.deliveryAddress?.city}
                      {(order.shippingAddress?.state || order.deliveryAddress?.state) && `, ${order.shippingAddress?.state || order.deliveryAddress?.state}`}
                      {' '}{order.shippingAddress?.zipCode || order.deliveryAddress?.zipCode || order.shippingAddress?.postalCode}
                    </p>
                    <p>{order.shippingAddress?.country || order.deliveryAddress?.country}</p>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No shipping address provided</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold">Payment</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paymentConfig.color}`}>
                  {paymentConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
      {(order.notes || order.adminNotes) && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <p className="text-gray-600">{order.notes || order.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
