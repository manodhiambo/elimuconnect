import { apiClient } from '@/lib/axios';
import { ApiResponse, DashboardStats } from '@/types';

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get('/api/admin/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async (limit = 10): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/api/admin/dashboard/activity', {
      params: { limit },
    });
    return response.data;
  },
};
