'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

/**
 * Admin User Management Hooks
 * 
 * React Query hooks for managing users in the admin panel.
 */

interface AdminUserParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

/**
 * useAdminUsers Hook
 * 
 * Fetches paginated users for admin management with filtering.
 * 
 * @param params - Query parameters for filtering and pagination
 * @returns React Query result with users data
 * 
 * @example
 * const { data, isLoading } = useAdminUsers({
 *   page: 1,
 *   role: 'customer',
 *   search: 'john'
 * });
 */
export function useAdminUsers(params?: AdminUserParams) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getUsers(params),
  });
}

/**
 * useUpdateUserStatus Hook
 * 
 * Mutation hook for updating a user's account status (active/blocked).
 * Invalidates user queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const updateStatus = useUpdateUserStatus();
 * 
 * const handleBlock = async (id: number) => {
 *   await updateStatus.mutateAsync({ id, status: 'blocked' });
 * };
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'blocked' }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated!');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });
}

/**
 * useUpdateUserRole Hook
 * 
 * Mutation hook for updating a user's role.
 * Invalidates user queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const updateRole = useUpdateUserRole();
 * 
 * const handleRoleChange = async (id: number, role: 'admin') => {
 *   await updateRole.mutateAsync({ id, role });
 * };
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'user' | 'admin' | 'seller' | 'customer' }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User role updated!');
    },
    onError: () => {
      toast.error('Failed to update user role');
    },
  });
}
