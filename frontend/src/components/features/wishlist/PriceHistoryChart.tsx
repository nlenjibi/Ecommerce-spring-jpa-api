'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  discountPrice?: number;
  percentageChange?: number;
}

interface PriceHistoryChartProps {
  productId: number;
  productName: string;
  targetPrice?: number;
  className?: string;
}

export function PriceHistoryChart({
  productId,
  productName,
  targetPrice,
  className = '',
}: PriceHistoryChartProps) {
  const { user, token } = useAuth();
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showTargetPrice, setShowTargetPrice] = useState(true);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  // Fetch price history
  const fetchPriceHistory = async () => {
    if (!user || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/wishlist/${productId}/price-history?userId=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch price history');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setPriceHistory(data.data);
      } else {
        setPriceHistory([]);
      }
    } catch (err) {
      console.error('Price history fetch error:', err);
      setError('Unable to load price history');
      toast.error('Failed to load price history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceHistory();
  }, [productId, user, token]);

  // Filter data by time range
  const filteredData = useMemo(() => {
    if (!priceHistory.length) return [];

    const now = new Date();
    const ranges = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': Infinity,
    };

    const cutoffDate = new Date(now.getTime() - (ranges[timeRange] * 24 * 60 * 60 * 1000));
    
    return priceHistory
      .filter(point => new Date(point.timestamp) >= cutoffDate)
      .map(point => ({
        ...point,
        date: new Date(point.timestamp).toLocaleDateString(),
        time: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
  }, [priceHistory, timeRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!filteredData.length) return null;

    const prices = filteredData.map(d => d.discountPrice || d.price);
    const currentPrice = prices[prices.length - 1];
    const initialPrice = prices[0];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    const priceChange = currentPrice - initialPrice;
    const priceChangePercent = initialPrice > 0 ? (priceChange / initialPrice) * 100 : 0;

    return {
      currentPrice,
      initialPrice,
      minPrice,
      maxPrice,
      avgPrice,
      priceChange,
      priceChangePercent,
      volatility: maxPrice - minPrice,
    };
  }, [filteredData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {data.date} {data.time}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold">
                ${data.discountPrice || data.price.toFixed(2)}
              </span>
            </div>
            {data.discountPrice && data.price && (
              <div className="text-xs text-green-600">
                Original: ${data.price.toFixed(2)}
              </div>
            )}
            {data.percentageChange && (
              <div className={`text-xs font-medium ${
                data.percentageChange > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {data.percentageChange > 0 ? '+' : ''}{data.percentageChange.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !filteredData.length) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Price History</h3>
          <p className="text-sm text-gray-600">
            {error || 'No price history available for this item'}
          </p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    const chartData = filteredData.map(d => ({
      ...d,
      targetPrice: targetPrice || undefined,
    }));

    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="discountPrice"
              stroke="#3b82f6"
              fill="#93c5fd"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#6b7280"
              fill="#e5e7eb"
              strokeWidth={1}
              strokeDasharray="5 5"
            />
            {targetPrice && showTargetPrice && (
              <Line
                type="monotone"
                dataKey="targetPrice"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="discountPrice" fill="#3b82f6" />
            <Bar dataKey="price" fill="#e5e7eb" />
          </BarChart>
        );
      default:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="discountPrice"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#6b7280"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
            {targetPrice && showTargetPrice && (
              <Line
                type="monotone"
                dataKey="targetPrice"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Price History</h3>
          <p className="text-sm text-gray-600 mt-1">{productName}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="bar">Bar</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPriceHistory}
            disabled={isLoading}
          >
            <Activity className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              ${statistics.currentPrice.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Current</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${statistics.minPrice.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Lowest</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${
              statistics.priceChangePercent > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {statistics.priceChangePercent > 0 ? '+' : ''}
              {statistics.priceChangePercent.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Change</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              ${statistics.volatility.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Volatility</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
        {targetPrice && (
          <button
            onClick={() => setShowTargetPrice(!showTargetPrice)}
            className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              showTargetPrice
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Target className="w-4 h-4" />
            Target Price
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">Current Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span className="text-gray-600">Original Price</span>
        </div>
        {targetPrice && showTargetPrice && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Target Price</span>
          </div>
        )}
      </div>
    </div>
  );
}