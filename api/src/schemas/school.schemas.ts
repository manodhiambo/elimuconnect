import { z } from 'zod';

// Create school schema
export const createSchoolSchema = z.object({
  name: z.string()
    .trim()
    .min(3, 'School name must be at least 3 characters')
    .max(100, 'School name must not exceed 100 characters'),
  
  code: z.string()
    .regex(/^\d{8}$/, 'NEMIS code must be exactly 8 digits'),
  
  level: z.array(
    z.enum(['pre-primary', 'primary', 'secondary', 'tertiary', 'university', 'college', 'tvet'])
  ).min(1, 'At least one education level is required'),
  
  county: z.string().min(2, 'County is required'),
  
  district: z.string()
    .trim()
    .min(2, 'District must be at least 2 characters')
    .max(50, 'District must not exceed 50 characters'),
  
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  }).optional(),
  
  contact: z.object({
    phone: z.string()
      .regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number')
      .optional(),
    email: z.string().email('Please enter a valid email address').optional(),
    address: z.string().max(200, 'Address must not exceed 200 characters').optional()
  }).optional()
});

// Update school schema
export const updateSchoolSchema = z.object({
  name: z.string()
    .trim()
    .min(3, 'School name must be at least 3 characters')
    .max(100, 'School name must not exceed 100 characters')
    .optional(),
  
  level: z.array(
    z.enum(['pre-primary', 'primary', 'secondary', 'tertiary', 'university', 'college', 'tvet'])
  ).min(1, 'At least one education level is required').optional(),
  
  county: z.string().min(2, 'County is required').optional(),
  
  district: z.string()
    .trim()
    .min(2, 'District must be at least 2 characters')
    .max(50, 'District must not exceed 50 characters')
    .optional(),
  
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  }).optional(),
  
  contact: z.object({
    phone: z.string()
      .regex(/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number')
      .optional(),
    email: z.string().email('Please enter a valid email address').optional(),
    address: z.string().max(200, 'Address must not exceed 200 characters').optional()
  }).optional()
});

// School search schema
export const schoolSearchSchema = z.object({
  q: z.string()
    .trim()
    .min(2, 'Search query must be at least 2 characters')
    .optional(),
  
  county: z.string().optional(),
  
  level: z.enum(['pre-primary', 'primary', 'secondary', 'tertiary', 'university', 'college', 'tvet']).optional(),
  
  page: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be positive')
    .optional(),
  
  limit: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional()
});

// School verification schema
export const verifySchoolSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
  verificationData: z.object({
    documents: z.array(z.string()).optional(),
    notes: z.string().optional()
  }).optional()
});

// Get school by ID schema
export const getSchoolByIdSchema = z.object({
  id: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid school ID format')
});

// Join school schema
export const joinSchoolSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
  role: z.enum(['student', 'teacher']).optional(),
  verificationCode: z.string().optional()
});
