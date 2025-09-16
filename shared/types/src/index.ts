// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  school?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'school_admin';

export type EducationLevel =
  | 'pre-primary'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'university'
  | 'college'
  | 'tvet';

// School Types (aligned to model + controller)
export interface School {
  id: string;
  name: string;
  nemisCode: string; // added to align with model/controller
  type?: SchoolType;
  educationLevels: EducationLevel[]; // renamed from `level` to `educationLevels`
  county: KenyanCounty;
  district?: string;
  location?: {
    county?: string;
    subcounty?: string;
    ward?: string;
    address?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  createdBy?: string; // user id who created the school
  isVerified: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SchoolType =
  | 'public'
  | 'private'
  | 'community'
  | 'faith-based'
  | 'special-needs'
  | 'boarding'
  | 'day'
  | 'mixed';

// Book Types
export interface Book {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  isbn?: string;
  subject: Subject;
  level: EducationLevel;
  language: Language;
  description: string;
  coverImage?: string;
  fileUrl?: string;
  fileSize?: number;
  pageCount?: number;
  publishedDate?: Date;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Paper Types
export interface PastPaper {
  id: string;
  title: string;
  subject: Subject;
  examBoard: ExamBoard;
  year: number;
  term: Term;
  level: EducationLevel;
  duration: number; // in minutes
  totalMarks: number;
  difficulty: Difficulty;
  paperType: PaperType;
  fileUrl?: string;
  markingSchemeUrl?: string;
  instructions?: string;
  downloadCount: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ExamBoard = 'KNEC' | 'UACE' | 'IGCSE' | 'IB' | 'Other';
export type Term = '1' | '2' | '3' | 'annual';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PaperType = 'examination' | 'revision' | 'practice' | 'mock';

// Discussion Types
export interface Discussion {
  id: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  subject?: Subject;
  level?: EducationLevel;
  authorId: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  isResolved: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DiscussionCategory =
  | 'general'
  | 'academic'
  | 'homework-help'
  | 'exam-prep'
  | 'career-guidance'
  | 'study-tips'
  | 'announcements';

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  attachments: Attachment[];
  isRead: boolean;
  isEdited: boolean;
  replyTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video';

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

// Study Group Types
export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: Subject;
  level: EducationLevel;
  creatorId: string;
  members: string[];
  maxMembers: number;
  isPrivate: boolean;
  inviteCode?: string;
  settings: StudyGroupSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyGroupSettings {
  allowMemberInvites: boolean;
  requireApproval: boolean;
  allowFileSharing: boolean;
  allowDiscussions: boolean;
}

// Progress Types
export interface Progress {
  id: string;
  userId: string;
  totalStudyTime: number; // in minutes
  level: number;
  experiencePoints: number;
  streak: number;
  longestStreak: number;
  booksCompleted: number;
  quizzesCompleted: number;
  papersAttempted: number;
  averageScore: number;
  achievements: Achievement[];
  lastStudyDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: AchievementType;
  points: number;
  earnedAt: Date;
}

export type AchievementType =
  | 'milestone'
  | 'streak'
  | 'performance'
  | 'social'
  | 'special';

// Subject Types - Kenyan Curriculum
export type Subject =
  // Primary Subjects
  | 'english'
  | 'kiswahili'
  | 'mathematics'
  | 'science-and-technology'
  | 'social-studies'
  | 'creative-arts'
  | 'physical-education'
  | 'home-science'
  | 'agriculture'
  | 'religious-education'
  // Secondary Subjects
  | 'biology'
  | 'chemistry'
  | 'physics'
  | 'geography'
  | 'history'
  | 'government'
  | 'business-studies'
  | 'accounting'
  | 'economics'
  | 'computer-studies'
  | 'art-and-design'
  | 'music'
  | 'woodwork'
  | 'metalwork'
  | 'building-construction'
  | 'power-mechanics'
  | 'electricity'
  | 'clothing-and-textiles'
  | 'food-and-nutrition'
  | 'beauty-and-hairdressing'
  | 'agriculture-and-nutrition'
  // Languages
  | 'french'
  | 'german'
  | 'arabic'
  | 'sign-language'
  // Vocational
  | 'artisan'
  | 'craft'
  | 'diploma';

// Language Types
export type Language = 'english' | 'kiswahili' | 'french' | 'german' | 'arabic';

// Kenyan Counties
export type KenyanCounty =
  | 'baringo'
  | 'bomet'
  | 'bungoma'
  | 'busia'
  | 'elgeyo-marakwet'
  | 'embu'
  | 'garissa'
  | 'homa-bay'
  | 'isiolo'
  | 'kajiado'
  | 'kakamega'
  | 'kericho'
  | 'kiambu'
  | 'kilifi'
  | 'kirinyaga'
  | 'kisii'
  | 'kisumu'
  | 'kitui'
  | 'kwale'
  | 'laikipia'
  | 'lamu'
  | 'machakos'
  | 'makueni'
  | 'mandera'
  | 'marsabit'
  | 'meru'
  | 'migori'
  | 'mombasa'
  | 'murang\'a'
  | 'nairobi'
  | 'nakuru'
  | 'nandi'
  | 'narok'
  | 'nyamira'
  | 'nyandarua'
  | 'nyeri'
  | 'samburu'
  | 'siaya'
  | 'taita-taveta'
  | 'tana-river'
  | 'tharaka-nithi'
  | 'trans-nzoia'
  | 'turkana'
  | 'uasin-gishu'
  | 'vihiga'
  | 'wajir'
  | 'west-pokot';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  school?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
  createdAt: Date;
}

export type NotificationType =
  | 'message'
  | 'discussion_reply'
  | 'quiz_result'
  | 'achievement'
  | 'follow'
  | 'study_group'
  | 'book_recommendation'
  | 'paper_reminder'
  | 'system'
  | 'assignment'
  | 'exam';

// Search Types
export interface SearchFilters {
  query?: string;
  subject?: Subject;
  level?: EducationLevel;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// File Upload Types
export interface FileUpload {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Analytics Types
export interface UserAnalytics {
  totalStudyTime: number;
  booksRead: number;
  quizzesCompleted: number;
  averageScore: number;
  streak: number;
  level: number;
  points: number;
}

// Error Types
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    details?: any;
  };
}
