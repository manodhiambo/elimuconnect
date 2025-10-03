import { apiClient } from '../../../lib/axios';

export const schoolService = {
  getAllSchools: async () => {
    const response = await apiClient.get('/schools');
    return response.data;
  },

  searchSchools: async (query: string) => {
    const response = await apiClient.get(`/schools/search?q=${query}`);
    return response.data;
  },

  getSchoolById: async (id: string) => {
    const response = await apiClient.get(`/schools/${id}`);
    return response.data;
  },
};
