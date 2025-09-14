// api/src/schemas/school.schemas.ts
import Joi from 'joi';
import { EducationLevel } from '@elimuconnect/shared/types';
import { helpers } from '@elimuconnect/shared/utils';

export const schoolSchemas = {
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'School name must be at least 3 characters',
        'string.max': 'School name must not exceed 100 characters',
        'any.required': 'School name is required'
      }),
    
    code: Joi.string()
      .custom((value, helpers) => {
        if (!helpers.nemisCode(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .required()
      .messages({
        'any.required': 'NEMIS code is required',
        'any.invalid': 'Please enter a valid NEMIS code (8 digits)'
      }),
    
    level: Joi.array()
      .items(Joi.string().valid(...Object.values(EducationLevel)))
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one education level is required',
        'any.required': 'Education level is required'
      }),
    
    county: Joi.string()
      .valid(...helpers.getKenyanCounties())
      .required()
      .messages({
        'any.only': 'Please select a valid Kenyan county',
        'any.required': 'County is required'
      }),
    
    district: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'District must be at least 2 characters',
        'string.max': 'District must not exceed 50 characters',
        'any.required': 'District is required'
      }),
    
    location: Joi.object({
      latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional(),
      longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional()
    }).optional(),
    
    contact: Joi.object({
      phone: Joi.string()
        .custom((value, helpers) => {
          if (!helpers.phone(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        })
        .optional()
        .messages({
          'any.invalid': 'Please enter a valid Kenyan phone number'
        }),
      
      email: Joi.string()
        .email()
        .optional()
        .messages({
          'string.email': 'Please enter a valid email address'
        }),
      
      address: Joi.string()
        .max(200)
        .optional()
        .messages({
          'string.max': 'Address must not exceed 200 characters'
        })
    }).optional()
  }),

  update: Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(100)
      .optional(),
    
    level: Joi.array()
      .items(Joi.string().valid(...Object.values(EducationLevel)))
      .min(1)
      .optional(),
    
    county: Joi.string()
      .valid(...helpers.getKenyanCounties())
      .optional(),
    
    district: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional(),
    
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional()
    }).optional(),
    
    contact: Joi.object({
      phone: Joi.string()
        .custom((value, helpers) => {
          if (!helpers.phone(value)) {
            return helpers.error('any.invalid');
          }
          return value;
        })
        .optional(),
      email: Joi.string().email().optional(),
      address: Joi.string().max(200).optional()
    }).optional()
  }),

  search: Joi.object({
    q: Joi.string()
      .trim()
      .min(2)
      .optional()
      .messages({
        'string.min': 'Search query must be at least 2 characters'
      }),
    
    county: Joi.string()
      .valid(...helpers.getKenyanCounties())
      .optional(),
    
    level: Joi.string()
      .valid(...Object.values(EducationLevel))
      .optional(),
    
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
      .optional()
  }),

  getById: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid school ID format',
        'any.required': 'School ID is required'
      })
  })
};
