// ==================== Responsive Design Breakpoints ====================
// Tailwind CSS breakpoints (matches default config)
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 640,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (desktops)
  xl: 1280,   // Extra large devices (large desktops)
  '2xl': 1536, // 2X large devices
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Breakpoint queries for use in JavaScript
export const BREAKPOINT_QUERIES = {
  xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,

  // Max width queries
  smMax: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  mdMax: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  lgMax: `(max-width: ${BREAKPOINTS.xl - 1}px)`,
  xlMax: `(max-width: ${BREAKPOINTS['2xl'] - 1}px)`,

  // Range queries
  smOnly: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  mdOnly: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lgOnly: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  xlOnly: `(min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS['2xl'] - 1}px)`,
} as const;

// Container max-widths for responsive containers
export const CONTAINER_MAX_WIDTHS = {
  sm: BREAKPOINTS.sm,
  md: BREAKPOINTS.md,
  lg: BREAKPOINTS.lg,
  xl: BREAKPOINTS.xl,
  '2xl': BREAKPOINTS['2xl'],
} as const;

// Grid system constants
export const GRID = {
  COLUMNS: 12,
  GUTTER_WIDTH: '1rem', // 16px
  CONTAINER_PADDING: '1rem', // 16px
} as const;

// Responsive spacing scale
export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
} as const;

// Responsive typography scale
export const TYPOGRAPHY = {
  xs: { fontSize: '0.75rem', lineHeight: '1rem' },     // 12px
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem' }, // 14px
  base: { fontSize: '1rem', lineHeight: '1.5rem' },     // 16px
  lg: { fontSize: '1.125rem', lineHeight: '1.75rem' }, // 18px
  xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },  // 20px
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },    // 24px
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' }, // 30px
  '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },   // 36px
} as const;

// Z-index layers for consistent stacking
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Responsive layout constants
export const LAYOUT = {
  HEADER_HEIGHT: {
    mobile: '4rem',   // 64px
    desktop: '5rem',  // 80px
  },
  SIDEBAR_WIDTH: {
    collapsed: '4rem',   // 64px
    expanded: '16rem',  // 256px
  },
  FOOTER_HEIGHT: 'auto',
} as const;

// Media query helpers
export const mediaQuery = {
  up: (breakpoint: Breakpoint) => `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`,
  down: (breakpoint: Breakpoint) => `@media (max-width: ${BREAKPOINTS[breakpoint] - 1}px)`,
  only: (breakpoint: Breakpoint) => {
    const nextBreakpoint = Object.keys(BREAKPOINTS)[
      Object.keys(BREAKPOINTS).indexOf(breakpoint) + 1
    ] as Breakpoint;

    if (!nextBreakpoint) {
      return `@media (min-width: ${BREAKPOINTS[breakpoint]}px)`;
    }

    return `@media (min-width: ${BREAKPOINTS[breakpoint]}px) and (max-width: ${BREAKPOINTS[nextBreakpoint] - 1}px)`;
  },
};

// Device detection helpers
export const IS_MOBILE = typeof window !== 'undefined' ? window.innerWidth < BREAKPOINTS.md : false;
export const IS_TABLET = typeof window !== 'undefined' ?
  window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg : false;
export const IS_DESKTOP = typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINTS.lg : false;

// Breakpoint detection utility
export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'md';

  const width = window.innerWidth;

  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// Responsive value mapper
export const responsiveValue = <T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
  const breakpoint = getCurrentBreakpoint();
  return values[breakpoint] ?? defaultValue;
};
