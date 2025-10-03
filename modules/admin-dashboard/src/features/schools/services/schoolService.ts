import { apiClient } from '@/lib/axios';
import { ApiResponse, School, PaginatedResponse } from '@/types';

export const schoolService = {
  getAllSchools: async (page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<School>>> => {
    const response = await apiClient.get('/api/v1/schools', {
      params: { page, size },
    });
    return response.data;
  },

  getSchoolById: async (id: string): Promise<ApiResponse<School>> => {
    const response = await apiClient.get(`/api/v1/schools/${id}`);
    return response.data;
  },

  createSchool: async (data: Partial<School>): Promise<ApiResponse<School>> => {
    const response = await apiClient.post('/api/admin/schools', data);
    return response.data;
  },

  updateSchool: async (id: string, data: Partial<School>): Promise<ApiResponse<School>> => {
    const response = await apiClient.put(`/api/admin/schools/${id}`, data);
    return response.data;
  },

  deleteSchool: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/admin/schools/${id}`);
    return response.data;
  },

  searchSchools: async (query: string): Promise<ApiResponse<School[]>> => {
    const response = await apiClient.get('/api/v1/schools/search', {
      params: { query },
    });
    return response.data;
  },
};
