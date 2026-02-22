'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/core/client';
import toast from 'react-hot-toast';

/**
 * Admin Tag Management Hooks
 * 
 * React Query hooks for CRUD operations on product tags in the admin panel.
 */

/**
 * useAdminTags Hook
 * 
 * Fetches all tags for admin management.
 * 
 * @returns React Query result with tags data
 * 
 * @example
 * const { data: tags, isLoading } = useAdminTags();
 */
export function useAdminTags() {
  return useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: () => adminApi.getTags(),
  });
}

/**
 * useCreateTag Hook
 * 
 * Mutation hook for creating a new tag.
 * Invalidates tag queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const createTag = useCreateTag();
 * 
 * const handleSubmit = async (data: { name: string; slug: string }) => {
 *   await createTag.mutateAsync(data);
 * };
 */
export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
      toast.success('Tag created!');
    },
    onError: () => {
      toast.error('Failed to create tag');
    },
  });
}

/**
 * useUpdateTag Hook
 * 
 * Mutation hook for updating an existing tag.
 * Invalidates tag queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const updateTag = useUpdateTag();
 * 
 * const handleUpdate = async (id: number, data: { name: string; slug: string }) => {
 *   await updateTag.mutateAsync({ id, data });
 * };
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; slug: string } }) =>
      adminApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
      toast.success('Tag updated!');
    },
    onError: () => {
      toast.error('Failed to update tag');
    },
  });
}

/**
 * useDeleteTag Hook
 * 
 * Mutation hook for deleting a tag.
 * Invalidates tag queries on success.
 * 
 * @returns React Query mutation result
 * 
 * @example
 * const deleteTag = useDeleteTag();
 * 
 * const handleDelete = async (id: number) => {
 *   if (confirm('Delete this tag?')) {
 *     await deleteTag.mutateAsync(id);
 *   }
 * };
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] });
      toast.success('Tag deleted!');
    },
    onError: () => {
      toast.error('Failed to delete tag');
    },
  });
}
