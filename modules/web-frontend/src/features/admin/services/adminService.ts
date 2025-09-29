import { apiClient } from '../../../lib/axios';
import { User, ApiResponse } from '../../../types';

export const adminService = {
  getPendingUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/admin/users/pending');
    return response.data;
  },

  approveUser: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/admin/users/${userId}/approve`);
    return response.data;
  },

  rejectUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/admin/users/${userId}/reject`);
    return response.data;
  },

  syncPublishers: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/admin/sync-publishers');
    return response.data;
  },
};
