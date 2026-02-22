/**
 * Low-level HTTP utilities for API calls
 */

import { apiClient } from './client';

/**
 * Generic HTTP GET request
 */
export const httpGet = async <T>(url: string, params?: Record<string, any>): Promise<T> => {
  const response = await apiClient.get(url, { params });
  return response.data;
};

/**
 * Generic HTTP POST request
 */
export const httpPost = async <T>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.post(url, data);
  return response.data;
};

/**
 * Generic HTTP PUT request
 */
export const httpPut = async <T>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.put(url, data);
  return response.data;
};

/**
 * Generic HTTP PATCH request
 */
export const httpPatch = async <T>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.patch(url, data);
  return response.data;
};

/**
 * Generic HTTP DELETE request
 */
export const httpDelete = async <T>(url: string): Promise<T> => {
  const response = await apiClient.delete(url);
  return response.data;
};

/**
 * Upload file with progress tracking
 */
export const httpUpload = async <T>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<T> => {
  const response = await apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  return response.data;
};

/**
 * Download file with progress tracking
 */
export const httpDownload = async (
  url: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const response = await apiClient.get(url, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  return response.data;
};

/**
 * Cancelable request
 */
export const createCancelableRequest = () => {
  const controller = new AbortController();

  return {
    request: <T>(config: any): Promise<T> => {
      return apiClient.request({
        ...config,
        signal: controller.signal,
      }).then(response => response.data);
    },
    cancel: (reason?: string) => {
      controller.abort(reason);
    },
    isCanceled: () => controller.signal.aborted,
  };
};

/**
 * Batch multiple requests
 */
export const httpBatch = async <T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> => {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const request of requests) {
    const promise = request().then(result => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
};

/**
 * Retry request with exponential backoff
 */
export const httpRetry = async <T>(
  request: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

/**
 * Timeout wrapper for requests
 */
export const httpWithTimeout = async <T>(
  request: () => Promise<T>,
  timeout: number = 10000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout);
  });

  return Promise.race([request(), timeoutPromise]);
};

export default {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  patch: httpPatch,
  delete: httpDelete,
  upload: httpUpload,
  download: httpDownload,
  batch: httpBatch,
  retry: httpRetry,
  withTimeout: httpWithTimeout,
  createCancelableRequest,
};
