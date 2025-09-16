import { z } from 'zod';

// Create book schema
export const createBookSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Book title is required')
    .max(200, 'Book title must not exceed 200 characters'),
  
  authors: z.array(z.string().trim().min(1, 'Author name cannot be empty'))
    .min(1, 'At least one author is required'),
  
  isbn: z.string()
    .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Invalid ISBN format')
    .optional(),
  
  publisher: z.string()
    .trim()
    .min(1, 'Publisher is required')
    .max(100, 'Publisher name must not exceed 100 characters'),
  
  publishedYear: z.number()
    .int('Published year must be a whole number')
    .min(1000, 'Published year must be valid')
    .max(new Date().getFullYear() + 1, 'Published year cannot be in the future'),
  
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  category: z.enum([
    'textbook',
    'reference',
    'fiction',
    'non-fiction',
    'educational',
    'children',
    'academic',
    'other'
  ]),
  
  subject: z.string()
    .trim()
    .min(1, 'Subject is required')
    .max(50, 'Subject must not exceed 50 characters'),
  
  educationLevel: z.enum([
    'pre-primary',
    'primary',
    'secondary',
    'tertiary',
    'university',
    'college',
    'tvet',
    'all-levels'
  ]),
  
  grade: z.string()
    .trim()
    .optional(),
  
  language: z.enum(['english', 'swahili', 'french', 'arabic', 'other'])
    .default('english'),
  
  pageCount: z.number()
    .int('Page count must be a whole number')
    .min(1, 'Page count must be at least 1')
    .optional(),
  
  coverImageUrl: z.string()
    .url('Invalid cover image URL')
    .optional(),
  
  pdfUrl: z.string()
    .url('Invalid PDF URL')
    .optional(),
  
  tags: z.array(z.string().trim().min(1))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
});

// Update book schema
export const updateBookSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Book title is required')
    .max(200, 'Book title must not exceed 200 characters')
    .optional(),
  
  authors: z.array(z.string().trim().min(1))
    .min(1, 'At least one author is required')
    .optional(),
  
  isbn: z.string()
    .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Invalid ISBN format')
    .optional(),
  
  publisher: z.string()
    .trim()
    .min(1, 'Publisher is required')
    .max(100, 'Publisher name must not exceed 100 characters')
    .optional(),
  
  publishedYear: z.number()
    .int('Published year must be a whole number')
    .min(1000, 'Published year must be valid')
    .max(new Date().getFullYear() + 1, 'Published year cannot be in the future')
    .optional(),
  
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  
  category: z.enum([
    'textbook',
    'reference',
    'fiction',
    'non-fiction',
    'educational',
    'children',
    'academic',
    'other'
  ]).optional(),
  
  subject: z.string()
    .trim()
    .min(1, 'Subject is required')
    .max(50, 'Subject must not exceed 50 characters')
    .optional(),
  
  educationLevel: z.enum([
    'pre-primary',
    'primary',
    'secondary',
    'tertiary',
    'university',
    'college',
    'tvet',
    'all-levels'
  ]).optional(),
  
  grade: z.string()
    .trim()
    .optional(),
  
  language: z.enum(['english', 'swahili', 'french', 'arabic', 'other'])
    .optional(),
  
  pageCount: z.number()
    .int('Page count must be a whole number')
    .min(1, 'Page count must be at least 1')
    .optional(),
  
  coverImageUrl: z.string()
    .url('Invalid cover image URL')
    .optional(),
  
  pdfUrl: z.string()
    .url('Invalid PDF URL')
    .optional(),
  
  tags: z.array(z.string().trim().min(1))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
});

// Book search schema
export const bookSearchSchema = z.object({
  q: z.string()
    .trim()
    .min(1, 'Search query is required')
    .optional(),
  
  category: z.enum([
    'textbook',
    'reference',
    'fiction',
    'non-fiction',
    'educational',
    'children',
    'academic',
    'other'
  ]).optional(),
  
  subject: z.string().trim().optional(),
  
  educationLevel: z.enum([
    'pre-primary',
    'primary',
    'secondary',
    'tertiary',
    'university',
    'college',
    'tvet',
    'all-levels'
  ]).optional(),
  
  grade: z.string().trim().optional(),
  
  language: z.enum(['english', 'swahili', 'french', 'arabic', 'other']).optional(),
  
  publisher: z.string().trim().optional(),
  
  author: z.string().trim().optional(),
  
  publishedYear: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1000 && val <= new Date().getFullYear() + 1, 'Invalid year')
    .optional(),
  
  page: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Page must be positive')
    .optional(),
  
  limit: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional(),
  
  sortBy: z.enum(['title', 'author', 'publishedYear', 'createdAt', 'rating'])
    .optional(),
  
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
});

// Book review schema
export const bookReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  
  comment: z.string()
    .trim()
    .min(10, 'Review comment must be at least 10 characters')
    .max(1000, 'Review comment must not exceed 1000 characters'),
  
  anonymous: z.boolean()
    .default(false)
});

// Book request schema
export const bookRequestSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Book title is required')
    .max(200, 'Book title must not exceed 200 characters'),
  
  authors: z.array(z.string().trim().min(1))
    .min(1, 'At least one author is required'),
  
  isbn: z.string()
    .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Invalid ISBN format')
    .optional(),
  
  publisher: z.string()
    .trim()
    .optional(),
  
  subject: z.string()
    .trim()
    .min(1, 'Subject is required'),
  
  educationLevel: z.enum([
    'pre-primary',
    'primary',
    'secondary',
    'tertiary',
    'university',
    'college',
    'tvet',
    'all-levels'
  ]),
  
  grade: z.string()
    .trim()
    .optional(),
  
  reason: z.string()
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  
  priority: z.enum(['low', 'medium', 'high'])
    .default('medium')
});

// Book bookmark schema
export const bookmarkBookSchema = z.object({
  bookId: z.string()
    .min(1, 'Book ID is required')
});

// Book rating schema
export const rateBookSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
});
