import { apiClient } from '@/lib/axios';
import { ApiResponse, User, PaginatedResponse } from '@/types';

export const userService = {
  getPendingUsers: async (page = 0, size = 20): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get('/api/admin/users/pending', {
      params: { page, size },
    });
    return response.data;
  },

  getAllUsers: async (page = 0, size = 20, role?: string): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get('/api/admin/users', {
      params: { page, size, role },
    });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  approveUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.post(`/api/admin/users/${id}/approve`);
    return response.data;
  },

  rejectUser: async (id: string, reason: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/api/admin/users/${id}/reject`, { reason });
    return response.data;
  },

  deactivateUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.post(`/api/admin/users/${id}/deactivate`);
    return response.data;
  },

  activateUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.post(`/api/admin/users/${id}/activate`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },
};
