import { apiClient } from '../../../lib/axios';
import { ApiResponse } from '../../../types';

export interface School {
  id: string;
  name: string;
  nemisCode: string;
  type: string;
  county: string;
  active: boolean;
}

export const schoolService = {
  getAllSchools: async (): Promise<ApiResponse<School[]>> => {
    const response = await apiClient.get('/schools');
    return response.data;
  },

  searchSchools: async (query: string): Promise<ApiResponse<School[]>> => {
    const response = await apiClient.get('/schools/search', {
      params: { query },
    });
    return response.data;
  },
};
