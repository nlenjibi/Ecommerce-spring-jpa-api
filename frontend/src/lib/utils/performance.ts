/**
 * Performance Monitoring and Optimization Utilities
 */

// ==================== PERFORMANCE MONITORING ====================
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
      this.marks.set(name, performance.now());
    } else {
      this.marks.set(name, Date.now());
    }
  }

  measure(name: string, startMark: string, endMark: string): number {
    if (typeof performance !== 'undefined') {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      const duration = measure ? measure.duration : 0;
      this.measures.set(name, duration);
      return duration;
    } else {
      const start = this.marks.get(startMark) || 0;
      const end = this.marks.get(endMark) || 0;
      const duration = end - start;
      this.measures.set(name, duration);
      return duration;
    }
  }

  getDuration(name: string): number {
    return this.measures.get(name) || 0;
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  // Report performance metrics
  report(): Record<string, number> {
    const report: Record<string, number> = {};
    this.measures.forEach((value, key) => {
      report[key] = value;
    });
    return report;
  }
}

// Global performance tracker instance
export const perfTracker = new PerformanceTracker();

// ==================== DEBOUNCE & THROTTLE ====================
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==================== MEMOIZATION ====================
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func.apply(null, args);
    cache.set(key, result);
    return result;
  };

  return memoized as T;
};

// ==================== LAZY LOADING ====================
export const lazyLoad = (callback: () => void, options?: IntersectionObserverInit): void => {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for older browsers
    callback();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.disconnect();
      }
    });
  }, options);

  // You'll need to call observer.observe(element) separately
};

export const createImageLoader = (): {
  load: (src: string) => Promise<HTMLImageElement>;
  preload: (srcs: string[]) => Promise<void>;
} => {
  const load = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const preload = async (srcs: string[]): Promise<void> => {
    await Promise.all(srcs.map(load));
  };

  return { load, preload };
};

// ==================== BUNDLE OPTIMIZATION ====================
export const lazyImport = <T>(factory: () => Promise<T>): (() => Promise<T>) => {
  let loaded: T | null = null;

  return async (): Promise<T> => {
    if (loaded) return loaded;
    loaded = await factory();
    return loaded;
  };
};

// ==================== MEMORY MANAGEMENT ====================
export const createWeakCache = <K extends object, V>() => {
  const cache = new WeakMap<K, V>();

  return {
    get(key: K): V | undefined {
      return cache.get(key);
    },

    set(key: K, value: V): void {
      cache.set(key, value);
    },

    has(key: K): boolean {
      return cache.has(key);
    },
  };
};

export const clearMemoryCache = (): void => {
  if (typeof window !== 'undefined' && 'caches' in window) {
    // Clear service worker caches
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
};

// ==================== RENDER OPTIMIZATION ====================
export const shouldComponentUpdate = <T>(
  prevProps: T,
  nextProps: T,
  keys: (keyof T)[]
): boolean => {
  for (const key of keys) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }
  return false;
};

export const batchUpdates = (callback: () => void): void => {
  // In React 18+, this would use ReactDOM.unstable_batchedUpdates
  // For now, we'll use a simple implementation
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 0);
  }
};

// ==================== NETWORK OPTIMIZATION ====================
export const preloadResources = (urls: string[]): void => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.match(/\.(jpe?g|png|webp|gif)$/i)) {
      link.as = 'image';
    } else if (url.endsWith('.woff2') || url.endsWith('.woff') || url.endsWith('.ttf')) {
      link.as = 'font';
    }

    document.head.appendChild(link);
  });
};

export const prefetchResources = (urls: string[]): void => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

// ==================== PERFORMANCE METRICS ====================
export const getPerformanceMetrics = (): {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  tbt?: number;
} => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return {};
  }

  const metrics: any = {};

  // First Contentful Paint
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  if (fcpEntry) metrics.fcp = fcpEntry.startTime;

  // Largest Contentful Paint
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  if (lcpEntries.length > 0) metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;

  // Cumulative Layout Shift
  const clsEntries = performance.getEntriesByType('layout-shift');
  if (clsEntries.length > 0) {
    metrics.cls = clsEntries.reduce((sum, entry) => sum + (entry as any).value, 0);
  }

  return metrics;
};

export const measurePageLoad = (): number => {
  if (typeof window === 'undefined') return 0;

  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationEntry) {
    return navigationEntry.loadEventEnd - navigationEntry.navigationStart;
  }

  return performance.timing.loadEventEnd - performance.timing.navigationStart;
};

// ==================== EXPORT ====================
export default {
  // Performance Tracking
  PerformanceTracker,
  perfTracker,

  // Optimization
  debounce,
  throttle,
  memoize,
  lazyLoad,
  createImageLoader,
  lazyImport,

  // Memory Management
  createWeakCache,
  clearMemoryCache,

  // Render Optimization
  shouldComponentUpdate,
  batchUpdates,

  // Network Optimization
  preloadResources,
  prefetchResources,

  // Metrics
  getPerformanceMetrics,
  measurePageLoad,
};
