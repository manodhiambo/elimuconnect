/ api/src/schemas/book.schemas.ts
import Joi from 'joi';
import { EducationLevel } from '@elimuconnect/shared/types';

export const bookSchemas = {
  create: Joi.object({
    title: Joi.string()
      .trim()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title must be at least 3 characters',
        'string.max': 'Title must not exceed 200 characters',
        'any.required': 'Title is required'
      }),
    
    author: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Author must be at least 2 characters',
        'string.max': 'Author must not exceed 100 characters',
        'any.required': 'Author is required'
      }),
    
    publisher: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Publisher must be at least 2 characters',
        'string.max': 'Publisher must not exceed 100 characters',
        'any.required': 'Publisher is required'
      }),
    
    isbn: Joi.string()
      .pattern(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please enter a valid ISBN'
      }),
    
    level: Joi.string()
      .valid(...Object.values(EducationLevel))
      .required()
      .messages({
        'any.only': 'Education level must be primary or secondary',
        'any.required': 'Education level is required'
      }),
    
    grade: Joi.string()
      .required()
      .messages({
        'any.required': 'Grade is required'
      }),
    
    subject: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Subject must be at least 2 characters',
        'string.max': 'Subject must not exceed 50 characters',
        'any.required': 'Subject is required'
      }),
    
    description: Joi.string()
      .trim()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description must not exceed 1000 characters',
        'any.required': 'Description is required'
      }),
    
    pages: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.min': 'Pages must be at least 1',
        'any.required': 'Number of pages is required'
      }),
    
    language: Joi.string()
      .valid('en', 'sw')
      .default('en')
      .optional(),
    
    tags: Joi.array()
      .items(Joi.string().trim().min(2).max(30))
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 tags allowed'
      })
  }),

  search: Joi.object({
    q: Joi.string()
      .trim()
      .min(2)
      .optional(),
    
    subject: Joi.string()
      .trim()
      .optional(),
    
    level: Joi.string()
      .valid(...Object.values(EducationLevel))
      .optional(),
    
    grade: Joi.string()
      .optional(),
    
    author: Joi.string()
      .trim()
      .optional(),
    
    publisher: Joi.string()
      .trim()
      .optional(),
    
    language: Joi.string()
      .valid('en', 'sw')
      .optional(),
    
    verified: Joi.boolean()
      .optional(),
    
    sort: Joi.string()
      .valid('title', 'author', 'createdAt', 'downloads', 'rating')
      .default('createdAt')
      .optional(),
    
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional(),
    
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional(),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .default(12)
      .optional()
  })
};
