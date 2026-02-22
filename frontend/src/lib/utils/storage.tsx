/**
 * Universal Storage Abstraction
 * Provides consistent storage API for localStorage, sessionStorage, and cookies
 */

// Storage types
export type StorageType = 'local' | 'session' | 'cookie';
export type StorageOptions = {
  expires?: number | string; // Days or date string
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

class UniversalStorage {
  private isClientSide: boolean;

  constructor() {
    this.isClientSide = typeof window !== 'undefined';
  }

  // ==================== LOCAL STORAGE ====================
  setLocal(key: string, value: any): void {
    if (!this.isClientSide) return;

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Failed to set localStorage key "${key}":`, error);
    }
  }

  getLocal<T = any>(key: string, defaultValue?: T): T | null {
    if (!this.isClientSide) return defaultValue ?? null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue ?? null;

      try {
        return JSON.parse(item);
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Failed to get localStorage key "${key}":`, error);
      return defaultValue ?? null;
    }
  }

  removeLocal(key: string): void {
    if (!this.isClientSide) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  }

  clearLocal(): void {
    if (!this.isClientSide) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  // ==================== SESSION STORAGE ====================
  setSession(key: string, value: any): void {
    if (!this.isClientSide) return;

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Failed to set sessionStorage key "${key}":`, error);
    }
  }

  getSession<T = any>(key: string, defaultValue?: T): T | null {
    if (!this.isClientSide) return defaultValue ?? null;

    try {
      const item = sessionStorage.getItem(key);
      if (!item) return defaultValue ?? null;

      try {
        return JSON.parse(item);
      } catch {
        return item as T;
      }
    } catch (error) {
      console.error(`Failed to get sessionStorage key "${key}":`, error);
      return defaultValue ?? null;
    }
  }

  removeSession(key: string): void {
    if (!this.isClientSide) return;

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove sessionStorage key "${key}":`, error);
    }
  }

  clearSession(): void {
    if (!this.isClientSide) return;

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }

  // ==================== COOKIES ====================
  setCookie(
    key: string,
    value: string,
    options: StorageOptions = {}
  ): void {
    if (!this.isClientSide) return;

    const {
      expires,
      path = '/',
      domain,
      secure = false,
      sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    // Expiration
    if (expires) {
      const expiryDate = typeof expires === 'number'
        ? new Date(Date.now() + expires * 24 * 60 * 60 * 1000) // days to ms
        : new Date(expires);
      cookieString += `; expires=${expiryDate.toUTCString()}`;
    }

    // Path
    cookieString += `; path=${path}`;

    // Domain
    if (domain) cookieString += `; domain=${domain}`;

    // Secure flag
    if (secure) cookieString += '; secure';

    // SameSite
    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  getCookie(key: string): string | null {
    if (!this.isClientSide) return null;

    const name = encodeURIComponent(key) + '=';
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      let trimmedCookie = cookie.trim();
      if (trimmedCookie.indexOf(name) === 0) {
        return decodeURIComponent(trimmedCookie.substring(name.length));
      }
    }

    return null;
  }

  removeCookie(key: string, path: string = '/', domain?: string): void {
    if (!this.isClientSide) return;

    let cookieString = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

    if (domain) cookieString += `; domain=${domain}`;

    document.cookie = cookieString;
  }

  // ==================== UNIFIED API ====================
  set(
    type: StorageType,
    key: string,
    value: any,
    options?: StorageOptions
  ): void {
    switch (type) {
      case 'local':
        this.setLocal(key, value);
        break;
      case 'session':
        this.setSession(key, value);
        break;
      case 'cookie':
        this.setCookie(key, value, options || {});
        break;
    }
  }

  get<T = any>(
    type: StorageType,
    key: string,
    defaultValue?: T
  ): T | null {
    switch (type) {
      case 'local':
        return this.getLocal(key, defaultValue);
      case 'session':
        return this.getSession(key, defaultValue);
      case 'cookie':
        return this.getCookie(key) as T | null;
      default:
        return defaultValue ?? null;
    }
  }

  remove(type: StorageType, key: string, options?: { path?: string; domain?: string }): void {
    switch (type) {
      case 'local':
        this.removeLocal(key);
        break;
      case 'session':
        this.removeSession(key);
        break;
      case 'cookie':
        this.removeCookie(key, options?.path, options?.domain);
        break;
    }
  }

  clear(type: StorageType): void {
    switch (type) {
      case 'local':
        this.clearLocal();
        break;
      case 'session':
        this.clearSession();
        break;
      case 'cookie':
        // Can't clear all cookies, but clear common ones
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          this.removeCookie(name);
        }
        break;
    }
  }

  // ==================== SPECIFIC USE CASES ====================
  // Auth tokens
  setAuthToken(token: string, type: StorageType = 'local'): void {
    this.set(type, 'auth_token', token);
  }

  getAuthToken(type: StorageType = 'local'): string | null {
    return this.get(type, 'auth_token');
  }

  removeAuthToken(type: StorageType = 'local'): void {
    this.remove(type, 'auth_token');
  }

  // User data
  setUserData(user: any, type: StorageType = 'local'): void {
    this.set(type, 'user_data', user);
  }

  getUserData<T = any>(type: StorageType = 'local'): T | null {
    return this.get(type, 'user_data');
  }

  removeUserData(type: StorageType = 'local'): void {
    this.remove(type, 'user_data');
  }

  // Cart data
  setCartId(cartId: number, type: StorageType = 'local'): void {
    this.set(type, 'cart_id', cartId.toString());
  }

  getCartId(type: StorageType = 'local'): number | null {
    const id = this.get(type, 'cart_id');
    return id ? parseInt(id as string, 10) : null;
  }

  removeCartId(type: StorageType = 'local'): void {
    this.remove(type, 'cart_id');
  }

  // Wishlist data
  setWishlistItems(items: any[], type: StorageType = 'local'): void {
    this.set(type, 'wishlist_items', items);
  }

  getWishlistItems<T = any[]>(type: StorageType = 'local'): T | null {
    return this.get(type, 'wishlist_items');
  }

  removeWishlistItems(type: StorageType = 'local'): void {
    this.remove(type, 'wishlist_items');
  }

  // Theme preferences
  setTheme(theme: 'light' | 'dark', type: StorageType = 'local'): void {
    this.set(type, 'theme', theme);
  }

  getTheme(type: StorageType = 'local'): 'light' | 'dark' | null {
    return this.get(type, 'theme');
  }

  // Language preferences
  setLanguage(lang: string, type: StorageType = 'local'): void {
    this.set(type, 'language', lang);
  }

  getLanguage(type: StorageType = 'local'): string | null {
    return this.get(type, 'language');
  }
}

// Export singleton instance
export const storage = new UniversalStorage();

// Convenience exports
export const {
  setLocal,
  getLocal,
  removeLocal,
  clearLocal,
  setSession,
  getSession,
  removeSession,
  clearSession,
  setCookie,
  getCookie,
  removeCookie,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setUserData,
  getUserData,
  removeUserData,
  setCartId,
  getCartId,
  removeCartId,
  setWishlistItems,
  getWishlistItems,
  removeWishlistItems,
  setTheme,
  getTheme,
  setLanguage,
  getLanguage,
} = storage;

export default storage;
