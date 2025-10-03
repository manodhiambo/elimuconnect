import { apiClient } from '@/lib/axios';
import { ApiResponse, LoginRequest, User } from '@/types';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },
};
