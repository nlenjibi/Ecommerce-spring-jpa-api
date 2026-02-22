import { request } from '../core/client';
import { ApiResponse } from '@/types/api';

/**
 * Newsletter API
 */
export const newsletterApi = {
  /**
   * Subscribe to newsletter
   */
  subscribe: (email: string) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/api/v1/newsletter/subscribe',
      data: { email },
    }),

  /**
   * Unsubscribe from newsletter
   */
  unsubscribe: (email: string) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/api/v1/newsletter/unsubscribe',
      data: { email },
    }),

  /**
   * Get subscriber status
   */
  getStatus: (email: string) =>
    request<ApiResponse<{ subscribed: boolean }>>({
      method: 'GET',
      url: `/api/v1/newsletter/status?email=${encodeURIComponent(email)}`,
    }),
};
