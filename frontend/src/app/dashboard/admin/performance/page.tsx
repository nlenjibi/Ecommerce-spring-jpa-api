'use client';

/**
 * Performance Monitoring Dashboard
 * 
 * Following REST/GraphQL API Strategy:
 * - REST is used for performance monitoring endpoints (these are system operations/commands)
 * - Real-time metrics fetching via REST API
 * 
 * Features:
 * - System performance metrics (memory, CPU, cache statistics)
 * - Database performance monitoring
 * - Cache management (clear, warmup)
 * - Visual charts and statistics
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/endpoints/admin.api';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Cpu, 
  Trash2, 
  RefreshCw, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Server,
  Layers,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PerformanceMetrics {
  cache_stats: Record<string, {
    hitCount: number;
    missCount: number;
    hitRate: number;
    size: number;
  }>;
  memory: {
    max_mb: number;
    used_mb: number;
    usage_percent: string;
  };
  available_processors: number;
  query_performance?: string;
  slow_queries?: string;
}

const getMemoryColor = (usage: number): string => {
  if (usage >= 90) return 'text-red-600';
  if (usage >= 75) return 'text-yellow-600';
  return 'text-green-600';
};

const getMemoryBg = (usage: number): string => {
  if (usage >= 90) return 'bg-red-100';
  if (usage >= 75) return 'bg-yellow-100';
  return 'bg-green-100';
};

const MetricCard = memo(({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center gap-3 mb-4">
      {children}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  </div>
));

MetricCard.displayName = 'MetricCard';

export default function PerformanceMonitoringPage() {
  const [selectedCache, setSelectedCache] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const queryClient = useQueryClient();

  // Fetch performance metrics
  const { 
    data: metricsData, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useQuery({
    queryKey: ['admin', 'performance', 'metrics'],
    queryFn: () => adminApi.performance.getMetrics(),
    refetchInterval: autoRefresh ? 5000 : false,
    staleTime: 3000,
  });

  // Fetch database metrics
  const { 
    data: dbMetricsData, 
    isLoading: dbLoading,
    refetch: refetchDbMetrics 
  } = useQuery({
    queryKey: ['admin', 'performance', 'database'],
    queryFn: () => adminApi.performance.getDatabaseMetrics(),
    refetchInterval: autoRefresh ? 10000 : false,
    staleTime: 5000,
  });

  const metrics: PerformanceMetrics | null = useMemo(() => 
    metricsData?.data || null, [metricsData]
  );
  
  const dbMetrics = useMemo(() => 
    dbMetricsData?.data || null, [dbMetricsData]
  );

  const cacheNames = useMemo(() => 
    metrics?.cache_stats ? Object.keys(metrics.cache_stats) : [], 
    [metrics?.cache_stats]
  );

  const memoryUsage = useMemo(() => 
    metrics?.memory ? parseFloat(metrics.memory.usage_percent) : 0,
    [metrics?.memory]
  );

  // Clear all caches mutation
  const clearAllCachesMutation = useMutation({
    mutationFn: () => adminApi.performance.clearAllCaches(),
    onSuccess: () => {
      toast.success('All caches cleared successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'performance'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear caches');
    },
  });

  // Clear specific cache mutation
  const clearCacheMutation = useMutation({
    mutationFn: (cacheName: string) => adminApi.performance.clearCache(cacheName),
    onSuccess: () => {
      toast.success(`Cache cleared successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'performance'] });
      setSelectedCache('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear cache');
    },
  });

  // Warmup caches mutation
  const warmupCachesMutation = useMutation({
    mutationFn: () => adminApi.performance.warmupCaches(),
    onSuccess: () => {
      toast.success('Cache warmup initiated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to warmup caches');
    },
  });

  const handleClearAllCaches = useCallback(() => {
    if (confirm('Are you sure you want to clear all caches? This may impact performance temporarily.')) {
      clearAllCachesMutation.mutate();
    }
  }, [clearAllCachesMutation]);

  const handleClearCache = useCallback(() => {
    if (!selectedCache) {
      toast.error('Please select a cache to clear');
      return;
    }
    if (confirm(`Are you sure you want to clear the "${selectedCache}" cache?`)) {
      clearCacheMutation.mutate(selectedCache);
    }
  }, [selectedCache, clearCacheMutation]);

  const handleWarmupCaches = useCallback(() => {
    warmupCachesMutation.mutate();
  }, [warmupCachesMutation]);

  const handleRefresh = useCallback(() => {
    refetchMetrics();
    refetchDbMetrics();
    toast.success('Metrics refreshed');
  }, [refetchMetrics, refetchDbMetrics]);

  if (metricsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Error Loading Performance Metrics</h2>
          </div>
          <p className="text-red-600 mb-4">
            {(metricsError as any)?.message || 'Failed to load performance metrics'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600">Monitor system performance, cache statistics, and database metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            Auto-refresh
          </label>
          <button
            onClick={handleRefresh}
            disabled={metricsLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Memory Usage Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <HardDrive className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Memory Usage</h2>
            <p className="text-sm text-gray-500">JVM Heap Memory</p>
          </div>
        </div>
        
        {metricsLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ) : metrics?.memory ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Max Memory</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.memory.max_mb} MB</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Used Memory</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.memory.used_mb} MB</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${getMemoryBg(parseFloat(metrics.memory.usage_percent))}`}>
                <p className="text-sm text-gray-500">Usage</p>
                <p className={`text-2xl font-bold ${getMemoryColor(parseFloat(metrics.memory.usage_percent))}`}>
                  {metrics.memory.usage_percent}%
                </p>
              </div>
            </div>
            
            {/* Memory Progress Bar */}
            <div className="relative pt-2">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${metrics.memory.usage_percent}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                    parseFloat(metrics.memory.usage_percent) >= 90 ? 'bg-red-500' :
                    parseFloat(metrics.memory.usage_percent) >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                />
              </div>
            </div>
            
            {parseFloat(metrics.memory.usage_percent) >= 90 && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>High memory usage detected! Consider restarting the application.</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No memory metrics available</p>
        )}
      </div>

      {/* CPU & System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">CPU Information</h2>
              <p className="text-sm text-gray-500">Available Processors</p>
            </div>
          </div>
          
          {metricsLoading ? (
            <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
          ) : metrics?.available_processors ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-gray-900">
                {metrics.available_processors}
              </span>
              <span className="text-gray-500">processors available</span>
            </div>
          ) : (
            <p className="text-gray-500">No CPU information available</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Server Status</h2>
              <p className="text-sm text-gray-500">Application Health</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-600 font-medium">Running</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            All systems operational
          </p>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Layers className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cache Statistics</h2>
              <p className="text-sm text-gray-500">Application cache performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWarmupCaches}
              disabled={warmupCachesMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {warmupCachesMutation.isPending ? 'Warming...' : 'Warmup'}
            </button>
            <button
              onClick={handleClearAllCaches}
              disabled={clearAllCachesMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {clearAllCachesMutation.isPending ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </div>

        {/* Clear Specific Cache */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clear Specific Cache
          </label>
          <div className="flex gap-2">
            <select
              value={selectedCache}
              onChange={(e) => setSelectedCache(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a cache...</option>
              {metrics?.cache_stats && Object.keys(metrics.cache_stats).map((cacheName) => (
                <option key={cacheName} value={cacheName}>{cacheName}</option>
              ))}
            </select>
            <button
              onClick={handleClearCache}
              disabled={!selectedCache || clearCacheMutation.isPending}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {clearCacheMutation.isPending ? 'Clearing...' : 'Clear'}
            </button>
          </div>
        </div>

        {/* Cache Stats Table */}
        {metricsLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : metrics?.cache_stats && Object.keys(metrics.cache_stats).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">Cache Name</th>
                  <th className="pb-3 font-medium text-right">Hits</th>
                  <th className="pb-3 font-medium text-right">Misses</th>
                  <th className="pb-3 font-medium text-right">Hit Rate</th>
                  <th className="pb-3 font-medium text-right">Size</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.cache_stats).map(([name, stats]) => (
                  <tr key={name} className="border-b last:border-0">
                    <td className="py-3 font-medium text-gray-900">{name}</td>
                    <td className="py-3 text-right text-green-600">{stats.hitCount?.toLocaleString() || 0}</td>
                    <td className="py-3 text-right text-orange-600">{stats.missCount?.toLocaleString() || 0}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (stats.hitRate || 0) >= 80 ? 'bg-green-100 text-green-700' :
                        (stats.hitRate || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {stats.hitRate?.toFixed(2) || 0}%
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-600">{stats.size?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No cache statistics available</p>
        )}
      </div>

      {/* Database Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Database className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Database Performance</h2>
            <p className="text-sm text-gray-500">Query performance and monitoring</p>
          </div>
        </div>

        {dbLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : dbMetrics ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Query Performance</span>
              </div>
              <p className="text-blue-700 text-sm">
                {dbMetrics.query_performance || 'Track query execution times in service layer'}
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">Slow Queries</span>
              </div>
              <p className="text-yellow-700 text-sm">
                {dbMetrics.slow_queries || 'Monitor queries taking > 1s'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> {dbMetrics.note || 'Database metrics would require connection pool monitoring (HikariCP)'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No database metrics available</p>
        )}
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Performance Optimization Tips</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
            <span>Clear caches when deploying new code to ensure fresh data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
            <span>Use cache warmup after clearing to pre-load frequently accessed data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
            <span>Monitor memory usage - restart application if consistently above 90%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
            <span>Cache hit rate below 50% may indicate cache configuration issues</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
