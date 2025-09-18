import { body, param, query } from 'express-validator';

export const createPaperValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('year').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Valid year required'),
  body('level').isIn(['primary', 'secondary', 'tertiary']).withMessage('Valid education level required'),
  body('grade').notEmpty().withMessage('Grade is required')
];

export const updatePaperValidation = [
  param('id').isMongoId().withMessage('Valid paper ID required'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('year').optional().isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('Valid year required')
];

export const getPapersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  query('level').optional().isIn(['primary', 'secondary', 'tertiary']).withMessage('Valid education level required')
];
