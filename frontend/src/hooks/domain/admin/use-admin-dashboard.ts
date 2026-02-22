'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/core/client';

/**
 * Admin Dashboard Hooks
 * 
 * React Query hooks for fetching admin dashboard analytics and statistics.
 */

interface DashboardParams {
  startDate?: string;
  endDate?: string;
}

interface AnalyticsParams {
  startDate: string;
  endDate: string;
  granularity?: 'day' | 'week' | 'month';
}

/**
 * useAdminDashboard Hook
 * 
 * Fetches dashboard statistics and metrics for the admin panel.
 * 
 * @param params - Optional date range for filtering statistics
 * @returns React Query result with dashboard stats
 * 
 * @example
 * const { data: stats } = useAdminDashboard({
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31'
 * });
 */
export function useAdminDashboard(params?: DashboardParams) {
  return useQuery({
    queryKey: ['admin', 'dashboard', params],
    queryFn: () => adminApi.getDashboardStats(params),
  });
}

/**
 * useAdminAnalytics Hook
 * 
 * Fetches detailed analytics data with time-series granularity.
 * 
 * @param params - Date range and granularity parameters
 * @returns React Query result with analytics data
 * 
 * @example
 * const { data: analytics } = useAdminAnalytics({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   granularity: 'day'
 * });
 */
export function useAdminAnalytics(params: AnalyticsParams) {
  return useQuery({
    queryKey: ['admin', 'analytics', params],
    queryFn: () => adminApi.getAnalytics(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}
