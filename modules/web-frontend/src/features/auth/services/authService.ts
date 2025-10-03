import { apiClient } from '../../../lib/axios';
import {
  AdminRegistrationRequest,
  TeacherRegistrationRequest,
  StudentRegistrationRequest,
  ParentRegistrationRequest,
  LoginRequest,
  ApiResponse,
  User
} from '../../../types';

export const authService = {
  registerAdmin: async (data: AdminRegistrationRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/register/admin', data);
    return response.data;
  },

  registerTeacher: async (data: TeacherRegistrationRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/register/teacher', data);
    return response.data;
  },

  registerStudent: async (data: StudentRegistrationRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/register/student', data);
    return response.data;
  },

  registerParent: async (data: ParentRegistrationRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/auth/register/parent', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
