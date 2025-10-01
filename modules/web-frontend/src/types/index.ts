export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active?: boolean;
  emailVerified?: boolean;
  phoneNumber?: string;
  profilePictureUrl?: string;
  
  // Teacher-specific
  tscNumber?: string;
  schoolId?: string;
  subjectsTaught?: string[];
  classesAssigned?: string[];
  qualification?: string;
  
  // Student-specific
  admissionNumber?: string;
  className?: string;
  dateOfBirth?: string;
  parentGuardianContact?: string;
  countyOfResidence?: string;
  
  // Parent-specific
  nationalId?: string;
  childrenAdmissionNumbers?: string[];
  relationshipToChildren?: string;
  address?: string;
  
  // Admin-specific
  institutionId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminRegistrationRequest {
  name: string;
  email: string;
  password: string;
  adminCode: string;
  institutionId: string;
}

export interface TeacherRegistrationRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  tscNumber: string;
  schoolId: string;
  subjectsTaught: string[];
  classesAssigned: string[];
  qualification: string;
}

export interface StudentRegistrationRequest {
  name: string;
  email: string;
  password: string;
  admissionNumber: string;
  schoolId: string;
  className: string;
  dateOfBirth: string;
  parentGuardianContact: string;
  countyOfResidence: string;
}

export interface ParentRegistrationRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  nationalId: string;
  childrenAdmissionNumbers: string[];
  relationshipToChildren: string;
  address: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  subject: string;
  grade: string;
  author: string;
  published: boolean;
  createdAt: string;
  viewCount?: number;
  downloadCount?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
