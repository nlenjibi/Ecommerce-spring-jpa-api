'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { authApi } from '@/lib/api';
import { authUtils } from '@/lib/api/endpoints/auth.api';
import { USER_ROLES } from '@/lib/constants/constants';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: { username?: string; firstName?: string; lastName?: string; email: string; phoneNumber?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<{ firstName: string; lastName: string; phone: string }>) => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** How long (ms) before we consider the cached user data stale and re-fetch from server */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authUtils.isAuthenticated()) {
          const cached = authUtils.getUser();
          if (cached) {
            // Show cached user immediately — zero-latency restore
            const normalized: any = {
              id: cached.id,
              email: cached.email,
              firstName: cached.firstName,
              lastName: cached.lastName,
              role: cached.role || USER_ROLES.USER,
              avatar: (cached as any).avatar || null,
            };
            dispatch({ type: 'SET_USER', payload: normalized });

            // Sync token + role to cookies so Edge Middleware can read them.
            // Users who logged in before this code existed have tokens only in
            // localStorage — this one-time sync unblocks protected routes for them.
            const existingToken = authUtils.getToken();
            if (existingToken) authUtils._setCookie('auth-token', existingToken);
            if (normalized.role) authUtils._setCookie('user-role', String(normalized.role).toLowerCase());

            // Only call the backend if the cache is stale (> 5 minutes old).
            // This prevents a blocking Spring Boot API call on every navigation/mount.
            const cachedAt = (cached as any)._cachedAt;
            const isCacheStale = !cachedAt || (Date.now() - cachedAt) > CACHE_TTL_MS;

            if (isCacheStale) {
              try {
                const profileResponse = await authApi.getProfile((cached as any).id);
                const profile = (profileResponse as any)?.data || (profileResponse as any)?.user || profileResponse || null;
                if (profile) {
                  const updated: any = {
                    id: profile.id,
                    email: profile.email,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    role: profile.role || USER_ROLES.USER,
                    avatar: profile.avatar || null,
                    _cachedAt: Date.now(),
                  };
                  dispatch({ type: 'SET_USER', payload: updated });
                  authUtils.setUser(updated);
                }
              } catch {
                // Ignore background refresh errors — user stays logged in with cached data
              }
            }
          } else {
            // No cached user, try to fetch profile
            try {
              const profileResponse = await authApi.getProfile((authUtils.getUser() as any)?.id);
              const profile = (profileResponse as any)?.data || (profileResponse as any)?.user || profileResponse || null;
              if (profile) {
                const normalized: any = {
                  id: profile.id,
                  email: profile.email,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  role: (profile.role || 'user').toLowerCase(),
                  avatar: profile.avatar || null,
                  _cachedAt: Date.now(),
                };
                dispatch({ type: 'SET_USER', payload: normalized });
                authUtils.setUser(normalized);
              } else {
                dispatch({ type: 'SET_LOADING', payload: false });
              }
            } catch {
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        // Token is invalid, user needs to login again
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.login(usernameOrEmail, password);
      const user = (response as any)?.data || (response as any) || null;
      const sessionToken = (response as any)?.data?.sessionToken || (response as any)?.sessionToken || null;

      const refreshToken = (response as any)?.data?.refreshToken || null;
      if (refreshToken) {
        authUtils.setRefreshToken(refreshToken);
      }

      if (sessionToken) {
        authUtils.setToken(sessionToken);
        
        // Also set cookies for middleware compatibility
        if (typeof document !== 'undefined') {
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          document.cookie = `auth-token=${encodeURIComponent(sessionToken)};Max-Age=${maxAge};Path=/;SameSite=Lax`;
        }
      }
      if (user) {
        const normalized: any = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: (user.role || 'user').toLowerCase(),
          avatar: (user.avatar || null),
          _cachedAt: Date.now(),
        };
        dispatch({ type: 'SET_USER', payload: normalized });
        try {
          authUtils.setUser(normalized);
        } catch { }
        // Set user-role cookie for middleware
        if (typeof document !== 'undefined' && normalized.role) {
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          document.cookie = `user-role=${encodeURIComponent(normalized.role)};Max-Age=${maxAge};Path=/;SameSite=Lax`;
        }
      }

      // Note: Cart merge will be handled by CartMergeHandler component
      // to avoid hook conflicts in this context
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (data: { username?: string; firstName?: string; lastName?: string; email: string; phoneNumber?: string; password: string }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authApi.register(data);
      const user = (response as any)?.data || (response as any) || null;
      const sessionToken = (response as any)?.data?.sessionToken || (response as any)?.sessionToken || null;

      const refreshToken = (response as any)?.data?.refreshToken || null;
      if (refreshToken) {
        authUtils.setRefreshToken(refreshToken);
      }

      if (sessionToken) {
        authUtils.setToken(sessionToken);
        // Also set cookie for middleware compatibility
        if (typeof document !== 'undefined') {
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          document.cookie = `auth-token=${encodeURIComponent(sessionToken)};Max-Age=${maxAge};Path=/;SameSite=Lax`;
        }
      }

      if (user) {
        const normalized: any = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: (user.role || 'user').toLowerCase(),
          avatar: (user.avatar || null),
          _cachedAt: Date.now(),
        };
        dispatch({ type: 'SET_USER', payload: normalized });
        try {
          authUtils.setUser(normalized);
        } catch { }
        // Set user-role cookie for middleware
        if (typeof document !== 'undefined' && normalized.role) {
          const maxAge = 60 * 60 * 24 * 7; // 7 days
          document.cookie = `user-role=${encodeURIComponent(normalized.role)};Max-Age=${maxAge};Path=/;SameSite=Lax`;
        }
        try {
          toast.success('Account created successfully!');
        } catch (e) {
          // no-op if toast fails for some reason
        }
      }

      // Note: Cart merge will be handled by CartMergeHandler component
      // to avoid hook conflicts in this context
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      authUtils.logout();
      // Clear cookie for middleware compatibility
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=;Max-Age=0;Path=/;SameSite=Lax';
        document.cookie = 'user-role=;Max-Age=0;Path=/;SameSite=Lax';
      }
      try {
        if ((authApi as any).logout) await (authApi as any).logout();
      } catch { }
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (data: Partial<{ firstName: string; lastName: string; phone: string }>) => {
    const response = await authApi.updateProfile(data, state.user?.id);
    const updated = (response as any)?.data || (response as any)?.user || response;
    const normalized: any = {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      role: (updated.role || 'user').toLowerCase(),
      avatar: updated.avatar || null,
      _cachedAt: Date.now(),
    };
    dispatch({ type: 'UPDATE_USER', payload: normalized });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
