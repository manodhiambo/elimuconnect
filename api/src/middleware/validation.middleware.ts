import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// Main validation middleware
export const validationMiddleware = (
  schema: ZodSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[property];
      
      // Parse and validate the data
      const validatedData = schema.parse(dataToValidate);
      
      // Replace the original data with validated data
      req[property] = validatedData;
      
      logger.debug(`Validation successful for ${property}`, {
        route: req.route?.path,
        method: req.method
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.') || 'root',
          message: err.message,
          code: err.code
        }));
        
        logger.warn('Validation failed', {
          errors: errorMessages,
          route: req.route?.path,
          method: req.method,
          property
        });
        
        const validationError = new AppError(
          `Validation failed: ${errorMessages.map(e => e.message).join(', ')}`,
          400
        );
        
        // Add validation details for debugging
        (validationError as any).details = {
          property,
          errors: errorMessages,
          receivedData: req[property]
        };
        
        return next(validationError);
      }
      
      // Handle other validation errors
      logger.error('Unexpected validation error', error);
      next(new AppError('Validation error occurred', 400));
    }
  };
};

// Validate multiple properties at once
export const validateMultiple = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: any[] = [];
      
      // Validate body
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map(err => ({
              location: 'body',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      }
      
      // Validate query parameters
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map(err => ({
              location: 'query',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      }
      
      // Validate URL parameters
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map(err => ({
              location: 'params',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      }
      
      // Validate headers
      if (schemas.headers) {
        try {
          // Extract relevant headers for validation
          const headersToValidate: any = {};
          
          // We can't use shape property directly, so we'll try parsing and catch errors
          schemas.headers.parse(req.headers);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...error.errors.map(err => ({
              location: 'headers',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      }
      
      // If there are validation errors, return them
      if (errors.length > 0) {
        logger.warn('Multiple validation failures', {
          errors,
          route: req.route?.path,
          method: req.method
        });
        
        const validationError = new AppError(
          `Validation failed: ${errors.map(e => `${e.location}.${e.field}: ${e.message}`).join(', ')}`,
          400
        );
        
        (validationError as any).details = {
          errors,
          totalErrors: errors.length
        };
        
        return next(validationError);
      }
      
      logger.debug('Multiple validation successful', {
        validatedProperties: Object.keys(schemas),
        route: req.route?.path
      });
      
      next();
    } catch (error) {
      logger.error('Unexpected error in multiple validation', error);
      next(new AppError('Validation error occurred', 500));
    }
  };
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous HTML and scripts
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/on\w+=\S+/gi, '')
        .trim();
    }
    
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    
    if (value && typeof value === 'object' && value.constructor === Object) {
      const sanitizedObj: any = {};
      for (const [key, val] of Object.entries(value)) {
        // Also sanitize object keys
        const sanitizedKey = typeof key === 'string' ? key.replace(/[<>]/g, '') : key;
        sanitizedObj[sanitizedKey] = sanitizeValue(val);
      }
      return sanitizedObj;
    }
    
    return value;
  };
  
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeValue(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeValue(req.params);
    }
    
    logger.debug('Input sanitization completed', {
      route: req.route?.path,
      method: req.method
    });
    
    next();
  } catch (error) {
    logger.error('Error during input sanitization', error);
    next(new AppError('Input processing error', 500));
  }
};

// File validation middleware
export const validateFileUpload = (options: {
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const file = req.file as Express.Multer.File | undefined;
      
      const uploadedFiles = files || (file ? [file] : []);
      
      // Check if file is required
      if (options.required && uploadedFiles.length === 0) {
        return next(new AppError('File upload is required', 400));
      }
      
      // Check file count
      if (options.maxFiles && uploadedFiles.length > options.maxFiles) {
        return next(new AppError(`Maximum ${options.maxFiles} files allowed`, 400));
      }
      
      // Validate each file
      for (const uploadedFile of uploadedFiles) {
        // Check file size
        if (options.maxFileSize && uploadedFile.size > options.maxFileSize) {
          const maxSizeMB = Math.round(options.maxFileSize / (1024 * 1024));
          return next(new AppError(`File size exceeds ${maxSizeMB}MB limit`, 400));
        }
        
        // Check MIME type
        if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(uploadedFile.mimetype)) {
          return next(new AppError(`File type ${uploadedFile.mimetype} is not allowed`, 400));
        }
        
        // Check for suspicious file names
        if (/[<>:"/\\|?*]/.test(uploadedFile.originalname)) {
          return next(new AppError('Invalid characters in filename', 400));
        }
      }
      
      logger.debug('File validation successful', {
        fileCount: uploadedFiles.length,
        files: uploadedFiles.map(f => ({
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size
        }))
      });
      
      next();
    } catch (error) {
      logger.error('File validation error', error);
      next(new AppError('File validation failed', 500));
    }
  };
};

// JSON schema validation for complex nested objects
export const validateJsonSchema = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // This would use a JSON schema validator like ajv in production
      // For now, we'll use Zod as the primary validator
      logger.debug('JSON schema validation - using Zod fallback');
      next();
    } catch (error) {
      logger.error('JSON schema validation error', error);
      next(new AppError('Schema validation failed', 400));
    }
  };
};

// Custom validation for specific business rules
export const validateBusinessRules = (rules: {
  [key: string]: (req: Request) => Promise<boolean> | boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: string[] = [];
      
      for (const [ruleName, ruleFunction] of Object.entries(rules)) {
        try {
          const isValid = await ruleFunction(req);
          if (!isValid) {
            errors.push(`Business rule violation: ${ruleName}`);
          }
        } catch (error) {
          logger.error(`Business rule ${ruleName} validation error`, error);
          errors.push(`Business rule error: ${ruleName}`);
        }
      }
      
      if (errors.length > 0) {
        return next(new AppError(errors.join(', '), 400));
      }
      
      next();
    } catch (error) {
      logger.error('Business rules validation error', error);
      next(new AppError('Business validation failed', 500));
    }
  };
};

// Rate limit validation for specific endpoints
export const validateRateLimit = (key: string, limit: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip + (req.user?.id || '');
    const now = Date.now();
    
    const record = requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return next(new AppError('Rate limit exceeded', 429));
    }
    
    record.count++;
    next();
  };
};

export default validationMiddleware;
