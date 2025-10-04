import { apiClient } from '../../../lib/axios';
import { ApiResponse, Page } from '../../../types';

export interface Question {
  id: string;
  text: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options: string[];
  correctAnswer?: string;
  marks: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  teacherId: string;
  teacherName: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
  createdAt: string;
  startDate: string;
  endDate: string;
  published: boolean;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string>;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
  status: string;
}

export const assessmentService = {
  getAssessments: async (page = 0, size = 20): Promise<ApiResponse<Page<Assessment>>> => {
    const response = await apiClient.get('/assessments', {
      params: { page, size },
    });
    return response.data;
  },

  filterAssessments: async (subject: string, grade: string, page = 0): Promise<ApiResponse<Page<Assessment>>> => {
    const response = await apiClient.get('/assessments/filter', {
      params: { subject, grade, page, size: 20 },
    });
    return response.data;
  },

  getAssessment: async (id: string): Promise<ApiResponse<Assessment>> => {
    const response = await apiClient.get(`/assessments/${id}`);
    return response.data;
  },

  submitAssessment: async (id: string, answers: Record<string, string>): Promise<ApiResponse<AssessmentSubmission>> => {
    const response = await apiClient.post(`/assessments/${id}/submit`, answers);
    return response.data;
  },

  getMySubmissions: async (): Promise<ApiResponse<AssessmentSubmission[]>> => {
    const response = await apiClient.get('/assessments/my-submissions');
    return response.data;
  },

  getMyProgress: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/assessments/my-progress');
    return response.data;
  },

  createAssessment: async (data: Partial<Assessment>): Promise<ApiResponse<Assessment>> => {
    const response = await apiClient.post('/assessments', data);
    return response.data;
  },
};
