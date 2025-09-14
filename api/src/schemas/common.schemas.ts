// api/src/schemas/common.schemas.ts
import Joi from 'joi';

export const commonSchemas = {
  mongoId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required'
    }),

  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional(),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .optional(),
    
    sort: Joi.string()
      .optional(),
    
    order: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional(),
    
    search: Joi.string()
      .trim()
      .min(2)
      .optional()
  })
};
