"use client";
import React, { useState, useEffect } from 'react';
import { Package, Eye, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useCustomerOrders } from '@/hooks/customer/use-customer-graphql';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  shippingMethod: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: string;
  trackingNumber?: string;
  carrier?: string;
  orderDate: string;
  shippedAt?: string;
  deliveredAt?: string;
  estimatedDeliveryDate?: string;
  items: OrderItem[];
  itemCount: number;
  customerNotes?: string;
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrdersManagementProps {
  onOrderSelect?: (order: Order) => void;
  filterStatus?: string;
}

/**
 * OrdersManagement Component - GraphQL Optimized
 * 
 * Following REST/GraphQL API Strategy:
 * - GraphQL: Used for fetching orders data (useCustomerOrders hook)
 * - REST: Used for commands like cancel order (ordersApi.cancel)
 */
export default function OrdersManagement({ onOrderSelect, filterStatus }: OrdersManagementProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>(filterStatus || 'ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

  const pageSize = 10;

  // GraphQL Hook for fetching orders (following API strategy)
  const { 
    orders, 
    loading, 
    error, 
    totalCount,
    pageInfo,
    refetch 
  } = useCustomerOrders({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
    page: currentPage,
    size: pageSize,
  }, {
    fetchPolicy: 'cache-and-network',
  });

  const statusOptions = [
    { value: 'ALL', label: 'All Orders', color: 'gray' },
    { value: 'PENDING', label: 'Pending', color: 'yellow' },
    { value: 'PROCESSING', label: 'Processing', color: 'blue' },
    { value: 'SHIPPED', label: 'Shipped', color: 'purple' },
    { value: 'DELIVERED', label: 'Delivered', color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: 'text-green-600',
      PENDING: 'text-yellow-600',
      FAILED: 'text-red-600',
      REFUNDED: 'text-blue-600',
    };
    return colors[status] || 'text-gray-600';
  };

  const totalPages = pageInfo?.totalPages || 0;

  useEffect(() => {
    if (filterStatus && filterStatus !== selectedStatus) {
      setSelectedStatus(filterStatus);
      setCurrentPage(0);
    }
  }, [filterStatus]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0);
    setShowFilters(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // REST API for command (following API strategy)
  const handleCancelOrder = async (orderId: number, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderNumber}?`)) return;

    setCancellingOrderId(orderId);
    try {
      await ordersApi.cancel(orderId);
      toast.success('Order cancelled successfully');
      // Refetch orders using GraphQL
      refetch();
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order: Order) => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some((item: OrderItem) => 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading && !orders.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{(error as any)?.message || 'Failed to load orders'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} order{totalCount !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                <span>
                  {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                </span>
              </button>
              
              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        selectedStatus === status.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-200">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search or filters'
                : 'When you place your first order, it will appear here.'
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order: Order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    Placed on {new Date(order.orderDate).toLocaleDateString()} • {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                  </p>
                  
                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Tracking: {order.trackingNumber}</span>
                      {order.carrier && <span>• {order.carrier}</span>}
                    </div>
                  )}
                  
                  {/* Order Items Preview - Improved Design */}
                  <div className="mt-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {order.items.slice(0, 4).map((item, index) => (
                        <div key={item.id || index} className="relative group">
                          <img
                            src={item.productImageUrl || '/placeholder.png'}
                            alt={item.productName}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100 group-hover:border-blue-300 transition-colors"
                          />
                          <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                    {order.items.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        {order.items.map(i => i.productName).slice(0, 2).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOrderSelect?.(order)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                        disabled={cancellingOrderId === order.id}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} orders
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                if (
                  index === 0 ||
                  index === totalPages - 1 ||
                  (index >= currentPage - 1 && index <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`px-3 py-2 rounded-lg ${
                        index === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                } else if (
                  index === currentPage - 2 ||
                  index === currentPage + 2
                ) {
                  return <span key={index} className="px-2">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
