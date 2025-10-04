import { apiClient } from '../../../lib/axios';
import { ApiResponse, Message } from '../../../types';

export const messageService = {
  getConversations: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  },

  getConversation: async (partnerId: string, page = 0): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/messages/conversation/${partnerId}`, {
      params: { page, size: 50 },
    });
    return response.data;
  },

  sendMessage: async (receiverId: string, content: string): Promise<ApiResponse<Message>> => {
    const response = await apiClient.post('/messages/send', {
      receiverId,
      content,
    });
    return response.data;
  },

  markAsRead: async (partnerId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/messages/mark-read/${partnerId}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await apiClient.get('/messages/unread-count');
    return response.data;
  },
};
