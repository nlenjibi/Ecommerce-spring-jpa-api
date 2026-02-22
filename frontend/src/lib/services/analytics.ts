/**
 * Analytics Service - Unified analytics tracking for multiple providers
 */

import { trackingService } from '@/lib/utils/tracking';

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface PageViewEvent {
  page: string;
  title?: string;
  url: string;
  referrer?: string;
  properties?: Record<string, any>;
}

export interface EcommerceEvent {
  event: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item';
  items: Array<{
    id: string | number;
    name: string;
    category?: string;
    price: number;
    quantity?: number;
    variant?: string;
  }>;
  value?: number;
  currency?: string;
  transaction_id?: string;
}

// Analytics provider interface
interface AnalyticsProvider {
  init(): Promise<void>;
  trackEvent(event: AnalyticsEvent): void;
  trackPageView(event: PageViewEvent): void;
  trackEcommerce(event: EcommerceEvent): void;
  identify(userId: string, traits?: Record<string, any>): void;
  setUserProperties(userId: string, properties: Record<string, any>): void;
  reset(): void;
}

// Google Analytics 4 (GA4) Provider
class GoogleAnalyticsProvider implements AnalyticsProvider {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    // Load gtag.js
    await this.loadGoogleAnalytics();
    this.initialized = true;
  }

  private loadGoogleAnalytics(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`;
      script.async = true;
      script.onload = () => {
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', process.env.NEXT_PUBLIC_GA4_ID!);
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) return;

    window.gtag('event', event.event, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.properties,
    });
  }

  trackPageView(event: PageViewEvent): void {
    if (!this.initialized) return;

    window.gtag('event', 'page_view', {
      page_title: event.title,
      page_location: event.url,
      page_referrer: event.referrer,
      ...event.properties,
    });
  }

  trackEcommerce(event: EcommerceEvent): void {
    if (!this.initialized) return;

    // Send ecommerce data to GA4
    window.gtag('event', event.event, {
      currency: event.currency || 'USD',
      value: event.value,
      transaction_id: event.transaction_id,
      items: event.items.map(item => ({
        item_id: item.id.toString(),
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity || 1,
        item_variant: item.variant,
      })),
    });
  }

  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.initialized) return;

    window.gtag('config', process.env.NEXT_PUBLIC_GA4_ID!, {
      user_id: userId,
      ...traits,
    });
  }

  setUserProperties(userId: string, properties: Record<string, any>): void {
    if (!this.initialized) return;

    window.gtag('set', 'user_properties', properties);
  }

  reset(): void {
    // GA4 doesn't have a direct reset method
    // You can clear cookies or use a new client ID
  }
}

// Plausible Analytics Provider
class PlausibleProvider implements AnalyticsProvider {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    await this.loadPlausible();
    this.initialized = true;
  }

  private loadPlausible(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://plausible.io/js/script.js';
      script.setAttribute('data-domain', process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN!);
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !window.plausible) return;

    window.plausible(event.event, {
      props: {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.properties,
      },
    });
  }

  trackPageView(event: PageViewEvent): void {
    // Plausible automatically tracks page views
  }

  trackEcommerce(event: EcommerceEvent): void {
    if (!this.initialized || !window.plausible) return;

    window.plausible(event.event, {
      props: {
        revenue: event.value,
        currency: event.currency,
        items: event.items.length,
        ...event.properties,
      },
    });
  }

  identify(userId: string, traits?: Record<string, any>): void {
    // Plausible doesn't support user identification
  }

  setUserProperties(userId: string, properties: Record<string, any>): void {
    // Plausible doesn't support custom user properties
  }

  reset(): void {
    // Plausible doesn't have a reset method
  }
}

// Custom Analytics Provider (for your own tracking)
class CustomAnalyticsProvider implements AnalyticsProvider {
  async init(): Promise<void> {
    // Custom initialization logic
    console.log('Custom analytics initialized');
  }

  trackEvent(event: AnalyticsEvent): void {
    // Track with your custom service
    trackingService.trackEvent({
      event: event.event,
      properties: {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.properties,
      },
    });
  }

  trackPageView(event: PageViewEvent): void {
    trackingService.trackEvent({
      event: 'page_view',
      properties: {
        page: event.page,
        title: event.title,
        url: event.url,
        referrer: event.referrer,
        ...event.properties,
      },
    });
  }

  trackEcommerce(event: EcommerceEvent): void {
    trackingService.trackEvent({
      event: event.event,
      properties: {
        value: event.value,
        currency: event.currency,
        items: event.items,
        transaction_id: event.transaction_id,
      },
    });
  }

  identify(userId: string, traits?: Record<string, any>): void {
    trackingService.setUserId(userId);

    if (traits) {
      // Track user properties
      trackingService.trackEvent({
        event: 'user_identified',
        properties: traits,
      });
    }
  }

  setUserProperties(userId: string, properties: Record<string, any>): void {
    trackingService.trackEvent({
      event: 'user_updated',
      properties: {
        userId,
        ...properties,
      },
    });
  }

  reset(): void {
    trackingService.clearStoredEvents();
  }
}

// Main Analytics Service
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;

  constructor() {
    // Initialize providers based on environment
    if (process.env.NEXT_PUBLIC_GA4_ID) {
      this.providers.push(new GoogleAnalyticsProvider());
    }

    if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
      this.providers.push(new PlausibleProvider());
    }

    // Always include custom provider
    this.providers.push(new CustomAnalyticsProvider());
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    await Promise.allSettled(
      this.providers.map(provider => provider.init())
    );

    this.isInitialized = true;
    console.log('Analytics service initialized with', this.providers.length, 'providers');
  }

  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.providers.forEach(provider => {
      try {
        provider.trackEvent(fullEvent);
      } catch (error) {
        console.error('Error tracking event with provider:', error);
      }
    });
  }

  trackPageView(event: PageViewEvent): void {
    this.providers.forEach(provider => {
      try {
        provider.trackPageView(event);
      } catch (error) {
        console.error('Error tracking page view with provider:', error);
      }
    });
  }

  trackEcommerce(event: EcommerceEvent): void {
    this.providers.forEach(provider => {
      try {
        provider.trackEcommerce(event);
      } catch (error) {
        console.error('Error tracking ecommerce event with provider:', error);
      }
    });
  }

  identify(userId: string, traits?: Record<string, any>): void {
    this.providers.forEach(provider => {
      try {
        provider.identify(userId, traits);
      } catch (error) {
        console.error('Error identifying user with provider:', error);
      }
    });
  }

  setUserProperties(userId: string, properties: Record<string, any>): void {
    this.providers.forEach(provider => {
      try {
        provider.setUserProperties(userId, properties);
      } catch (error) {
        console.error('Error setting user properties with provider:', error);
      }
    });
  }

  reset(): void {
    this.providers.forEach(provider => {
      try {
        provider.reset();
      } catch (error) {
        console.error('Error resetting provider:', error);
      }
    });
  }

  // Convenience methods for common events
  trackSignUp(userId: string, method: string = 'email'): void {
    this.trackEvent({
      event: 'sign_up',
      category: 'Authentication',
      properties: { method, userId },
    });
  }

  trackLogin(userId: string, method: string = 'email'): void {
    this.trackEvent({
      event: 'login',
      category: 'Authentication',
      properties: { method, userId },
    });
  }

  trackProductView(productId: string | number, productName: string, category?: string): void {
    this.trackEvent({
      event: 'view_product',
      category: 'Ecommerce',
      label: productName,
      properties: { productId, productName, category },
    });
  }

  trackAddToCart(productId: string | number, productName: string, quantity: number = 1): void {
    this.trackEvent({
      event: 'add_to_cart',
      category: 'Ecommerce',
      label: productName,
      value: quantity,
      properties: { productId, productName, quantity },
    });
  }

  trackPurchase(orderId: string, total: number, items: any[]): void {
    this.trackEcommerce({
      event: 'purchase',
      value: total,
      transaction_id: orderId,
      items: items.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      })),
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Hook for React components
export const useAnalytics = () => {
  return {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackEcommerce: analyticsService.trackEcommerce.bind(analyticsService),
    identify: analyticsService.identify.bind(analyticsService),
    trackSignUp: analyticsService.trackSignUp.bind(analyticsService),
    trackLogin: analyticsService.trackLogin.bind(analyticsService),
    trackProductView: analyticsService.trackProductView.bind(analyticsService),
    trackAddToCart: analyticsService.trackAddToCart.bind(analyticsService),
    trackPurchase: analyticsService.trackPurchase.bind(analyticsService),
  };
};

export default analyticsService;
