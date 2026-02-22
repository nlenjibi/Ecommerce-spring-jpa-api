/**
 * UI Interaction Hooks
 * 
 * Hooks for handling UI interactions and behaviors
 */

export { useDebounce } from './use-debounce';
export { useIntersectionObserver } from './use-intersection-observer';
export { useKeypress } from './use-keypress';
export { 
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouchDevice,
  usePrefersReducedMotion,
  usePrefersDarkMode
} from './use-media-query';
export { 
  useNetworkSpeed,
  useAdaptiveLoadingDuration,
  useAdaptiveAssets,
  type NetworkSpeed,
  type NetworkInfo
} from './use-network-speed';
