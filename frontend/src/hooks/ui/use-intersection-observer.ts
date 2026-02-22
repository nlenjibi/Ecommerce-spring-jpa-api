'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer Hook
 * 
 * Detect when an element enters or leaves the viewport.
 * Perfect for lazy loading, infinite scroll, and scroll animations.
 */

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Freeze the observed value on first intersection (default: false) */
  freezeOnceVisible?: boolean;
}

/**
 * useIntersectionObserver Hook
 * 
 * Track when an element is visible in the viewport.
 * 
 * @param options - Intersection observer options
 * @returns Object with ref and intersection entry
 * 
 * @example
 * const { ref, entry, isIntersecting } = useIntersectionObserver({
 *   threshold: 0.5,
 *   freezeOnceVisible: true
 * });
 * 
 * <div ref={ref}>
 *   {isIntersecting && <ExpensiveComponent />}
 * </div>
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [node, setNode] = useState<T | null>(null);
  const frozen = useRef(false);

  // Update observer when options change
  useEffect(() => {
    const currentNode = node;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!currentNode || !hasIOSupport) return;

    // Don't update if frozen
    if (frozen.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        // Freeze on first intersection if enabled
        if (entry.isIntersecting && freezeOnceVisible) {
          frozen.current = true;
          observer.unobserve(currentNode);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(currentNode);

    return () => {
      observer.disconnect();
    };
  }, [node, threshold, root, rootMargin, freezeOnceVisible]);

  return {
    ref: setNode,
    entry,
    isIntersecting: entry?.isIntersecting ?? false,
    intersectionRatio: entry?.intersectionRatio ?? 0,
  };
}

/**
 * useInView Hook
 * 
 * Simplified version that returns boolean for visibility.
 * 
 * @param options - Intersection observer options
 * @returns Tuple of [ref, isInView]
 * 
 * @example
 * const [ref, isInView] = useInView({ threshold: 0.5 });
 * 
 * <div ref={ref}>
 *   {isInView ? 'Visible' : 'Hidden'}
 * </div>
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefCallback<T>, boolean] {
  const { ref, isIntersecting } = useIntersectionObserver<T>(options);
  return [ref, isIntersecting];
}

/**
 * useLazyLoad Hook
 * 
 * Lazy load images or components when they enter viewport.
 * 
 * @param options - Intersection observer options
 * @returns Object with ref and shouldLoad boolean
 * 
 * @example
 * const { ref, shouldLoad } = useLazyLoad();
 * 
 * <div ref={ref}>
 *   {shouldLoad && <img src={imageSrc} />}
 * </div>
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const { ref, isIntersecting } = useIntersectionObserver<T>({
    freezeOnceVisible: true,
    ...options,
  });

  return {
    ref,
    shouldLoad: isIntersecting,
  };
}

/**
 * useScrollTrigger Hook
 * 
 * Trigger animations or effects when element enters viewport.
 * 
 * @param callback - Function to call when element is visible
 * @param options - Intersection observer options
 * @returns ref to attach to element
 * 
 * @example
 * const ref = useScrollTrigger(() => {
 *   console.log('Element is visible!');
 * }, { threshold: 0.5 });
 * 
 * <div ref={ref}>Content</div>
 */
export function useScrollTrigger<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
): React.RefCallback<T> {
  const hasTriggered = useRef(false);
  const { ref, isIntersecting } = useIntersectionObserver<T>(options);

  useEffect(() => {
    if (isIntersecting && !hasTriggered.current) {
      hasTriggered.current = true;
      callback();
    }
  }, [isIntersecting, callback]);

  return ref;
}

/**
 * useVisibilityPercentage Hook
 * 
 * Track how much of an element is visible (0-100%).
 * 
 * @param options - Intersection observer options
 * @returns Object with ref and visibility percentage
 * 
 * @example
 * const { ref, percentage } = useVisibilityPercentage();
 * 
 * <div ref={ref}>
 *   Visibility: {Math.round(percentage * 100)}%
 * </div>
 */
export function useVisibilityPercentage<T extends HTMLElement = HTMLDivElement>(
  options: Omit<UseIntersectionObserverOptions, 'threshold'> = {}
) {
  const { ref, intersectionRatio } = useIntersectionObserver<T>({
    threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    ...options,
  });

  return {
    ref,
    percentage: intersectionRatio,
  };
}
