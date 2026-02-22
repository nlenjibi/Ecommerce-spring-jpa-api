import { analyticsApi } from '@/lib/api';

export interface TrackingEvent {
  event: string;
  productId: number;
  productName?: string;
  category?: string;
  price?: number;
  timestamp?: string;
  userId?: string | null;
  sessionId?: string;
  metadata?: Record<string, any>;
}

class TrackingService {
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadUserId();
    // Sync sessionId with cartFromTracking service
    this.syncSessionIdWithCartTracking();
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private syncSessionIdWithCartTracking() {
    try {
      // Store session ID for cart tracking
      if (typeof window !== 'undefined') {
        localStorage.setItem('tracking_session_id', this.sessionId);
      }
    } catch (error) {
      console.warn('Failed to sync sessionId with cart tracking:', error);
    }
  }

  private loadUserId() {
    // Try to get user ID from localStorage or context
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.userId = user.id || null;
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
  }

  async trackEvent(event: TrackingEvent) {
    try {
      // Add session and user info
      const enrichedEvent = {
        ...event,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: event.timestamp || new Date().toISOString(),
      };

      // Log to console for debugging
      console.log('📊 Tracking Event:', enrichedEvent);

      // Send to analytics API if available
      // Note: You might need to add a specific endpoint for tracking events
      // await analyticsApi.trackEvent(enrichedEvent);

      // Store in localStorage for fallback
      this.storeEvent(enrichedEvent);

      return enrichedEvent;
    } catch (error) {
      console.error('Failed to track event:', error);
      // Still store locally even if API fails
      this.storeEvent(event);
    }
  }

  async trackAddToCart(productId: number, productName: string, category: string, price: number) {
    return this.trackEvent({
      event: 'add_to_cart',
      productId,
      productName,
      category,
      price,
      metadata: {
        source: 'product_card',
      },
    });
  }

  async trackProductView(productId: number, productName: string, category: string, price: number) {
    const event = await this.trackEvent({
      event: 'product_view',
      productId,
      productName,
      category,
      price,
    });

    // Also add to cart from tracking service for potential cart creation
    /* if (event) {
      cartFromTrackingService.addTrackedProduct({
        productId,
        productName,
        category,
        price,
        timestamp: event.timestamp,
      });
    } */

    return event;
  }

  async trackWishlistAdd(productId: number, productName: string, category: string, price: number) {
    return this.trackEvent({
      event: 'add_to_wishlist',
      productId,
      productName,
      category,
      price,
      metadata: {
        source: 'product_card',
      },
    });
  }

  async trackProductClick(productId: number, productName: string, category: string, price: number) {
    return this.trackEvent({
      event: 'product_click',
      productId,
      productName,
      category,
      price,
    });
  }

  private storeEvent(event: TrackingEvent) {
    if (typeof window !== 'undefined') {
      const events = this.getStoredEvents();
      events.push(event);

      // Keep only last 100 events to avoid storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      localStorage.setItem('tracking_events', JSON.stringify(events));
    }
  }

  private getStoredEvents(): TrackingEvent[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tracking_events');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored events:', e);
        }
      }
    }
    return [];
  }

  getStoredEventsForDebug(): TrackingEvent[] {
    return this.getStoredEvents();
  }

  clearStoredEvents() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tracking_events');
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tracking_user_id', userId);
    }
  }
}

// Export singleton instance
export const trackingService = new TrackingService();

// Export hook for easy usage in components
export function useTracking() {
  return {
    trackAddToCart: trackingService.trackAddToCart.bind(trackingService),
    trackProductView: trackingService.trackProductView.bind(trackingService),
    trackWishlistAdd: trackingService.trackWishlistAdd.bind(trackingService),
    trackProductClick: trackingService.trackProductClick.bind(trackingService),
    getStoredEvents: trackingService.getStoredEventsForDebug.bind(trackingService),
    clearEvents: trackingService.clearStoredEvents.bind(trackingService),
  };
}
