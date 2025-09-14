/ api/src/schemas/auth.schemas.ts
import Joi from 'joi';
import { UserRole, EducationLevel } from '@elimuconnect/shared/types';
import { helpers } from '@elimuconnect/shared/utils';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
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
        'any.required': 'Password is required'
      }),
    
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
    
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .required()
      .messages({
        'any.only': 'Role must be one of: student, teacher, admin',
        'any.required': 'Role is required'
      }),
    
    profile: Joi.object({
      firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'First name must be at least 2 characters',
          'string.max': 'First name must not exceed 50 characters',
          'any.required': 'First name is required'
        }),
      
      lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': 'Last name must be at least 2 characters',
          'string.max': 'Last name must not exceed 50 characters',
          'any.required': 'Last name is required'
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
        .custom((value, helpersObj) => {
          const level = helpersObj.state.ancestors[1].level;
          if (!helpers.isValidGrade(level, value)) {
            return helpersObj.error('any.invalid');
          }
          return value;
        })
        .messages({
          'any.required': 'Grade is required',
          'any.invalid': 'Invalid grade for the selected education level'
        }),
      
      school: Joi.string()
        .optional(),
      
      subjects: Joi.array()
        .items(Joi.string())
        .optional(),
      
      bio: Joi.string()
        .max(500)
        .optional()
        .messages({
          'string.max': 'Bio must not exceed 500 characters'
        })
    }).required(),
    
    verification: Joi.object({
      studentId: Joi.when('$role', {
        is: UserRole.STUDENT,
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      }),
      
      tscNumber: Joi.when('$role', {
        is: UserRole.TEACHER,
        then: Joi.string()
          .custom((value, helpersObj) => {
            if (!helpers.tscNumber(value)) {
              return helpersObj.error('any.invalid');
            }
            return value;
          })
          .required()
          .messages({
            'any.invalid': 'Please enter a valid TSC number (format: TSC/123456/2020)'
          }),
        otherwise: Joi.forbidden()
      }),
      
      adminCode: Joi.when('$role', {
        is: UserRole.ADMIN,
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
      })
    }).optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Verification token is required'
      })
  }),

  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      })
  }),

  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
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
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  })
};
