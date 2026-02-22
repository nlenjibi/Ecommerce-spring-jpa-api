import { request } from '../core/client';
import { ApiResponse } from '@/types/api';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'READ' | 'REPLIED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactApi = {
  /**
   * Get all contact messages
   */
  getMessages: (params?: { page?: number; size?: number; status?: string }) =>
    request<ApiResponse<any>>({
      method: 'GET',
      url: '/api/v1/contact/messages',
      params,
    }),

  /**
   * Get contact message by ID
   */
  getMessage: (id: number) =>
    request<ApiResponse<ContactMessage>>({
      method: 'GET',
      url: `/api/v1/contact/messages/${id}`,
    }),

  /**
   * Submit a new contact message
   */
  submitMessage: (data: ContactMessageRequest) =>
    request<ApiResponse<ContactMessage>>({
      method: 'POST',
      url: '/api/v1/contact/messages',
      data,
    }),

  /**
   * Update contact message status
   */
  updateMessageStatus: (id: number, status: string) =>
    request<ApiResponse<ContactMessage>>({
      method: 'PATCH',
      url: `/api/v1/contact/messages/${id}/status`,
      data: { status },
    }),

  /**
   * Delete contact message
   */
  deleteMessage: (id: number) =>
    request<ApiResponse<void>>({
      method: 'DELETE',
      url: `/api/v1/contact/messages/${id}`,
    }),

  /**
   * Reply to contact message
   */
  replyToMessage: (id: number, reply: string) =>
    request<ApiResponse<ContactMessage>>({
      method: 'POST',
      url: `/api/v1/contact/messages/${id}/reply`,
      data: { reply },
    }),
};
