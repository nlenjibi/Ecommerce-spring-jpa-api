import { StateCreator, StoreApi, StoreMutatorIdentifier } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

// ==================== Custom Middleware ====================

// Logging middleware: logs all state changes
export const logger = <T extends object>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, api) => {
  return config(
    (args) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('State changed:', args);
        console.log('New state:', get());
      }
      set(args);
    },
    get,
    api
  );
};

// Persistence middleware configuration
export const persistenceConfig = (name: string): PersistOptions<any> => ({
  name: `shophub-${name}`,
  version: 1,
  // Only persist in client-side
  storage: typeof window !== 'undefined' ? localStorage : undefined,
});

// DevTools middleware (Redux DevTools integration)
export const devtools = <T extends object>(
  config: StateCreator<T, [], []>,
  options?: { name?: string; enabled?: boolean }
): StateCreator<T, [], []> => {
  if (process.env.NODE_ENV === 'development' && options?.enabled !== false) {
    // In a real implementation, you'd integrate with Redux DevTools
    return config;
  }
  return config;
};

// Undo/Redo middleware (state history)
export const withUndoRedo = <T extends object>(
  config: StateCreator<T, [], []>
): StateCreator<T, [], []> => (set, get, api) => {
  const initialState = config(set, get, api);

  return {
    ...initialState,
    undo: () => {
      // Implementation for undo functionality
      console.log('Undo triggered');
    },
    redo: () => {
      // Implementation for redo functionality
      console.log('Redo triggered');
    },
    canUndo: () => false,
    canRedo: () => false,
  };
};

// Throttle middleware: limits how often state updates can occur
export const throttle = <T extends object>(
  config: StateCreator<T, [], []>,
  delay: number = 300
): StateCreator<T, [], []> => (set, get, api) => {
  const throttledSet = throttleFn(set, delay);
  return config(throttledSet, get, api);
};

const throttleFn = (fn: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

// Validation middleware: validates state changes
export const withValidation = <T extends object>(
  config: StateCreator<T, [], []>,
  validator: (state: T) => string | null
): StateCreator<T, [], []> => (set, get, api) => {
  const initialState = config(set, get, api);

  const validatedSet = (args: any) => {
    const newState = { ...get(), ...args };
    const error = validator(newState);
    if (error) {
      console.warn('State validation failed:', error);
      return;
    }
    set(args);
  };

  return {
    ...initialState,
    // Replace set with validated set
  };
};

// Analytics middleware: tracks state changes for analytics
export const withAnalytics = <T extends object>(
  config: StateCreator<T, [], []>,
  trackEvent: (event: string, data: any) => void
): StateCreator<T, [], []> => (set, get, api) => {
  const initialState = config(set, get, api);

  const analyticSet = (args: any) => {
    trackEvent('state_change', {
      previousState: get(),
      newState: { ...get(), ...args }
    });
    set(args);
  };

  return {
    ...initialState,
    // Replace set with analytic set
  };
};

// Middleware composer: combines multiple middleware
export const composeMiddleware = <T extends object>(
  ...middlewares: Array<(config: StateCreator<T, [], []>) => StateCreator<T, [], []>>
): StateCreator<T, [], []> => {
  return middlewares.reduce((acc, middleware) => middleware(acc), (set, get, api) => ({} as T));
};

// Type definitions for middleware
export type Middleware = <T extends object>(
  config: StateCreator<T, [], []>
) => StateCreator<T, [], []>;

export interface MiddlewareConfig {
  enableLogging?: boolean;
  enablePersistence?: boolean;
  enableDevTools?: boolean;
  enableAnalytics?: boolean;
}
