import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';

// ==================== Next.js Page Layout Types ====================
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// ==================== Next.js API Types ====================
export interface ApiRequest extends Request {
  user?: any;
  session?: any;
}

export interface ApiContext {
  params: Record<string, string>;
  req: ApiRequest;
  res: Response;
}

// ==================== Next.js Route Types ====================
export interface DynamicRouteParams {
  params: {
    slug: string;
    id?: string;
    [key: string]: string | undefined;
  };
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

// ==================== Next.js Metadata Types ====================
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  openGraph?: {
    title: string;
    description: string;
    images: string[];
    type: 'website' | 'article' | 'product';
  };
  robots?: {
    index: boolean;
    follow: boolean;
  };
}

export interface ProductMetadata extends PageMetadata {
  product?: {
    name: string;
    price: number;
    currency: string;
    images: string[];
    category: string;
    brand?: string;
    availability: 'instock' | 'outofstock';
  };
}

// ==================== Next.js Middleware Types ====================
export interface MiddlewareConfig {
  matcher: string[];
}

export interface MiddlewareRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// ==================== Next.js Error Types ====================
export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export interface NotFoundPageProps {
  // Add any specific props for 404 page
}

// ==================== Next.js Image Types ====================
export interface OptimizedImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  blurDataURL?: string;
}

export interface ImageGallery {
  images: OptimizedImage[];
  currentIndex: number;
}

// ==================== Next.js Link Types ====================
export interface NavLink {
  href: string;
  label: string;
  icon?: ReactNode;
  children?: NavLink[];
  requiresAuth?: boolean;
  roles?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

// ==================== Next.js SEO Types ====================
export interface SEODefaults {
  siteName: string;
  baseUrl: string;
  twitterHandle?: string;
  defaultImage: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// ==================== Next.js Theme Types ====================
export interface ThemeConfig {
  defaultTheme: 'light' | 'dark';
  storageKey: string;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// ==================== Next.js Internationalization Types ====================
export interface LocaleConfig {
  defaultLocale: string;
  locales: string[];
}

export interface Translation<T = any> {
  [key: string]: T;
}

// ==================== Next.js Performance Types ====================
export interface PerformanceMetrics {
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  inp: number; // Interaction to Next Paint
}

export interface BundleAnalysis {
  page: string;
  size: number;
  firstLoadJS: number;
  score: number;
}

// ==================== Next.js Analytics Types ====================
export interface PageViewEvent {
  page: string;
  referrer: string;
  timestamp: number;
  sessionId: string;
}

export interface ConversionEvent {
  type: string;
  value?: number;
  currency?: string;
  items?: any[];
  timestamp: number;
}
