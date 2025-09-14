// api/src/schemas/discussion.schemas.ts
import Joi from 'joi';
import { EducationLevel } from '@elimuconnect/shared/types';

export const discussionSchemas = {
  create: Joi.object({
    title: Joi.string()
      .trim()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title must not exceed 200 characters',
        'any.required': 'Title is required'
      }),
    
    content: Joi.string()
      .trim()
      .min(10)
      .max(5000)
      .required()
      .messages({
        'string.min': 'Content must be at least 10 characters',
        'string.max': 'Content must not exceed 5000 characters',
        'any.required': 'Content is required'
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
    
    level: Joi.string()
      .valid(...Object.values(EducationLevel))
      .required()
      .messages({
        'any.only': 'Education level must be primary or secondary',
        'any.required': 'Education level is required'
      }),
    
    grade: Joi.string()
      .optional(),
    
    tags: Joi.array()
      .items(Joi.string().trim().min(2).max(20))
      .max(5)
      .optional()
      .messages({
        'array.max': 'Maximum 5 tags allowed'
      })
  }),

  reply: Joi.object({
    content: Joi.string()
      .trim()
      .min(5)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Reply must be at least 5 characters',
        'string.max': 'Reply must not exceed 2000 characters',
        'any.required': 'Reply content is required'
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
    
    solved: Joi.boolean()
      .optional(),
    
    sort: Joi.string()
      .valid('createdAt', 'views', 'replies', 'upvotes')
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
      .default(20)
      .optional()
  })
};
