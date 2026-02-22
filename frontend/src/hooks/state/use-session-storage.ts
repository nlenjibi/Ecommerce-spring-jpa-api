'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Session Storage Hook
 * 
 * Temporary state hook that syncs with sessionStorage.
 * Data persists only for the current browser session.
 */

type SetValue<T> = T | ((prevValue: T) => T);

/**
 * useSessionStorage Hook
 * 
 * Store and retrieve state from sessionStorage with automatic syncing.
 * Data is cleared when the browser tab/window is closed.
 * 
 * @param key - sessionStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * const [formData, setFormData, clearForm] = useSessionStorage('checkout-form', {});
 * 
 * setFormData({ name: 'John', email: 'john@example.com' });
 * clearForm(); // Clears from sessionStorage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Get initial value from sessionStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Set value in sessionStorage and state
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch custom event for syncing across components
          window.dispatchEvent(
            new CustomEvent('session-storage', {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove value from sessionStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent('session-storage', {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes from custom events
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === key) {
        setStoredValue(e.detail.value ?? initialValue);
      }
    };

    window.addEventListener('session-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('session-storage', handleStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * useSessionStorageState Hook
 * 
 * Simplified version that only returns [value, setValue] like useState.
 * 
 * @param key - sessionStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setValue]
 * 
 * @example
 * const [searchFilters, setFilters] = useSessionStorageState('filters', {});
 */
export function useSessionStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  const [value, setValue] = useSessionStorage(key, initialValue);
  return [value, setValue];
}

/**
 * useTemporaryStorage Hook
 * 
 * Alias for useSessionStorage - emphasizes the temporary nature.
 * Perfect for form data, filters, or other session-specific state.
 * 
 * @param key - sessionStorage key
 * @param initialValue - Initial value
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * const [wizard, setWizard, resetWizard] = useTemporaryStorage('wizard', { step: 1 });
 */
export function useTemporaryStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  return useSessionStorage(key, initialValue);
}
