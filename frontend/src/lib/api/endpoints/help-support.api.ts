import { request } from '../core/client';
import { ApiResponse } from '@/types/api';

export interface HelpLink {
  id: number;
  title: string;
  url: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConfig {
  id: number;
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  primaryColor: string;
  welcomeMessage: string;
  companyName: string;
  logoUrl?: string;
}

export interface FloatingButtonConfig {
  id: number;
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  iconType: 'chat' | 'question' | 'help';
  backgroundColor: string;
  iconColor: string;
}

export const helpSupportApi = {
  // Help Links
  getHelpLinks: (params?: { category?: string; active?: boolean }) =>
    request<ApiResponse<HelpLink[]>>({
      method: 'GET',
      url: '/v1/help/links',
      params,
    }),

  getHelpLink: (id: number) =>
    request<ApiResponse<HelpLink>>({
      method: 'GET',
      url: `/v1/help/links/${id}`,
    }),

  createHelpLink: (data: Omit<HelpLink, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<ApiResponse<HelpLink>>({
      method: 'POST',
      url: '/v1/help/links',
      data,
    }),

  updateHelpLink: (id: number, data: Partial<HelpLink>) =>
    request<ApiResponse<HelpLink>>({
      method: 'PUT',
      url: `/v1/help/links/${id}`,
      data,
    }),

  deleteHelpLink: (id: number) =>
    request<ApiResponse<void>>({
      method: 'DELETE',
      url: `/v1/help/links/${id}`,
    }),

  // Chat Configuration
  getChatConfig: () =>
    request<ApiResponse<ChatConfig>>({
      method: 'GET',
      url: '/v1/help/chat-config',
    }),

  updateChatConfig: (id: number, data: Partial<ChatConfig>) =>
    request<ApiResponse<ChatConfig>>({
      method: 'PUT',
      url: `/v1/help/chat-config/${id}`,
      data,
    }),

  createChatConfig: (data: Omit<ChatConfig, 'id'>) =>
    request<ApiResponse<ChatConfig>>({
      method: 'POST',
      url: '/v1/help/chat-config',
      data,
    }),

  deleteChatConfig: (id: number) =>
    request<ApiResponse<void>>({
      method: 'DELETE',
      url: `/v1/help/chat-config/${id}`,
    }),

  // Floating Button Configuration
  getFloatingButton: () =>
    request<ApiResponse<FloatingButtonConfig>>({
      method: 'GET',
      url: '/v1/help/floating-button',
    }),

  updateFloatingButton: (data: Partial<FloatingButtonConfig>) =>
    request<ApiResponse<FloatingButtonConfig>>({
      method: 'PUT',
      url: '/v1/help/floating-button',
      data,
    }),

  // FAQ
  getFaqs: (params?: { category?: string }) =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: '/v1/help/faqs',
      params,
    }),

  createFaq: (data: any) =>
    request<ApiResponse<any>>({
      method: 'POST',
      url: '/v1/help/faqs',
      data,
    }),

  updateFaq: (id: number, data: any) =>
    request<ApiResponse<any>>({
      method: 'PUT',
      url: `/v1/help/faqs/${id}`,
      data,
    }),

  deleteFaq: (id: number) =>
    request<ApiResponse<void>>({
      method: 'DELETE',
      url: `/v1/help/faqs/${id}`,
    }),
};
