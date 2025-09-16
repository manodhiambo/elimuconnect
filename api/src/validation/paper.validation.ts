import { body, param, query } from 'express-validator';

// Validation rules for creating a paper
export const validateCreatePaper = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .isIn(['Primary', 'Secondary', 'University', 'Professional'])
    .withMessage('Level must be one of: Primary, Secondary, University, Professional'),
  
  body('examType')
    .notEmpty()
    .withMessage('Exam type is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Exam type must be between 2 and 50 characters'),
  
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  body('term')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Term cannot exceed 50 characters'),
  
  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('File URL must be a valid URL'),
  
  body('uploadedBy')
    .notEmpty()
    .withMessage('Uploaded by is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Uploaded by must be between 2 and 100 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

// Validation rules for updating a paper
export const validateUpdatePaper = [
  param('id')
    .notEmpty()
    .withMessage('Paper ID is required'),
  
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('subject')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('level')
    .optional()
    .isIn(['Primary', 'Secondary', 'University', 'Professional'])
    .withMessage('Level must be one of: Primary, Secondary, University, Professional'),
  
  body('examType')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Exam type must be between 2 and 50 characters'),
  
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  body('term')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Term cannot exceed 50 characters'),
  
  body('fileUrl')
    .optional()
    .isURL()
    .withMessage('File URL must be a valid URL'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

// Validation rules for getting a paper by ID
export const validateGetPaperById = [
  param('id')
    .notEmpty()
    .withMessage('Paper ID is required')
];

// Validation rules for deleting a paper
export const validateDeletePaper = [
  param('id')
    .notEmpty()
    .withMessage('Paper ID is required')
];

// Validation rules for getting papers by subject
export const validateGetPapersBySubject = [
  param('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters')
];

// Validation rules for query parameters
export const validateQueryParams = [
  query('subject')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject must be between 1 and 100 characters'),
  
  query('level')
    .optional()
    .isIn(['Primary', 'Secondary', 'University', 'Professional'])
    .withMessage('Level must be one of: Primary, Secondary, University, Professional'),
  
  query('examType')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Exam type must be between 1 and 50 characters'),
  
  query('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
