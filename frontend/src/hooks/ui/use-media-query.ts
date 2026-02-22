'use client';

import { useState, useEffect } from 'react';

/**
 * Media Query Hook
 * 
 * Respond to CSS media queries in React components.
 * Perfect for responsive designs and conditional rendering.
 */

/**
 * useMediaQuery Hook
 * 
 * Check if a media query matches the current viewport.
 * 
 * @param query - CSS media query string
 * @param defaultValue - Default value for SSR (default: false)
 * @returns Whether the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * 
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 */
export function useMediaQuery(query: string, defaultValue: boolean = false): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR safe
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * useBreakpoint Hook
 * 
 * Get current breakpoint based on common screen sizes.
 * 
 * @returns Current breakpoint name
 * 
 * @example
 * const breakpoint = useBreakpoint();
 * // Returns: 'mobile' | 'tablet' | 'desktop' | 'wide'
 * 
 * {breakpoint === 'mobile' && <MobileLayout />}
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px) and (max-width: 1439px)');
  const isWide = useMediaQuery('(min-width: 1440px)');

  if (isWide) return 'wide';
  if (isDesktop) return 'desktop';
  if (isTablet) return 'tablet';
  return 'mobile';
}

/**
 * useBreakpoints Hook
 * 
 * Get boolean flags for all common breakpoints.
 * 
 * @returns Object with boolean flags for each breakpoint
 * 
 * @example
 * const { isMobile, isTablet, isDesktop } = useBreakpoints();
 * 
 * {isMobile && <MobileMenu />}
 * {isDesktop && <Sidebar />}
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isWide = useMediaQuery('(min-width: 1440px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isTabletOrMobile: isMobile || isTablet,
    isDesktopOrWide: isDesktop || isWide,
  };
}

/**
 * useIsMobile Hook
 * 
 * Simple check for mobile devices.
 * 
 * @param breakpoint - Max width for mobile (default: 768px)
 * @returns Whether viewport is mobile size
 * 
 * @example
 * const isMobile = useIsMobile();
 * const isSmallMobile = useIsMobile(640);
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * useIsDesktop Hook
 * 
 * Simple check for desktop devices.
 * 
 * @param breakpoint - Min width for desktop (default: 1024px)
 * @returns Whether viewport is desktop size
 * 
 * @example
 * const isDesktop = useIsDesktop();
 */
export function useIsDesktop(breakpoint: number = 1024): boolean {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
}

/**
 * usePrefersDarkMode Hook
 * 
 * Check if user prefers dark color scheme.
 * 
 * @returns Whether user prefers dark mode
 * 
 * @example
 * const prefersDark = usePrefersDarkMode();
 * const theme = prefersDark ? 'dark' : 'light';
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * usePrefersReducedMotion Hook
 * 
 * Check if user prefers reduced motion.
 * 
 * @returns Whether user prefers reduced motion
 * 
 * @example
 * const prefersReducedMotion = usePrefersReducedMotion();
 * const duration = prefersReducedMotion ? 0 : 300;
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * useOrientation Hook
 * 
 * Detect device orientation.
 * 
 * @returns Current orientation
 * 
 * @example
 * const orientation = useOrientation();
 * // Returns: 'portrait' | 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * useTouchDevice Hook
 * 
 * Detect if device supports touch.
 * 
 * @returns Whether device supports touch
 * 
 * @example
 * const isTouch = useTouchDevice();
 * {isTouch && <TouchOptimizedUI />}
 */
export function useTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

/**
 * useResponsiveValue Hook
 * 
 * Get different values based on breakpoints.
 * 
 * @param values - Object mapping breakpoints to values
 * @returns Current value based on breakpoint
 * 
 * @example
 * const columns = useResponsiveValue({
 *   mobile: 1,
 *   tablet: 2,
 *   desktop: 3,
 *   wide: 4
 * });
 */
export function useResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
}): T {
  const breakpoint = useBreakpoint();
  
  if (breakpoint === 'wide' && values.wide !== undefined) {
    return values.wide;
  }
  if (breakpoint === 'desktop' && values.desktop !== undefined) {
    return values.desktop;
  }
  if (breakpoint === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  return values.mobile;
}
