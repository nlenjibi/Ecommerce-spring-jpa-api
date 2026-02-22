'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { SkeletonChart, SkeletonTable } from '@/components/skeletons';
import { useOrderStatistics } from '@/hooks/admin/use-admin-graphql';
import { getApiErrorMessage } from '@/lib/utils/api-error';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const daysMap = { week: 7, month: 30, year: 365 };
  
  const { statistics, loading: isLoading, error } = useOrderStatistics({
    fetchPolicy: 'cache-and-network',
  });

  const graphDailyOrders = Array.isArray(statistics?.dailyOrders)
    ? statistics.dailyOrders.slice(-daysMap[dateRange])
    : [];

  // Transform API data or use fallback data for demonstration
  const revenueData = graphDailyOrders.length > 0 ? graphDailyOrders.map((r: any) => ({
    name: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: r.revenue || 0,
  })) : [
    { name: 'Mon', revenue: 1200 },
    { name: 'Tue', revenue: 1900 },
    { name: 'Wed', revenue: 1500 },
    { name: 'Thu', revenue: 2100 },
    { name: 'Fri', revenue: 2800 },
    { name: 'Sat', revenue: 3200 },
    { name: 'Sun', revenue: 2400 },
  ];

  const ordersData = graphDailyOrders.length > 0 ? graphDailyOrders.map((o: any) => ({
    name: new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: o.count,
  })) : [
    { name: 'Jan', orders: 24 },
    { name: 'Feb', orders: 18 },
    { name: 'Mar', orders: 30 },
    { name: 'Apr', orders: 27 },
    { name: 'May', orders: 36 },
    { name: 'Jun', orders: 33 },
    { name: 'Jul', orders: 42 },
  ];

  // Combine revenue and orders data for sales chart
  const salesData = revenueData.map((r, i) => ({
    name: r.name,
    sales: r.revenue,
    orders: ordersData[i]?.orders || 0,
  }));

  const categoryData = [
    { name: 'Electronics', value: 35000 },
    { name: 'Clothing', value: 25000 },
    { name: 'Home & Garden', value: 20000 },
    { name: 'Sports', value: 12000 },
    { name: 'Other', value: 8000 },
  ];

  const topProducts = [
    { name: 'Wireless Headphones', sales: 234, revenue: 23400 },
    { name: 'Smart Watch Pro', sales: 189, revenue: 28350 },
    { name: 'Mechanical Keyboard', sales: 156, revenue: 15600 },
    { name: 'Gaming Mouse', sales: 134, revenue: 6700 },
    { name: 'USB-C Hub', sales: 121, revenue: 4840 },
  ];

  // Calculate totals for stats
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
  const totalOrders = ordersData.reduce((sum, o) => sum + o.orders, 0);
  const newCustomers = 567;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: 12.5, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), change: 8.2, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'New Customers', value: newCustomers.toString(), change: 15.3, icon: Users, color: 'bg-purple-500' },
    { label: 'Conversion Rate', value: '3.2%', change: -2.1, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your store performance and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <SkeletonChart height={300} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <SkeletonChart height={300} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <SkeletonTable rows={5} columns={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your store performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 text-sm font-medium capitalize ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {getApiErrorMessage(error, 'Failed to load analytics')}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {isPositive ? (
                  <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{stat.change}%
                </span>
                <span className="text-gray-500 text-sm ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {topProducts.map((product: any, index: number) => (
              <div key={product.name} className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders vs Sales Comparison */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Orders vs Sales Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" name="Sales ($)" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
