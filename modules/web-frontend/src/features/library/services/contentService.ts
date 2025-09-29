import { apiClient } from '../../../lib/axios';
import { Content, ApiResponse, Page } from '../../../types';

export const contentService = {
  getAllContent: async (page = 0, size = 20): Promise<ApiResponse<Page<Content>>> => {
    const response = await apiClient.get('/content', {
      params: { page, size, sortBy: 'createdAt', direction: 'DESC' },
    });
    return response.data;
  },

  searchContent: async (query: string, page = 0, size = 20): Promise<ApiResponse<Page<Content>>> => {
    const response = await apiClient.get('/content/search', {
      params: { query, page, size },
    });
    return response.data;
  },

  filterContent: async (
    subject: string,
    grade: string,
    page = 0,
    size = 20
  ): Promise<ApiResponse<Page<Content>>> => {
    const response = await apiClient.get('/content/filter', {
      params: { subject, grade, page, size },
    });
    return response.data;
  },

  uploadFile: async (file: File, category: string): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await apiClient.post('/content/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadContent: async (data: any): Promise<ApiResponse<Content>> => {
    const response = await apiClient.post('/content/upload', data);
    return response.data;
  },

  getMyContent: async (): Promise<ApiResponse<Content[]>> => {
    const response = await apiClient.get('/content/my-content');
    return response.data;
  },

  deleteContent: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/content/${id}`);
    return response.data;
  },
};
