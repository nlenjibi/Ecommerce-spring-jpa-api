'use client';

/**
 * Admin Dashboard - GraphQL Implementation
 * 
 * Following REST/GraphQL API Strategy:
 * - GraphQL is used for ALL data fetching (queries)
 * - REST is used for commands (mutations)
 * 
 * This page demonstrates the proper implementation where:
 * - Dashboard stats are fetched via GraphQL
 * - Recent orders are fetched via GraphQL
 * - Any mutations would use REST (if needed)
 */

import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ORDER_STATUS_COLORS } from '@/lib/constants/constants';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdminDashboardStats } from '@/hooks/admin/use-admin-graphql';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/utils/api-error';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  const canQueryDashboard = !authLoading && isAuthenticated && isAdmin;

  // Use GraphQL for fetching dashboard stats (per the strategy)
  const { stats, loading, error, refetch } = useAdminDashboardStats({
    fetchPolicy: 'network-only',
    skip: !canQueryDashboard,
  });

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

  // Show error if GraphQL fails
  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard data'));
    }
  }, [error]);

  // Calculate change percentages (placeholder - would come from backend)
  const statCards = [
    { 
      label: 'Total Revenue', 
      value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '$0', 
      change: 12.5,
      icon: DollarSign,
      color: 'bg-green-500' 
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders?.toLocaleString() || '0', 
      change: 8.2,
      icon: ShoppingCart,
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total Products', 
      value: stats?.totalProducts?.toLocaleString() || '0', 
      change: -2.4,
      icon: Package,
      color: 'bg-purple-500' 
    },
    { 
      label: 'Total Users', 
      value: stats?.totalUsers?.toLocaleString() || '0', 
      change: 5.3,
      icon: Users,
      color: 'bg-orange-500' 
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!canQueryDashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || 'Admin'}!</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm">{getApiErrorMessage(error, 'An unexpected error occurred')}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {card.change >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">{card.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">{card.change}%</span>
                </>
              )}
              <span className="text-gray-400 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/admin/products"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Manage Products</h3>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove products</p>
        </Link>
        <Link
          href="/dashboard/admin/orders"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">View Orders</h3>
          <p className="text-sm text-gray-500 mt-1">{stats?.pendingOrders || 0} pending orders</p>
        </Link>
        <Link
          href="/dashboard/admin/users"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Manage Users</h3>
          <p className="text-sm text-gray-500 mt-1">{stats?.totalUsers || 0} total users</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="space-y-4">
            {stats.recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customerName || 'Guest'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${order.total?.toFixed(2) || '0.00'}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status || 'PENDING'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recent orders</p>
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800">Low Stock Alert</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.lowStockCount} products are running low on stock. 
                <Link href="/dashboard/admin/products?filter=low_stock" className="underline ml-1">
                  View products
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
