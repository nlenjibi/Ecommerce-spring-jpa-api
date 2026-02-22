/**
 * Product Command Hooks (REST)
 * 
 * These hooks handle product mutations and commands via REST API.
 * 
 * API STRATEGY COMPLIANCE:
 * - REST is used for ALL commands/mutations (create, update, delete, stock operations)
 * - GraphQL is used for data fetching (queries)
 * 
 * All product creation, updates, deletions, and stock management
 * should use these hooks, NOT GraphQL mutations.
 */

'use client';

import { useState, useCallback } from 'react';
import { productsApi, ProductCreateRequest, ProductUpdateRequest } from '@/lib/api/endpoints/products.api';
import { handleApiError } from '@/lib/utils/error';

// ==================== Create Product Hook ====================

interface UseCreateProductOptions {
  onSuccess?: (product: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for creating a new product
 * 
 * @example
 * const { createProduct, loading, error } = useCreateProduct({
 *   onSuccess: (product) => {
 *     console.log('Product created:', product);
 *     router.push(`/products/${product.id}`);
 *   }
 * });
 * 
 * // Usage
 * await createProduct({
 *   name: 'New Product',
 *   slug: 'new-product',
 *   price: 99.99,
 *   categoryId: 1
 * });
 */
export const useCreateProduct = (options: UseCreateProductOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const createProduct = useCallback(async (data: ProductCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.create(data);
      const product = response.data;
      
      options.onSuccess?.(product);
      return product;
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    createProduct,
    loading,
    error,
  };
};

// ==================== Update Product Hook ====================

interface UseUpdateProductOptions {
  onSuccess?: (product: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for updating an existing product
 * 
 * @example
 * const { updateProduct, loading, error } = useUpdateProduct({
 *   onSuccess: (product) => {
 *     console.log('Product updated:', product);
 *   }
 * });
 * 
 * // Usage
 * await updateProduct(123, {
 *   name: 'Updated Product Name',
 *   price: 149.99
 * });
 */
export const useUpdateProduct = (options: UseUpdateProductOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const updateProduct = useCallback(async (id: number, data: ProductUpdateRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.update(id, data);
      const product = response.data;
      
      options.onSuccess?.(product);
      return product;
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    updateProduct,
    loading,
    error,
  };
};

// ==================== Patch Product Hook ====================

interface UsePatchProductOptions {
  onSuccess?: (product: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for partially updating a product
 * 
 * @example
 * const { patchProduct, loading, error } = usePatchProduct();
 * 
 * // Usage - only update specific fields
 * await patchProduct(123, {
 *   stockQuantity: 50
 * });
 */
export const usePatchProduct = (options: UsePatchProductOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const patchProduct = useCallback(async (id: number, data: Partial<ProductUpdateRequest>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.patch(id, data);
      const product = response.data;
      
      options.onSuccess?.(product);
      return product;
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    patchProduct,
    loading,
    error,
  };
};

// ==================== Delete Product Hook ====================

interface UseDeleteProductOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for deleting a product
 * 
 * @example
 * const { deleteProduct, loading, error } = useDeleteProduct({
 *   onSuccess: () => {
 *     console.log('Product deleted');
 *     router.push('/products');
 *   }
 * });
 * 
 * // Usage
 * await deleteProduct(123);
 */
export const useDeleteProduct = (options: UseDeleteProductOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const deleteProduct = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await productsApi.delete(id);
      
      options.onSuccess?.();
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    deleteProduct,
    loading,
    error,
  };
};

// ==================== Bulk Operations Hooks ====================

interface UseBulkDeleteProductsOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for bulk deleting products
 * 
 * @example
 * const { bulkDeleteProducts, loading, error } = useBulkDeleteProducts();
 * 
 * // Usage
 * await bulkDeleteProducts([1, 2, 3, 4, 5]);
 */
export const useBulkDeleteProducts = (options: UseBulkDeleteProductsOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const bulkDeleteProducts = useCallback(async (productIds: number[]) => {
    setLoading(true);
    setError(null);

    try {
      await productsApi.bulkDelete(productIds);
      
      options.onSuccess?.();
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    bulkDeleteProducts,
    loading,
    error,
  };
};

interface UseBulkUpdateFeaturedOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for bulk updating featured status
 * 
 * @example
 * const { bulkUpdateFeatured, loading, error } = useBulkUpdateFeatured();
 * 
 * // Usage - mark products as featured
 * await bulkUpdateFeatured([1, 2, 3], true);
 * 
 * // Usage - unmark products as featured
 * await bulkUpdateFeatured([1, 2, 3], false);
 */
export const useBulkUpdateFeatured = (options: UseBulkUpdateFeaturedOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const bulkUpdateFeatured = useCallback(async (productIds: number[], featured: boolean) => {
    setLoading(true);
    setError(null);

    try {
      await productsApi.bulkUpdateFeatured(productIds, featured);
      
      options.onSuccess?.();
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    bulkUpdateFeatured,
    loading,
    error,
  };
};

// ==================== Stock Management Hooks ====================

interface UseStockOperationOptions {
  onSuccess?: (product: any) => void;
  onError?: (error: any) => void;
}

/**
 * Hook for reducing product stock
 * 
 * @example
 * const { reduceStock, loading, error } = useReduceStock();
 * 
 * // Usage - reduce stock by 5 units
 * await reduceStock(123, 5);
 */
export const useReduceStock = (options: UseStockOperationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const reduceStock = useCallback(async (id: number, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.reduceStock(id, quantity);
      const product = response.data;
      
      options.onSuccess?.(product);
      return product;
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    reduceStock,
    loading,
    error,
  };
};

/**
 * Hook for restoring product stock
 * 
 * @example
 * const { restoreStock, loading, error } = useRestoreStock();
 * 
 * // Usage - restore stock by 10 units
 * await restoreStock(123, 10);
 */
export const useRestoreStock = (options: UseStockOperationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const restoreStock = useCallback(async (id: number, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      await productsApi.restoreStock(id, quantity);
      
      options.onSuccess?.(null);
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    restoreStock,
    loading,
    error,
  };
};

/**
 * Hook for adding stock to a product
 * 
 * @example
 * const { addStock, loading, error } = useAddStock();
 * 
 * // Usage - add 20 units to stock
 * await addStock(123, 20);
 */
export const useAddStock = (options: UseStockOperationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const addStock = useCallback(async (id: number, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.addStock(id, quantity);
      const product = response.data;
      
      options.onSuccess?.(product);
      return product;
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    addStock,
    loading,
    error,
  };
};

/**
 * Hook for reserving product stock
 * 
 * @example
 * const { reserveStock, loading, error } = useReserveStock();
 * 
 * // Usage - reserve 3 units
 * await reserveStock(123, 3);
 */
export const useReserveStock = (options: UseStockOperationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const reserveStock = useCallback(async (id: number, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.reserveStock(id, quantity);
      const product = response.data;
      
      options.onSuccess?.(product);
      return product;
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    reserveStock,
    loading,
    error,
  };
};

/**
 * Hook for releasing reserved stock
 * 
 * @example
 * const { releaseReservedStock, loading, error } = useReleaseReservedStock();
 * 
 * // Usage - release 3 reserved units
 * await releaseReservedStock(123, 3);
 */
export const useReleaseReservedStock = (options: UseStockOperationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const releaseReservedStock = useCallback(async (id: number, quantity: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.releaseReservedStock(id, quantity);
      const product = response.data;
      
      options.onSuccess?.(product);
      return product;
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    releaseReservedStock,
    loading,
    error,
  };
};

// ==================== Combined Stock Management Hook ====================

interface UseStockManagementOptions {
  onSuccess?: (operation: string, product?: any) => void;
  onError?: (error: any, operation: string) => void;
}

/**
 * Combined hook for all stock management operations
 * 
 * @example
 * const stock = useStockManagement();
 * 
 * // Reduce stock
 * await stock.reduce(123, 5);
 * 
 * // Add stock
 * await stock.add(123, 10);
 * 
 * // Reserve stock
 * await stock.reserve(123, 3);
 * 
 * // Release reserved stock
 * await stock.release(123, 3);
 */
export const useStockManagement = (options: UseStockManagementOptions = {}) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, any>>({});

  const executeOperation = async (
    operation: string,
    apiCall: () => Promise<any>
  ) => {
    setLoading(prev => ({ ...prev, [operation]: true }));
    setError(prev => ({ ...prev, [operation]: null }));

    try {
      const result = await apiCall();
      options.onSuccess?.(operation, result);
      return result;
    } catch (err) {
      const handledError = handleApiError(err);
      setError(prev => ({ ...prev, [operation]: handledError }));
      options.onError?.(handledError, operation);
      throw handledError;
    } finally {
      setLoading(prev => ({ ...prev, [operation]: false }));
    }
  };

  return {
    reduce: (id: number, quantity: number) =>
      executeOperation('reduce', () => productsApi.reduceStock(id, quantity).then(r => r.data)),
    add: (id: number, quantity: number) =>
      executeOperation('add', () => productsApi.addStock(id, quantity).then(r => r.data)),
    restore: (id: number, quantity: number) =>
      executeOperation('restore', () => productsApi.restoreStock(id, quantity)),
    reserve: (id: number, quantity: number) =>
      executeOperation('reserve', () => productsApi.reserveStock(id, quantity).then(r => r.data)),
    release: (id: number, quantity: number) =>
      executeOperation('release', () => productsApi.releaseReservedStock(id, quantity).then(r => r.data)),
    loading,
    error,
  };
};

// ==================== Image Management Hooks ====================

interface UseProductImageOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook for adding product images
 * 
 * @example
 * const { addImage, loading, error } = useAddProductImage();
 * 
 * // Usage
 * await addImage(123, {
 *   url: 'https://example.com/image.jpg',
 *   altText: 'Product image',
 *   isPrimary: true
 * });
 */
export const useAddProductImage = (options: UseProductImageOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const addImage = useCallback(async (productId: number, data: any) => {
    setLoading(true);
    setError(null);

    try {
      await productsApi.addImage(productId, data);
      options.onSuccess?.();
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    addImage,
    loading,
    error,
  };
};

/**
 * Hook for deleting product images
 * 
 * @example
 * const { deleteImage, loading, error } = useDeleteProductImage();
 * 
 * // Usage
 * await deleteImage(123, 456); // productId, imageId
 */
export const useDeleteProductImage = (options: UseProductImageOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const deleteImage = useCallback(async (productId: number, imageId: number) => {
    setLoading(true);
    setError(null);

    try {
      await productsApi.deleteImage(productId, imageId);
      options.onSuccess?.();
    } catch (err) {
      const error = handleApiError(err);
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    deleteImage,
    loading,
    error,
  };
};

// Export all hooks as default
export default {
  useCreateProduct,
  useUpdateProduct,
  usePatchProduct,
  useDeleteProduct,
  useBulkDeleteProducts,
  useBulkUpdateFeatured,
  useReduceStock,
  useRestoreStock,
  useAddStock,
  useReserveStock,
  useReleaseReservedStock,
  useStockManagement,
  useAddProductImage,
  useDeleteProductImage,
};
