import { request } from '../core/client';
import { ApiResponse } from '@/types/api';

const resolveCurrentUserId = (explicitUserId?: number | string): number => {
  if (explicitUserId !== undefined && explicitUserId !== null) {
    const parsed = Number(explicitUserId);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  if (typeof window !== 'undefined') {
    const storedUser = authUtils.getUser();
    const parsed = Number((storedUser as any)?.id);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  throw new Error('No authenticated user id available');
};

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   */
  login: (usernameOrEmail: string, password: string) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/users/auth/login',
      data: { usernameOrEmail, password },
    }),

  /**
   * Register new user
   */
  register: (data: {
    username?: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/users/auth/register',
      data,
    }),

  /**
   * Get user profile
   */
  getProfile: (userId?: number | string) => {
    const resolvedUserId = resolveCurrentUserId(userId);
    return request<{ user: any }>({
      method: 'GET',
      url: `/v1/users/${resolvedUserId}`,
      suppressErrorLog: true,
    });
  },

  /**
   * Update user profile
   */
  updateProfile: (data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
  }>, userId?: number | string) => {
    const resolvedUserId = resolveCurrentUserId(userId);
    return request<{ user: any }>({
      method: 'PUT',
      url: `/v1/users/${resolvedUserId}`,
      data,
    });
  },

  /**
   * Change password
   */
  changePassword: (data: { currentPassword: string; newPassword: string }, userId?: number | string) => {
    const resolvedUserId = resolveCurrentUserId(userId);
    return request<{ message: string }>({
      method: 'PATCH',
      url: `/v1/users/${resolvedUserId}/password`,
      data,
    });
  },

  /**
   * Forgot password
   */
  forgotPassword: (email: string) =>
    request<ApiResponse<null>>({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email },
    }),

  /**
   * Reset password
   */
  resetPassword: (token: string, password: string) =>
    request<ApiResponse<null>>({
      method: 'POST',
      url: '/auth/reset-password',
      data: { token, password },
    }),

  /**
   * Verify email
   */
  verifyEmail: (token: string) =>
    request<ApiResponse<null>>({
      method: 'POST',
      url: '/auth/verify-email',
      data: { token },
    }),

  /**
   * Get user activities
   */
  getActivities: (params?: { page?: number; limit?: number }) =>
    request<ApiResponse<any[]> & { total: number }>({
      method: 'GET',
      url: '/v1/users/activities',
      params,
    }),

  /**
   * Get user addresses
   */
  getAddresses: (params?: { page?: number; limit?: number }) =>
    request<ApiResponse<any[]> & { total: number }>({
      method: 'GET',
      url: '/v1/users/addresses',
      params,
    }),

  /**
   * Create new address
   */
  createAddress: (data: any) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/users/addresses',
      data,
    }),

  /**
   * Update address
   */
  updateAddress: (id: number, data: any) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/users/addresses/${id}`,
      data,
    }),

  /**
   * Partially update address
   */
  patchAddress: (id: number, data: any) =>
    request<ApiResponse<any>>({
      method: 'PATCH',
      url: `/v1/users/addresses/${id}`,
      data,
    }),

  /**
   * Delete address
   */
  deleteAddress: (id: number) =>
    request<ApiResponse<null>>({
      method: 'DELETE',
      url: `/v1/users/addresses/${id}`,
    }),
};

// Authentication utilities for use in interceptors and contexts
export const authUtils = {
  TOKEN_KEYS: ['auth_token', 'authToken', 'access_token'] as const,
  STRUCTURED_TOKEN_KEY: 'auth_tokens',
  REFRESH_TOKEN_KEYS: ['refresh_token', 'refreshToken'] as const,
  USER_KEYS: ['user', 'user_data'] as const,

  // ─── Cookie helpers (for Edge Middleware) ───────────────────────────
  // Edge Middleware runs before JS and cannot access localStorage.
  // We mirror the auth state into cookies so the middleware can guard routes.
  _setCookie: (name: string, value: string, days = 7) => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    // SameSite=Lax is safe for same-origin navigation.
    // Do NOT set HttpOnly here — this is set by JS for client-readable middleware sync.
    document.cookie = `${name}=${encodeURIComponent(value)};Max-Age=${maxAge};Path=/;SameSite=Lax`;
  },
  _deleteCookie: (name: string) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;Max-Age=0;Path=/;SameSite=Lax`;
  },

  // Token management
  getToken: () => {
    if (typeof window !== 'undefined') {
      // Prefer direct token keys first.
      for (const key of authUtils.TOKEN_KEYS) {
        const token = localStorage.getItem(key);
        if (token) return token;
      }

      // Backward compatibility for structured token payloads.
      const structured = localStorage.getItem(authUtils.STRUCTURED_TOKEN_KEY);
      if (structured) {
        try {
          const parsed = JSON.parse(structured);
          return parsed?.accessToken || parsed?.access_token || null;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      // Write all known localStorage variants to keep legacy consumers in sync.
      for (const key of authUtils.TOKEN_KEYS) {
        localStorage.setItem(key, token);
      }
      localStorage.setItem(
        authUtils.STRUCTURED_TOKEN_KEY,
        JSON.stringify({ accessToken: token, access_token: token })
      );
      // ↓ Sync to cookie so Edge Middleware can read it on every request
      authUtils._setCookie('auth-token', token);
    }
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      for (const key of authUtils.TOKEN_KEYS) {
        localStorage.removeItem(key);
      }
      localStorage.removeItem(authUtils.STRUCTURED_TOKEN_KEY);
      for (const key of authUtils.REFRESH_TOKEN_KEYS) {
        localStorage.removeItem(key);
      }
      // ↓ Clear the middleware cookie too
      authUtils._deleteCookie('auth-token');
      authUtils._deleteCookie('user-role');
    }
  },

  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      for (const key of authUtils.REFRESH_TOKEN_KEYS) {
        const token = localStorage.getItem(key);
        if (token) return token;
      }
    }
    return null;
  },

  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      for (const key of authUtils.REFRESH_TOKEN_KEYS) {
        localStorage.setItem(key, token);
      }
    }
  },

  removeRefreshToken: () => {
    if (typeof window !== 'undefined') {
      for (const key of authUtils.REFRESH_TOKEN_KEYS) {
        localStorage.removeItem(key);
      }
    }
  },

  // User data management
  getUser: () => {
    if (typeof window !== 'undefined') {
      for (const key of authUtils.USER_KEYS) {
        const user = localStorage.getItem(key);
        if (!user) continue;
        try {
          return JSON.parse(user);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      const serialized = JSON.stringify(user);
      for (const key of authUtils.USER_KEYS) {
        localStorage.setItem(key, serialized);
      }
      // ↓ Mirror the role to a cookie for the middleware's role-based guards
      if (user?.role) {
        authUtils._setCookie('user-role', String(user.role).toLowerCase());
      }
    }
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      for (const key of authUtils.USER_KEYS) {
        localStorage.removeItem(key);
      }
    }
  },

  isAuthenticated: () => {
    return !!authUtils.getToken();
  },

  logout: () => {
    authUtils.removeToken();
    authUtils.removeRefreshToken();
    authUtils.removeUser();
    // Forcibly clear middleware-critical cookies
    authUtils._deleteCookie('auth-token');
    authUtils._deleteCookie('user-role');
  },
};
