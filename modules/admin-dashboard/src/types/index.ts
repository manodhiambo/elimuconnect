export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  TEACHER = 'ROLE_TEACHER',
  STUDENT = 'ROLE_STUDENT',
  PARENT = 'ROLE_PARENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
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
  
  // Audit
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface School {
  id: string;
  nemisCode: string;
  name: string;
  type: string;
  category: string;
  county: string;
  subCounty: string;
  ward: string;
  location: string;
  phoneNumber: string;
  email: string;
  principalName: string;
  principalContact: string;
  grades: string[];
  streams: string[];
  totalStudents: number;
  totalTeachers: number;
  hasElectricity: boolean;
  hasInternet: boolean;
  hasComputerLab: boolean;
  hasLibrary: boolean;
  numberOfComputers: number;
  active: boolean;
  subscriptionTier: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSizeBytes: number;
  mimeType: string;
  subject: string;
  grade: string;
  learningAreas: string[];
  strands: string[];
  subStrands: string[];
  learningOutcomes: string[];
  author: string;
  publisher?: string;
  language: string;
  tags: string[];
  difficultyLevel: string;
  estimatedDurationMinutes: number;
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  accessLevel: string;
  allowedSchoolIds: string[];
  allowedGrades: string[];
  published: boolean;
  featured: boolean;
  publishedAt?: string;
  offlineAvailable: boolean;
  offlinePackageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  totalSchools: number;
  totalContent: number;
  activeUsers: number;
  newRegistrationsToday: number;
}
