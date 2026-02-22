'use client';

import { 
  useMutation as useReactMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient
} from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * API Mutation Hook
 * 
 * Enhanced wrapper around React Query's useMutation with automatic
 * success/error handling, cache invalidation, and optimistic updates.
 */

interface MutationConfig<TData, TError, TVariables> 
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  /** Success toast message */
  successMessage?: string;
  /** Error toast message */
  errorMessage?: string;
  /** Query keys to invalidate on success */
  invalidateQueries?: readonly unknown[][];
  /** Show toast notifications (default: true) */
  showToast?: boolean;
}

/**
 * useMutation Hook
 * 
 * Custom mutation hook with automatic cache invalidation and toast notifications.
 * 
 * @param mutationFn - Async function that performs the mutation
 * @param config - Configuration including messages and cache invalidation
 * @returns React Query mutation result
 * 
 * @example
 * const createUser = useMutation(
 *   (data) => api.createUser(data),
 *   {
 *     successMessage: 'User created!',
 *     errorMessage: 'Failed to create user',
 *     invalidateQueries: [['users']]
 *   }
 * );
 * 
 * createUser.mutate({ name: 'John' });
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config?: MutationConfig<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  const queryClient = useQueryClient();
  const {
    successMessage,
    errorMessage,
    invalidateQueries = [],
    showToast = true,
    onSuccess,
    onError,
    ...restConfig
  } = config || {};

  return useReactMutation<TData, TError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Show success toast
      if (showToast && successMessage) {
        toast.success(successMessage);
      }

      // Call user-provided onSuccess
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Show error toast
      if (showToast && errorMessage) {
        toast.error(errorMessage);
      }

      // Call user-provided onError
      onError?.(error, variables, context);
    },
    ...restConfig,
  });
}

/**
 * useOptimisticMutation Hook
 * 
 * Mutation hook with optimistic UI updates for instant feedback.
 * 
 * @param mutationFn - Async function that performs the mutation
 * @param queryKey - Query key to optimistically update
 * @param updateFn - Function to optimistically update cached data
 * @param config - Additional configuration
 * @returns React Query mutation result
 * 
 * @example
 * const toggleTodo = useOptimisticMutation(
 *   (id) => api.toggleTodo(id),
 *   ['todos'],
 *   (oldData, id) => oldData.map(todo => 
 *     todo.id === id ? { ...todo, completed: !todo.completed } : todo
 *   )
 * );
 */
export function useOptimisticMutation<TData = unknown, TError = Error, TVariables = void, TCachedData = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: readonly unknown[],
  updateFn: (oldData: TCachedData, variables: TVariables) => TCachedData,
  config?: MutationConfig<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>(mutationFn, {
    ...config,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TCachedData>(queryKey);

      // Optimistically update cache
      if (previousData) {
        queryClient.setQueryData<TCachedData>(queryKey, updateFn(previousData, variables));
      }

      // Call user-provided onMutate
      await config?.onMutate?.(variables);

      // Return context with snapshot
      return { previousData };
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      config?.onError?.(error, variables, context);
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * useBulkMutation Hook
 * 
 * Execute multiple mutations in sequence or parallel.
 * 
 * @param mutationFn - Function that accepts an array of items
 * @param config - Mutation configuration
 * @returns Mutation result
 * 
 * @example
 * const bulkDelete = useBulkMutation(
 *   (ids) => Promise.all(ids.map(id => api.delete(id))),
 *   { successMessage: 'Items deleted' }
 * );
 * 
 * bulkDelete.mutate([1, 2, 3]);
 */
export function useBulkMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables[]) => Promise<TData>,
  config?: MutationConfig<TData, TError, TVariables[]>
): UseMutationResult<TData, TError, TVariables[]> {
  return useMutation<TData, TError, TVariables[]>(mutationFn, config);
}
