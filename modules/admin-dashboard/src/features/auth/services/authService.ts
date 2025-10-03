import { apiClient } from '@/lib/axios';
import { ApiResponse, LoginRequest, User } from '@/types';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/auth/login', data);
    const token = response.data.data;
    if (token) {
      localStorage.setItem('admin_token', token);
    }
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (response.data.data) {
      localStorage.setItem('admin_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
};
