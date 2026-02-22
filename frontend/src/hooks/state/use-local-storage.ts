'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Local Storage Hook
 * 
 * Persistent state hook that syncs with localStorage.
 * Handles JSON serialization/deserialization automatically.
 */

type SetValue<T> = T | ((prevValue: T) => T);

/**
 * useLocalStorage Hook
 * 
 * Store and retrieve state from localStorage with automatic syncing.
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * const [user, setUser, removeUser] = useLocalStorage('user', null);
 * 
 * setUser({ id: 1, name: 'John' });
 * removeUser(); // Clears from localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in localStorage and state
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch custom event for cross-tab syncing
          window.dispatchEvent(
            new CustomEvent('local-storage', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if (e instanceof StorageEvent) {
        if (e.key === key && e.newValue) {
          try {
            setStoredValue(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing storage event:', error);
          }
        }
      } else if (e.detail?.key === key) {
        setStoredValue(e.detail.value ?? initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * useLocalStorageState Hook
 * 
 * Simplified version that only returns [value, setValue] like useState.
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue]
 * 
 * @example
 * const [theme, setTheme] = useLocalStorageState('theme', 'light');
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  const [value, setValue] = useLocalStorage(key, initialValue);
  return [value, setValue];
}

/**
 * useSyncedLocalStorage Hook
 * 
 * Like useLocalStorage but with real-time syncing across tabs.
 * Perfect for shared state like shopping carts.
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * const [cart, setCart] = useSyncedLocalStorage('cart', []);
 */
export function useSyncedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  return useLocalStorage(key, initialValue);
}
