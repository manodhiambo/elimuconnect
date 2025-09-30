import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add /api prefix to all auth endpoints
export const authAPI = {
  registerAdmin: (data: any) => api.post('/api/auth/register/admin', data),
  registerTeacher: (data: any) => api.post('/api/auth/register/teacher', data),
  registerStudent: (data: any) => api.post('/api/auth/register/student', data),
  login: (data: any) => api.post('/api/auth/login', data),
};

export const schoolsAPI = {
  search: (query: string) => api.get(`/api/schools/search?query=${query}`),
  getAll: () => api.get('/api/schools'),
};

export default api;
