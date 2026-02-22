"use client";
import React, { useEffect, useState } from 'react';
import { Package, Truck, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import { sellerApi } from '@/lib/api';
import { LoadingState, ErrorState } from '@/components/features/customer-dashboard/LoadingStates';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  monthOrders: number;
  orderTrend: 'up' | 'down';
  earningsChange: string;
}

export default function SellerOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellerApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={fetchDashboardStats}
        className="col-span-full"
      />
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      subtitle: 'All time',
      icon: Package,
      color: 'bg-blue-500',
      trend: stats?.orderTrend,
      trendValue: '+12%',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      subtitle: 'Seller\'s products only',
      icon: Truck,
      color: 'bg-green-500',
      trend: 'up',
      trendValue: '+8%',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      subtitle: 'Awaiting processing',
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      trend: 'down',
      trendValue: '-2%',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || '0'}`,
      subtitle: 'Seller earnings only',
      icon: DollarSign,
      color: 'bg-purple-500',
      trend: 'up',
      trendValue: '+15%',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockProducts || 0,
      subtitle: 'Products need restocking',
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend: 'up',
      trendValue: '+3',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      alert: true
    },
    {
      title: 'Month Orders',
      value: stats?.monthOrders || 0,
      subtitle: 'This month',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      trend: stats?.orderTrend,
      trendValue: stats?.earningsChange || '0%',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Your seller performance at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div 
              key={card.title} 
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative ${
                card.alert ? 'border-red-200' : ''
              }`}
            >
              {/* Alert Badge */}
              {card.alert && typeof card.value === 'number' && card.value > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${card.color} bg-opacity-10 rounded-lg`}>
                  <Icon 
                    size={20} 
                    className={`text-${card.color.replace('bg-', '')}`} 
                  />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  card.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon size={14} />
                  <span className="font-medium">{card.trendValue}</span>
                </div>
              </div>
              
              <div>
                <h3 className={`text-2xl font-bold ${
                  card.alert && typeof card.value === 'number' && card.value > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {card.value}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{card.subtitle}</p>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      card.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: card.trend === 'up' 
                        ? `${Math.min(100, (parseInt(card.trendValue.replace(/[^0-9]/g, '')) * 5))}%` 
                        : '20%' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex gap-2">
                {card.title === 'Total Products' && typeof card.value === 'number' && card.value > 0 && (
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Add Product
                  </button>
                )}
                {card.title === 'Pending Orders' && typeof card.value === 'number' && card.value > 0 && (
                  <button className="flex-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors">
                    Process Orders
                  </button>
                )}
                {card.title === 'Low Stock Alerts' && typeof card.value === 'number' && card.value > 0 && (
                  <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    Restock Items
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{1000 + i}</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">$89.99</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {['Blue T-Shirt', 'Red Jeans', 'Black Shoes'].map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product}</p>
                  <p className="text-sm text-gray-600">32 sold this week</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">+$234.56</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}