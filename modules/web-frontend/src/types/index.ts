// User Types
export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  TEACHER = 'ROLE_TEACHER',
  STUDENT = 'ROLE_STUDENT',
  PARENT = 'ROLE_PARENT'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
  profilePictureUrl?: string;
  
  // Teacher fields
  tscNumber?: string;
  schoolId?: string;
  subjectsTaught?: string[];
  classesAssigned?: string[];
  qualification?: string;
  
  // Student fields
  admissionNumber?: string;
  className?: string;
  dateOfBirth?: string;
  parentGuardianContact?: string;
  countyOfResidence?: string;
  
  // Parent fields
  nationalId?: string;
  childrenAdmissionNumbers?: string[];
  relationshipToChildren?: string;
  address?: string;
  
  // Admin fields
  institutionId?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Registration Requests
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

export interface LoginRequest {
  email: string;
  password: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

// Content Types
export interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSizeBytes: number;
  mimeType: string;
  
  // Curriculum
  subject: string;
  grade: string;
  learningAreas?: string[];
  strands?: string[];
  subStrands?: string[];
  learningOutcomes?: string[];
  
  // Publisher
  publisher?: string;
  isbn?: string;
  edition?: string;
  publishedYear?: string;
  isPublisherContent: boolean;
  
  // Metadata
  author?: string;
  uploadedBy: string;
  language: string;
  tags?: string[];
  difficultyLevel?: string;
  estimatedDurationMinutes?: number;
  
  // Engagement
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  
  // Access
  accessLevel: string;
  allowedSchoolIds?: string[];
  allowedGrades?: string[];
  
  // Status
  published: boolean;
  featured: boolean;
  publishedAt?: string;
  approved: boolean;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
