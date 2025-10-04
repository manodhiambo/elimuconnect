import { apiClient } from '../../../lib/axios';

export const messageService = {
  getConversations: async () => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  },

  getConversation: async (partnerId: string, page = 0) => {
    const response = await apiClient.get(`/messages/conversation/${partnerId}`, {
      params: { page, size: 50 },
    });
    return response.data;
  },

  sendMessage: async (receiverId: string, content: string) => {
    const response = await apiClient.post('/messages/send', {
      receiverId,
      content,
    });
    return response.data;
  },

  markAsRead: async (partnerId: string) => {
    const response = await apiClient.post(`/messages/mark-read/${partnerId}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/messages/unread-count');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
};
