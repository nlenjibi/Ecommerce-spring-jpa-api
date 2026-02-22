'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getAuthToken as getAuthTokenUtil, setAuthToken as setAuthTokenUtil, removeAuthToken } from '@/lib/utils/auth';

/**
 * Authentication Hook
 * 
 * Comprehensive authentication management including:
 * - Login/Logout
 * - User state management
 * - Token handling
 * - Protected route helpers
 */

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'seller' | 'customer';
  firstName?: string;
  lastName?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
}

/**
 * useAuth Hook
 * 
 * Manage user authentication state and operations.
 * 
 * @returns Authentication state and methods
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * const handleLogin = async () => {
 *   await login({ username: 'john', password: 'secret' });
 * };
 * 
 * {isAuthenticated && <Dashboard user={user} />}
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get auth token from storage (using centralized utility)
  const getAuthToken = useCallback((): string | null => {
    return getAuthTokenUtil();
  }, []);

  // Set auth token in storage
  const setAuthToken = useCallback((tokens: AuthTokens) => {
    if (typeof window === 'undefined') return;

    // Store in multiple formats for compatibility
    setAuthTokenUtil(tokens.accessToken);
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }, []);

  // Clear auth data from storage
  const clearAuthData = useCallback(() => {
    if (typeof window === 'undefined') return;

    removeAuthToken();
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
  }, []);

  // Check if user is authenticated
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = getAuthToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      // Try to get user info from storage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as User;
          setUser(parsed);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, [getAuthToken, clearAuthData]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Make login API call (adjust endpoint as needed)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { user, accessToken, refreshToken } = data;

      // Store tokens and user data
      setAuthToken({ accessToken, refreshToken });
      localStorage.setItem('username', credentials.username);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      toast.success('Login successful!');

      // Redirect to dashboard or home
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, setAuthToken]);

  // Logout function
  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  }, [router, clearAuthData]);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);

      // Make registration API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/users/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const responseData = await response.json();
      const { user, accessToken, refreshToken } = responseData;

      // Store tokens and user data
      setAuthToken({ accessToken, refreshToken });
      localStorage.setItem('username', data.username);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      toast.success('Registration successful!');

      // Redirect to dashboard
      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router, setAuthToken]);

  // Update user data
  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateUser,
    checkAuth,
  };
}

/**
 * useRequireAuth Hook
 * 
 * Redirect to login if not authenticated.
 * Use in protected pages.
 * 
 * @param redirectTo - Path to redirect after login (default: current path)
 * 
 * @example
 * function ProtectedPage() {
 *   useRequireAuth();
 *   return <Dashboard />;
 * }
 */
export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = redirectTo || window.location.pathname;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * useIsAdmin Hook
 * 
 * Check if current user has admin role.
 * 
 * @returns Whether user is admin
 * 
 * @example
 * const isAdmin = useIsAdmin();
 * {isAdmin && <AdminPanel />}
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'admin';
}
