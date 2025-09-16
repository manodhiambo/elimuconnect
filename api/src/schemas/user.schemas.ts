import { z } from 'zod';

// Basic user profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .optional(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  school: z.string().optional(),
  level: z.enum(['pre-primary', 'primary', 'secondary', 'tertiary', 'university', 'college', 'tvet']).optional(),
  grade: z.string().min(1, 'Grade is required').optional(),
  subjects: z.array(z.string()).optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
});

// User settings update schema
export const updateSettingsSchema = z.object({
  language: z.enum(['en', 'sw']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional()
  }).optional()
});

// User preferences update schema (more comprehensive)
export const updatePreferencesSchema = z.object({
  language: z.enum(['en', 'sw']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional()
  }).optional(),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']).optional(),
    showEmail: z.boolean().optional(),
    showPhone: z.boolean().optional()
  }).optional(),
  learning: z.object({
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    studyReminders: z.boolean().optional(),
    dailyGoal: z.number().min(1).max(24).optional()
  }).optional()
});

// User search/filter schema
export const userSearchSchema = z.object({
  query: z.string().optional(),
  role: z.enum(['student', 'teacher', 'admin', 'school_admin']).optional(),
  school: z.string().optional(),
  level: z.enum(['pre-primary', 'primary', 'secondary', 'tertiary', 'university', 'college', 'tvet']).optional(),
  verified: z.boolean().optional(),
  page: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0, 'Page must be positive').optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'firstName', 'lastName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Delete account schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE', { errorMap: () => ({ message: 'You must type DELETE to confirm' }) }),
  reason: z.string().optional()
});

// Block/unblock user schema
export const blockUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().optional()
});
