import { apiClient } from '@/lib/axios';
import { ApiResponse, Content, PaginatedResponse } from '@/types';

export const contentService = {
  getAllContent: async (page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<Content>>> => {
    const response = await apiClient.get('/api/admin/content', {
      params: { page, size },
    });
    return response.data;
  },

  getPendingContent: async (page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<Content>>> => {
    const response = await apiClient.get('/api/admin/content/pending', {
      params: { page, size },
    });
    return response.data;
  },

  getContentById: async (id: string): Promise<ApiResponse<Content>> => {
    const response = await apiClient.get(`/api/admin/content/${id}`);
    return response.data;
  },

  uploadContent: async (formData: FormData): Promise<ApiResponse<Content>> => {
    const response = await apiClient.post('/api/admin/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  approveContent: async (id: string): Promise<ApiResponse<Content>> => {
    const response = await apiClient.post(`/api/admin/content/${id}/approve`);
    return response.data;
  },

  rejectContent: async (id: string, reason: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/api/admin/content/${id}/reject`, { reason });
    return response.data;
  },

  publishContent: async (id: string): Promise<ApiResponse<Content>> => {
    const response = await apiClient.post(`/api/admin/content/${id}/publish`);
    return response.data;
  },

  unpublishContent: async (id: string): Promise<ApiResponse<Content>> => {
    const response = await apiClient.post(`/api/admin/content/${id}/unpublish`);
    return response.data;
  },

  deleteContent: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/admin/content/${id}`);
    return response.data;
  },

  updateContent: async (id: string, data: Partial<Content>): Promise<ApiResponse<Content>> => {
    const response = await apiClient.put(`/api/admin/content/${id}`, data);
    return response.data;
  },
};
