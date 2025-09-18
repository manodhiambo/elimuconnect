export interface User {
    _id?: string;
    email: string;
    phone?: string;
    password: string;
    role: UserRole;
    verified: boolean;
    profile: UserProfile;
    preferences: UserPreferences;
    verification?: UserVerification;
    progress?: UserProgress;
    createdAt?: Date;
    lastActive?: Date;
}
export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
    school?: string;
    level: EducationLevel;
    grade?: string;
    subjects: string[];
    bio?: string;
}
export interface UserPreferences {
    language: string;
    theme: string;
    notifications: NotificationSettings;
}
export interface UserVerification {
    studentId?: string;
    tscNumber?: string;
    adminCode?: string;
}
export interface UserProgress {
    totalPoints: number;
    badges: string[];
    streakDays: number;
    booksRead: number;
    testsCompleted: number;
}
export interface NotificationSettings {
    email: boolean;
    push: boolean;
    sms: boolean;
    digest: boolean;
}
export type UserRole = 'student' | 'teacher' | 'admin' | 'moderator';
export type EducationLevel = 'Primary' | 'Secondary' | 'Both';
export type KenyanCounty = 'Nairobi' | 'Mombasa' | 'Kwale' | 'Kilifi' | 'Tana River' | 'Lamu' | 'Taita-Taveta' | 'Garissa' | 'Wajir' | 'Mandera' | 'Marsabit' | 'Isiolo' | 'Meru' | 'Tharaka-Nithi' | 'Embu' | 'Kitui' | 'Machakos' | 'Makueni' | 'Nyandarua' | 'Nyeri' | 'Kirinyaga' | 'Murang\'a' | 'Kiambu' | 'Turkana' | 'West Pokot' | 'Samburu' | 'Trans-Nzoia' | 'Uasin Gishu' | 'Elgeyo-Marakwet' | 'Nandi' | 'Baringo' | 'Laikipia' | 'Nakuru' | 'Narok' | 'Kajiado' | 'Kericho' | 'Bomet' | 'Kakamega' | 'Vihiga' | 'Bungoma' | 'Busia' | 'Siaya' | 'Kisumu' | 'Homa Bay' | 'Migori' | 'Kisii' | 'Nyamira';
export type SchoolType = 'Public' | 'Private' | 'Faith-Based';
export interface School {
    _id?: string;
    name: string;
    code: string;
    level: EducationLevel;
    type: SchoolType;
    county: KenyanCounty;
    district: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    contact: {
        phone?: string;
        email?: string;
        address?: string;
    };
    verified: boolean;
    createdAt?: Date;
}
export interface Book {
    _id?: string;
    title: string;
    author: string;
    publisher: string;
    isbn?: string;
    subjects: string[];
    level: EducationLevel;
    grade: string;
    description?: string;
    coverImage?: string;
    fileUrl: string;
    fileSize: number;
    pages?: number;
    language: string;
    approved: boolean;
    downloadCount: number;
    rating: number;
    reviews: BookReview[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface BookReview {
    userId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
}
export interface PastPaper {
    _id?: string;
    title: string;
    subject: string;
    level: EducationLevel;
    grade: string;
    year: number;
    term?: number;
    examType: ExamType;
    fileUrl: string;
    markingSchemeUrl?: string;
    uploadedBy: string;
    approved: boolean;
    downloadCount: number;
    createdAt?: Date;
}
export type ExamType = 'KCPE' | 'KCSE' | 'Form1' | 'Form2' | 'Form3' | 'Form4' | 'Class1' | 'Class2' | 'Class3' | 'Class4' | 'Class5' | 'Class6' | 'Class7' | 'Class8' | 'Mid-term' | 'End-term' | 'Mock';
export interface Discussion {
    _id?: string;
    title: string;
    content: string;
    author: string;
    category: string;
    tags: string[];
    subject?: string;
    level?: EducationLevel;
    pinned: boolean;
    locked: boolean;
    views: number;
    upvotes: string[];
    downvotes: string[];
    replies: Reply[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Reply {
    _id?: string;
    content: string;
    author: string;
    parentId?: string;
    upvotes: string[];
    downvotes: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Message {
    _id?: string;
    sender: string;
    recipient: string;
    subject?: string;
    content: string;
    attachments: string[];
    read: boolean;
    readAt?: Date;
    createdAt?: Date;
}
export interface Quiz {
    _id?: string;
    title: string;
    description?: string;
    subject: string;
    level: EducationLevel;
    grade: string;
    questions: Question[];
    timeLimit?: number;
    attempts: QuizAttempt[];
    createdBy: string;
    isPublic: boolean;
    createdAt?: Date;
}
export interface Question {
    _id?: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points: number;
    difficulty: DifficultyLevel;
}
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export interface QuizAttempt {
    _id?: string;
    userId: string;
    quizId: string;
    answers: Answer[];
    score: number;
    totalPoints: number;
    timeSpent: number;
    completedAt: Date;
}
export interface Answer {
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
    points: number;
}
export interface StudyGroup {
    _id?: string;
    name: string;
    description?: string;
    subject: string;
    level: EducationLevel;
    grade?: string;
    members: string[];
    admins: string[];
    isPrivate: boolean;
    maxMembers?: number;
    createdBy: string;
    createdAt?: Date;
}
export type NotificationType = 'message' | 'forum_reply' | 'quiz_assigned' | 'assignment_due' | 'achievement_earned' | 'system_update' | 'study_group_invite';
export interface Notification {
    _id?: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    readAt?: Date;
    createdAt?: Date;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export interface ApiError {
    success: false;
    message: string;
    error?: string;
    errors?: ValidationError[];
}
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
