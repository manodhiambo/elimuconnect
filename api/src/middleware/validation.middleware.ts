import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../types';

// Main validation function that handles the second parameter for backward compatibility
export const validationMiddleware = (schema: z.ZodSchema, target?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate;
      
      switch (target) {
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'body':
        default:
          dataToValidate = req.body;
          break;
      }
      
      schema.parse(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          message: err.message,
          path: err.path,
          code: err.code
        }));
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      next(error);
    }
  };
};

// Individual validation functions
export const validate = (schema: z.ZodSchema) => validationMiddleware(schema, 'body');
export const validateQuery = (schema: z.ZodSchema) => validationMiddleware(schema, 'query');
export const validateParams = (schema: z.ZodSchema) => validationMiddleware(schema, 'params');

export const validateMultiple = (schemas: { body?: z.ZodSchema; query?: z.ZodSchema; params?: z.ZodSchema }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) schemas.body.parse(req.body);
      if (schemas.query) schemas.query.parse(req.query);
      if (schemas.params) schemas.params.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          message: err.message,
          path: err.path,
          code: err.code
        }));
        return res.status(400).json({
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      next(error);
    }
  };
};

export const validateFile = (allowedTypes: string[], maxSize: number = 5 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: 'Invalid file type' });
      }

      if (req.file.size > maxSize) {
        return res.status(400).json({ message: 'File too large' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
