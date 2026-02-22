'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ShoppingCart,
  Package,
  Target,
  Star,
  Users,
  Eye,
  Download,
  Settings,
  RefreshCw,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface EnhancedAnalytics {
  userId: number;
  totalItems: number;
  itemsAddedThisMonth: number;
  itemsPurchased: number;
  itemsWithPriceDrops: number;
  averagePriceDrop: number;
  totalSavings: number;
  mostAddedCategory: string;
  highestPriorityCategory: string;
  averageDaysInWishlist: number;
  categoryBreakdown: {
    categoryName: string;
    itemCount: number;
    totalValue: number;
    averagePrice: number;
  }[];
  monthlyTrends: {
    month: string;
    itemsAdded: number;
    itemsPurchased: number;
    totalSpent: number;
  }[];
  priceDropHistory: {
    date: string;
    totalSavings: number;
    itemsWithDrops: number;
  }[];
  priorityDistribution: {
    priority: string;
    count: number;
    percentage: number;
  }[];
}

interface Recommendation {
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  recommendationReason: string;
  similarityScore: number;
  matchingTags: string[];
  category: string;
}

interface WishlistAnalyticsProps {
  className?: string;
}

export function WishlistAnalytics({ className = '' }: WishlistAnalyticsProps) {
  const { user, token } = useAuth();
  const { wishlist, getItemsByPriority, getItemsByCollection, optimizeWishlist } = useWishlist();
  
  const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('30d');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'trends' | 'categories' | 'insights'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [user, token, timeRange]);

  const fetchAnalytics = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/wishlist/analytics?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
        await fetchRecommendations();
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`/api/v1/wishlist/recommendations?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data || []);
      }
    } catch (error) {
      console.error('Recommendations fetch error:', error);
    }
  };

  const handleOptimize = async (strategy: string) => {
    if (!user || !token) return;

    try {
      const optimized = await optimizeWishlist({
        optimizationStrategy: strategy as any,
        includeOnlyInStock: true,
        maxBudget: strategy === 'BUDGET' ? 500 : undefined,
      });

      toast.success(`Optimized wishlist to ${optimized.length} items`);
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize wishlist');
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const exportData = {
      generatedAt: new Date().toISOString(),
      analytics: analytics,
      recommendations: recommendations,
      wishlist: wishlist,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wishlist-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics exported successfully');
  };

  // Chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const PRIORITY_COLORS = {
    LOW: '#94a3b8',
    MEDIUM: '#fbbf24',
    HIGH: '#fb923c',
    URGENT: '#f87171',
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
          <p className="text-sm text-gray-600">
            Add items to your wishlist to see analytics
          </p>
        </div>
      </div>
    );
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalItems}</div>
          <div className="text-sm text-blue-900">Total Items</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">${analytics.totalSavings.toFixed(2)}</div>
          <div className="text-sm text-green-900">Total Savings</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{analytics.itemsPurchased}</div>
          <div className="text-sm text-purple-900">Purchased</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{analytics.itemsWithPriceDrops}</div>
          <div className="text-sm text-orange-900">Price Drops</div>
        </div>
      </div>

      {/* Category Breakdown */}
      {analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">By Category</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoryName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <div className="font-medium">{payload[0].payload.categoryName}</div>
                          <div className="text-sm text-gray-600">
                            {payload[0].payload.itemCount} items • ${payload[0].payload.totalValue.toFixed(2)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalValue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Priority Distribution */}
      {analytics.priorityDistribution && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.priorityDistribution}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ priority, percentage }) => `${priority}: ${percentage.toFixed(1)}%`}
                >
                  {analytics.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <span className="font-medium">Most Added Category:</span> {analytics.mostAddedCategory}
          </div>
          <div>
            <span className="font-medium">Average Days in Wishlist:</span> {analytics.averageDaysInWishlist.toFixed(1)}
          </div>
          <div>
            <span className="font-medium">Items Added This Month:</span> {analytics.itemsAddedThisMonth}
          </div>
          <div>
            <span className="font-medium">Average Price Drop:</span> ${analytics.averagePriceDrop.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );

  const RecommendationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">AI Recommendations</h4>
          <p className="text-sm text-gray-600">
            Products you might like based on your wishlist
          </p>
        </div>
        <Button
          onClick={fetchRecommendations}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            No recommendations available yet. Add more items to get personalized suggestions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.productId} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <img
                  src={rec.imageUrl || '/placeholder.png'}
                  alt={rec.productName}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 truncate">
                    {rec.productName}
                  </h5>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {rec.recommendationReason}
                  </p>
                  <div className="flex items-baseline justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      ${rec.price.toFixed(2)}
                    </div>
                    {rec.originalPrice && rec.originalPrice > rec.price && (
                      <div className="text-sm text-green-600">
                        Save ${(rec.originalPrice - rec.price).toFixed(2)}
                      </div>
                    )}
                  </div>
                  {rec.matchingTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {rec.matchingTags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Wishlist Analytics</h3>
              <p className="text-sm text-gray-600">
                Deep insights into your wishlist patterns
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportAnalytics}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 px-6 pt-4 border-b border-gray-200">
        {[
          { value: 'overview', label: 'Overview', icon: BarChart3 },
          { value: 'trends', label: 'Trends', icon: TrendingUp },
          { value: 'categories', label: 'Categories', icon: Package },
          { value: 'insights', label: 'Recommendations', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setViewMode(tab.value as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === tab.value
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'overview' && <OverviewTab />}
        {viewMode === 'insights' && <RecommendationsTab />}
        {viewMode === 'trends' && (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Trends analysis coming soon...</p>
          </div>
        )}
        {viewMode === 'categories' && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Category deep-dive coming soon...</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleOptimize('PRICE')}
              className="flex items-center gap-2 justify-center text-sm"
            >
              <Target className="w-4 h-4" />
              Optimize by Price
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOptimize('PRIORITY')}
              className="flex items-center gap-2 justify-center text-sm"
            >
              <Star className="w-4 h-4" />
              Optimize by Priority
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOptimize('BUDGET')}
              className="flex items-center gap-2 justify-center text-sm"
            >
              <DollarSign className="w-4 h-4" />
              Optimize by Budget ($500)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}