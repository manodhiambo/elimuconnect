// api/src/schemas/user.schemas.ts
import Joi from 'joi';
import { EducationLevel } from '@elimuconnect/shared/types';
import { helpers } from '@elimuconnect/shared/utils';

export const userSchemas = {
  updateProfile: Joi.object({
    firstName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name must not exceed 50 characters'
      }),
    
    lastName: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name must not exceed 50 characters'
      }),
    
    bio: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Bio must not exceed 500 characters'
      }),
    
    subjects: Joi.array()
      .items(Joi.string())
      .optional(),
    
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
      })
  }),

  updatePreferences: Joi.object({
    language: Joi.string()
      .valid('en', 'sw')
      .optional()
      .messages({
        'any.only': 'Language must be either en or sw'
      }),
    
    theme: Joi.string()
      .valid('light', 'dark')
      .optional()
      .messages({
        'any.only': 'Theme must be either light or dark'
      }),
    
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      sms: Joi.boolean().optional()
    }).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .custom((value, helpers) => {
        const validation = helpers.password(value);
        if (!validation.valid) {
          return helpers.error('any.invalid', { message: validation.errors.join(', ') });
        }
        return value;
      })
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'New password is required'
      })
  })
};
