/**
 * Request/Response Interceptors for API Client
 */

import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { trackingService } from '@/lib/services/tracking';
import { getApiErrorMessage } from '@/lib/utils/api-error';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  suppressErrorLog?: boolean;
}

const isAuthRouteRequest = (url: string): boolean => {
  const u = url.toLowerCase();
  return (
    u.includes('/auth/login') ||
    u.includes('/auth/register') ||
    u.includes('/auth/refresh') ||
    u.includes('/v1/users/auth/')
  );
};

const isPublicBootstrapRequest = (url: string): boolean => {
  const u = url.toLowerCase();
  // Check for common public prefixes with and without /v1
  const publicPrefixes = [
    '/v1/help/', '/help/',
    '/v1/social-links', '/social-links',
    '/v1/app-download-links', '/app-download-links',
    '/v1/products', '/products',
    '/v1/categories', '/categories',
    '/v1/reviews', '/reviews'
  ];
  return publicPrefixes.some(prefix => u.includes(prefix));
};

/**
 * Request interceptor - add auth tokens and common headers
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  let token: string | null = null;
  try {
    // lazy-require to avoid circular import at module-evaluation time
    // auth.api imports the request/client which imports this file; requiring here breaks the cycle
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const au = require('@/lib/api/endpoints/auth.api').authUtils;
    token = au?.getToken?.() ?? null;
  } catch (e) {
    token = null;
  }
  if (token && !config.headers['Authorization']) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toLowerCase();
  const hasBody = method === 'post' || method === 'put' || method === 'patch';
  if (hasBody && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
  }

  return config;
};

/**
 * Response interceptor - handle errors and token refresh
 */
export const responseInterceptor = {
  onSuccess: (response: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }

    trackingService.trackEvent({
      event: 'api_call',
      category: 'api',
      properties: {
        endpoint: response.config.url,
        method: response.config.method,
        status: response.status,
        duration: response.headers['x-response-time'],
      },
    });

    return response;
  },

  onError: async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const suppressErrorLog = originalRequest?.suppressErrorLog === true;

    if (!suppressErrorLog) {
      if (error.response) {
        console.error(`API Error: ${error.response.status} ${originalRequest?.url}`, error.response.data);
      } else {
        console.warn(`API Network Error: ${originalRequest?.url}`, error.message);
      }
      trackingService.trackEvent({
        event: 'api_error',
        category: 'api',
        properties: {
          endpoint: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          error: error.message,
        },
      });
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = String(originalRequest.url || '');
      const authHeader = (originalRequest.headers as any)?.Authorization || (originalRequest.headers as any)?.authorization;
      const hasAuthHeader = typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ');
      const isAuthRoute = isAuthRouteRequest(url);
      const isPublicRoute = isPublicBootstrapRequest(url);

      if (isAuthRoute || isPublicRoute) {
        // Do not trigger session-expired redirects for public/bootstrap/auth endpoints.
        const backendMessage = getApiErrorMessage(error, '');
        throw new Error(backendMessage || error.message || 'Request failed');
      }

      originalRequest._retry = true;

      let authUtilsLocal: any = null;
      try {
        let refreshToken: string | null = null;
        try {
          // lazy-require to avoid circular import
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          authUtilsLocal = require('@/lib/api/endpoints/auth.api').authUtils;
        } catch (e) {
          authUtilsLocal = null;
        }
        refreshToken = authUtilsLocal?.getRefreshToken?.() ?? null;
        const hasStoredToken = !!(authUtilsLocal?.getToken?.() ?? null);

        // Anonymous requests (no token on request and no stored token) should not redirect.
        if (!refreshToken || (!hasAuthHeader && !hasStoredToken)) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const { accessToken } = await refreshResponse.json();
          try {
            authUtilsLocal?.setToken?.(accessToken);
          } catch { }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return await fetch(originalRequest.url!, {
            ...originalRequest,
            headers: originalRequest.headers as any,
          });
        }
      } catch (refreshError) {
        try {
          authUtilsLocal?.logout?.();
        } catch { }

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/auth/login')) {
            // Use replace to avoid back-button loops
            window.location.replace('/auth/login?error=session_expired');
          }
        }
      }
    }

    const backendMessage = getApiErrorMessage(error, '');

    switch (error.response?.status) {
      case 403:
        throw new Error(backendMessage || 'You do not have permission to access this resource');
      case 404:
        throw new Error(backendMessage || 'Requested resource not found');
      case 429:
        throw new Error(backendMessage || 'Rate limit exceeded. Please try again later.');
      case 500:
        throw new Error(backendMessage || 'Internal server error. Please try again later.');
      case 502:
      case 503:
      case 504:
        throw new Error(backendMessage || 'Service temporarily unavailable. Please try again later.');
      default:
        throw new Error(backendMessage || error.message || 'Request failed');
    }
  },
};

/**
 * Set up interceptors for axios instance
 */
export const setupInterceptors = (axiosInstance: any) => {
  axiosInstance.interceptors.request.use(requestInterceptor);
  axiosInstance.interceptors.response.use(
    responseInterceptor.onSuccess,
    responseInterceptor.onError
  );
};

export default {
  requestInterceptor,
  responseInterceptor,
  setupInterceptors,
};
