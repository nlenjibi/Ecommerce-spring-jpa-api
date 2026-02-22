'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Eye, X, Package, ShoppingBag, Truck, CheckCircle, XCircle, Clock, RefreshCw, CreditCard } from 'lucide-react';
import { Pagination } from '@/components/features/admin/Pagination';
import toast from 'react-hot-toast';
import { useAdminOrders } from '@/hooks/admin/use-admin-graphql';
import { getApiErrorMessage } from '@/lib/utils/api-error';

// Status configuration with colors and icons
const ORDER_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: RefreshCw },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const PAYMENT_STATUSES = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

type OrderStatus = keyof typeof ORDER_STATUSES;
type PaymentStatus = keyof typeof PAYMENT_STATUSES;

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0); // 0-based for API
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const queryClient = useQueryClient();
  const size = 10;

  // Fetch orders with GraphQL - refresh when refreshKey changes
  const { orders, loading: isLoading, error, pageInfo } = useAdminOrders({
    filter: statusFilter ? { status: statusFilter } : {},
    pagination: { page, size },
  }, { pollInterval: refreshKey > 0 ? 500 : undefined });

  // Calculate stats from orders (since GraphQL orders work but stats query has issues)
  const stats = {
    totalOrders: pageInfo?.totalElements || 0,
    pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
    processingOrders: orders.filter((o: any) => o.status === 'PROCESSING').length,
    shippedOrders: orders.filter((o: any) => o.status === 'SHIPPED').length,
    deliveredOrders: orders.filter((o: any) => o.status === 'DELIVERED').length,
    totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0),
  };
  
  // Also try fetching full stats in background (will show if available)
  const { data: fullStats } = useQuery({
    queryKey: ['admin', 'order-statistics'],
    queryFn: async () => {
      try {
        const response = await adminApi.getOrderStatistics();
        return response.data;
      } catch {
        return null;
      }
    },
  });
  
  // Use full stats if available, otherwise use computed stats
  const safeStats = fullStats ? {
    totalOrders: fullStats.totalOrders ?? fullStats.total ?? stats.totalOrders,
    pendingOrders: fullStats.pendingOrders ?? stats.pendingOrders,
    processingOrders: fullStats.processingOrders ?? stats.processingOrders,
    shippedOrders: fullStats.shippedOrders ?? stats.shippedOrders,
    deliveredOrders: fullStats.deliveredOrders ?? stats.deliveredOrders,
    totalRevenue: fullStats.totalRevenue ?? fullStats.revenue ?? stats.totalRevenue,
  } : stats;

  const totalPages = pageInfo?.totalPages || 1;
  const totalElements = pageInfo?.totalElements || 0;
  const currentPage = pageInfo?.page ?? 0;

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      handleSuccess();
      toast.success('Order status updated');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to update order status')),
  });

  const confirmOrderMutation = useMutation({
    mutationFn: (orderId: number) => adminApi.confirmOrder(orderId),
    onSuccess: () => {
      handleSuccess();
      toast.success('Order confirmed');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to confirm order')),
  });

  const deliverOrderMutation = useMutation({
    mutationFn: (orderId: number) => adminApi.deliverOrder(orderId),
    onSuccess: () => {
      handleSuccess();
      toast.success('Order marked as delivered');
    },
    onError: (err: any) => toast.error(getApiErrorMessage(err, 'Failed to update order')),
  });

  const getStatusConfig = (status: string) => {
    const upperStatus = status?.toUpperCase() as OrderStatus;
    return ORDER_STATUSES[upperStatus] || { label: status, color: 'bg-gray-100 text-gray-700', icon: Package };
  };

  const getPaymentStatusConfig = (status: string) => {
    const upperStatus = status?.toUpperCase() as PaymentStatus;
    return PAYMENT_STATUSES[upperStatus] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  const formatCurrency = (amount: number | { parsedValue?: number; source?: string } | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    if (typeof amount === 'object') {
      return `$${(amount.parsedValue ?? parseFloat(amount.source || '0')).toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      {/* Statistics Cards - Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setStatusFilter('')}
          className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer transition-all hover:shadow-md ${
            !statusFilter ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <p className="text-xs text-gray-500 font-medium">Total</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{safeStats.totalOrders}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('PENDING')}
          className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'PENDING' ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <p className="text-xs text-yellow-600 font-medium">Pending</p>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{safeStats.pendingOrders}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('PROCESSING')}
          className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'PROCESSING' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <p className="text-xs text-purple-600 font-medium">Processing</p>
          </div>
          <p className="text-2xl font-bold text-purple-700">{safeStats.processingOrders}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('SHIPPED')}
          className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'SHIPPED' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <p className="text-xs text-indigo-600 font-medium">Shipped</p>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{safeStats.shippedOrders}</p>
        </div>
        <div 
          onClick={() => setStatusFilter('DELIVERED')}
          className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'DELIVERED' ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-xs text-green-600 font-medium">Delivered</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{safeStats.deliveredOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <p className="text-xs text-gray-500 font-medium">Revenue</p>
          </div>
          <p className="text-xl font-bold text-gray-900 truncate" title={formatCurrency(safeStats.totalRevenue)}>
            {formatCurrency(safeStats.totalRevenue)}
          </p>
        </div>
      </div>

      {/* Filters - Compact */}
      <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
          >
            <option value="">All Statuses</option>
            {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {totalElements} order{totalElements !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Orders Table - Optimized View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ORDER</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">CUSTOMER</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">ITEMS</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">TOTAL</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">STATUS</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">PAYMENT</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">DATE</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-3 text-center"><div className="h-4 w-8 bg-gray-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-3 text-right"><div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div></td>
                    <td className="px-4 py-3 text-center"><div className="h-6 w-20 bg-gray-200 rounded-full mx-auto"></div></td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell"><div className="h-6 w-16 bg-gray-200 rounded-full mx-auto"></div></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-3 text-right"><div className="h-8 w-20 bg-gray-200 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Failed to load orders</p>
                    <p className="text-gray-400 text-sm mt-1">{getApiErrorMessage(error, 'Please try again later')}</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No orders found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {statusFilter 
                        ? `No orders with status "${ORDER_STATUSES[statusFilter as OrderStatus]?.label || statusFilter}"` 
                        : 'Orders will appear here once customers make purchases'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => {
                  const orderStatus = order.status || order.orderStatus || '';
                  const paymentStatus = order.paymentStatus || '';
                  const statusConfig = getStatusConfig(orderStatus);
                  const paymentConfig = getPaymentStatusConfig(paymentStatus);
                  const StatusIcon = statusConfig.icon;
                  const PaymentIcon = paymentConfig.label === 'Paid' ? CheckCircle : paymentConfig.label === 'Pending' ? Clock : paymentConfig.label === 'Failed' ? XCircle : CreditCard;
                  
                  const canConfirm = orderStatus.toUpperCase() === 'PENDING';
                  const canShip = orderStatus.toUpperCase() === 'CONFIRMED' || orderStatus.toUpperCase() === 'PROCESSING';
                  const canDeliver = orderStatus.toUpperCase() === 'SHIPPED';
                  const canCancel = !['DELIVERED', 'CANCELLED'].includes(orderStatus.toUpperCase());
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      {/* Order */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-[140px]">
                              {order.orderNumber || `#${order.id}`}
                            </p>
                            <p className="text-xs text-gray-400">#{order.id}</p>
                          </div>
                        </div>
                      </td>
                      {/* Customer - Desktop only */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="max-w-[160px]">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {order.user?.firstName || order.customerName || order.customerEmail?.split('@')[0] || 'Guest'}
                          </p>
                          {order.customerEmail && (
                            <p className="text-xs text-gray-400 truncate">{order.customerEmail}</p>
                          )}
                        </div>
                      </td>
                      {/* Items */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg">
                          <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{order.items?.length || order.itemCount || 0}</span>
                        </div>
                      </td>
                      {/* Total */}
                      <td className="px-4 py-3 text-right">
                        <p className="font-bold text-gray-900 text-sm">
                          {formatCurrency(order.total || order.totalAmount || 0)}
                        </p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      {/* Payment - Desktop only */}
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${paymentConfig.color}`}>
                          <PaymentIcon className="w-3 h-3" />
                          {paymentConfig.label}
                        </span>
                      </td>
                      {/* Date - Mobile hidden */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {canConfirm && (
                            <button
                              onClick={() => confirmOrderMutation.mutate(order.id)}
                              disabled={confirmOrderMutation.isPending}
                              className="px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
                              title="Confirm order"
                            >
                              Confirm
                            </button>
                          )}
                          {canShip && (
                            <Link
                              href={`/dashboard/admin/orders/${order.id}?action=ship`}
                              className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                              title="Ship order"
                            >
                              Ship
                            </Link>
                          )}
                          {canDeliver && (
                            <button
                              onClick={() => deliverOrderMutation.mutate(order.id)}
                              disabled={deliverOrderMutation.isPending}
                              className="px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                              title="Mark as delivered"
                            >
                              Deliver
                            </button>
                          )}
                          <Link
                            href={`/dashboard/admin/orders/${order.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          page={currentPage} 
          totalPages={totalPages} 
          onPageChange={setPage}
          totalElements={totalElements}
          size={size}
        />
      </div>
    </div>
  );
}
