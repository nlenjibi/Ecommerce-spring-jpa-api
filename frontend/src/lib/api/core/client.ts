/**
 * Main API Client Configuration
 */

import axios from 'axios';
import { setupInterceptors } from './interceptors';
import { API_BASE_URL } from '@/lib/constants/constants';
import { getApiErrorMessage } from '@/lib/utils/api-error';

/**
 * Main API client for authenticated requests
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Seller API client for seller-specific requests
 */
export const sellerApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// Setup interceptors for both clients
setupInterceptors(apiClient);
setupInterceptors(sellerApiClient);

/**
 * Generic API request function with better error handling
 */
export const request = async <T>(
  config: any,
  client: 'default' | 'seller' = 'default'
): Promise<T> => {
  const clientInstance = client === 'seller' ? sellerApiClient : apiClient;

  try {
    const response = await clientInstance.request<T>(config);
    return response.data;
  } catch (error: any) {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const message = getApiErrorMessage(error, 'Request failed');
      const serverError = {
        status: error.response.status,
        message,
        data: error.response.data,
        headers: error.response.headers,
      };
      throw serverError;
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error: No response received from server');
    } else {
      // Something else happened
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

/**
 * Seller-specific request function
 */
export const sellerRequest = async <T>(config: any): Promise<T> => {
  return request<T>(config, 'seller');
};

/**
 * Public API client (no authentication required)
 */
const unwrapApiPayload = <T>(response: any): T => {
  if (response?.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

const asArray = <T>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

type PublicApiClient = typeof apiClient & {
  getSocialLinks: () => Promise<{ socialLinks: any[] }>;
  getAppDownloadLinks: () => Promise<{ appDownloadLinks: any[] }>;
  getHelpSupportSettings: () => Promise<{
    helpLinks: any[];
    chatConfigs: any[];
    floatingButtonEnabled: boolean;
    floatingButtonPosition: 'bottom-left' | 'bottom-right';
  }>;
};

export const publicApi = apiClient as PublicApiClient;

publicApi.getSocialLinks = async () => {
  try {
    const response = await request<any>({
      method: 'GET',
      url: '/v1/social-links',
      suppressErrorLog: true,
    });
    const payload = unwrapApiPayload<any>(response);
    return {
      socialLinks: asArray(payload?.socialLinks ?? payload),
    };
  } catch {
    return { socialLinks: [] };
  }
};

publicApi.getAppDownloadLinks = async () => {
  try {
    const response = await request<any>({
      method: 'GET',
      url: '/v1/app-download-links',
      suppressErrorLog: true,
    });
    const payload = unwrapApiPayload<any>(response);
    return {
      appDownloadLinks: asArray(payload?.appDownloadLinks ?? payload),
    };
  } catch {
    return { appDownloadLinks: [] };
  }
};

publicApi.getHelpSupportSettings = async () => {
  const [helpLinksResult, chatConfigResult, floatingButtonResult] = await Promise.allSettled([
    request<any>({ method: 'GET', url: '/v1/help/links', suppressErrorLog: true }),
    request<any>({ method: 'GET', url: '/v1/help/chat-config', suppressErrorLog: true }),
    request<any>({ method: 'GET', url: '/v1/help/floating-button', suppressErrorLog: true }),
  ]);

  const helpLinks =
    helpLinksResult.status === 'fulfilled'
      ? asArray(unwrapApiPayload<any>(helpLinksResult.value))
      : [];

  const chatConfigPayload =
    chatConfigResult.status === 'fulfilled'
      ? unwrapApiPayload<any>(chatConfigResult.value)
      : null;
  const floatingButtonPayload =
    floatingButtonResult.status === 'fulfilled'
      ? unwrapApiPayload<any>(floatingButtonResult.value)
      : null;

  return {
    helpLinks,
    chatConfigs: chatConfigPayload ? asArray(chatConfigPayload) : [],
    floatingButtonEnabled: floatingButtonPayload?.enabled ?? true,
    floatingButtonPosition: floatingButtonPayload?.position ?? 'bottom-right',
  };
};

/**
 * Admin API client (with authentication)
 */
type AdminApiClient = typeof apiClient & {
  updateSocialLink: (platform: string, data: { url: string | null; isActive: boolean }) => Promise<{ socialLink: any }>;
  updateAppDownloadLink: (platform: string, data: { url: string | null; isActive: boolean }) => Promise<{ appDownloadLink: any }>;
};

export const adminApi = apiClient as AdminApiClient;

adminApi.updateSocialLink = async (platform, data) => {
  const response = await request<any>({
    method: 'PUT',
    url: `/v1/admin/social-links/${platform}`,
    data,
  });
  const payload = unwrapApiPayload<any>(response);
  return {
    socialLink: payload?.socialLink ?? payload,
  };
};

adminApi.updateAppDownloadLink = async (platform, data) => {
  const response = await request<any>({
    method: 'PUT',
    url: `/v1/admin/app-download-links/${platform}`,
    data,
  });
  const payload = unwrapApiPayload<any>(response);
  return {
    appDownloadLink: payload?.appDownloadLink ?? payload,
  };
};

export default apiClient;
