import { apiClient } from '@/lib/axios';
import { ApiResponse, LoginRequest, User } from '@/types';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<string>> => {
    // backend expects { email, password }
    const response = await apiClient.post<ApiResponse<string>>('/api/auth/login', data);

    // save token in localStorage for admin
    const token = response.data.data;
    if (token) {
      localStorage.setItem('admin_token', token);
    }

    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
    });

    // also cache the user
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
