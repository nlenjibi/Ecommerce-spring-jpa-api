/**
 * Authentication utilities for API requests
 */

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  // 1. Check cookies first (as these are used by middleware for consistency)
  const cookies = document.cookie.split('; ');
  const authCookie = cookies.find(row => row.startsWith('auth-token='));
  if (authCookie) {
    const value = decodeURIComponent(authCookie.split('=')[1]);
    if (value) return value;
  }

  // 2. Fallback to localStorage
  const simple = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
  if (simple) return simple;

  const structured = localStorage.getItem('auth_tokens');
  if (structured) {
    try {
      const parsed = JSON.parse(structured);
      return parsed?.accessToken || parsed?.access_token || null;
    } catch (e) {
      // ignore
    }
  }

  return localStorage.getItem('access_token') || null;
};

/**
 * Set the authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('authToken', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('auth_tokens');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('access_token');
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};