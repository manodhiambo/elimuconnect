import { z } from 'zod';

// Password validation schema with strong requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation schema
const emailSchema = z.string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

// Phone number validation schema (Kenya format)
const phoneSchema = z.string()
  .regex(/^(?:\+254|254|0)?([17]\d{8})$/, 'Invalid Kenyan phone number format')
  .optional();

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .trim(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .trim(),
  role: z.enum(['student', 'teacher', 'admin', 'school_admin']).default('student'),
  school: z.string().optional(),
  phoneNumber: phoneSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    deviceId: z.string().optional()
  }).optional()
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: emailSchema.optional()
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Two-factor authentication setup schema
export const setupTwoFactorSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  method: z.enum(['sms', 'email', 'app']).default('email')
});

// Two-factor authentication verify schema
export const verifyTwoFactorSchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
  method: z.enum(['sms', 'email', 'app']).default('email'),
  rememberDevice: z.boolean().default(false)
});

// Social login schema
export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'facebook', 'apple']),
  accessToken: z.string().min(1, 'Access token is required'),
  idToken: z.string().optional(),
  email: emailSchema.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().url().optional()
});

// Account deactivation schema
export const deactivateAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  reason: z.enum([
    'temporary_break',
    'privacy_concerns',
    'too_many_notifications',
    'found_alternative',
    'technical_issues',
    'other'
  ]),
  feedback: z.string().max(500, 'Feedback must not exceed 500 characters').optional()
});

// Device management schemas
export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  deviceType: z.enum(['mobile', 'tablet', 'desktop', 'laptop']),
  platform: z.enum(['ios', 'android', 'windows', 'macos', 'linux', 'web']),
  pushToken: z.string().optional(),
  userAgent: z.string().optional()
});

export const removeDeviceSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  password: z.string().min(1, 'Password is required for security')
});

// Security settings schema
export const updateSecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  twoFactorMethod: z.enum(['sms', 'email', 'app']).optional(),
  loginNotifications: z.boolean().default(true),
  suspiciousActivityAlerts: z.boolean().default(true),
  sessionTimeout: z.number().min(15).max(1440).default(60), // minutes
  allowMultipleSessions: z.boolean().default(true)
});

// Password strength checker utility function
export const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    common: !['password', '12345678', 'qwerty', 'abc123'].includes(password.toLowerCase())
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    score,
    strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong',
    checks
  };
};

// Rate limiting schemas
export const rateLimitBypassSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  reason: z.string().min(1, 'Bypass reason is required')
});

// Export all schemas as default for convenience
export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema,
  setupTwoFactorSchema,
  verifyTwoFactorSchema,
  socialLoginSchema,
  deactivateAccountSchema,
  registerDeviceSchema,
  removeDeviceSchema,
  updateSecuritySettingsSchema,
  rateLimitBypassSchema,
  checkPasswordStrength
};
