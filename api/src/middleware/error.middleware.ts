import { Request, Response, NextFunction } from 'express';
import { AppError, createErrorResponse, isOperationalError, getErrorStatusCode } from '../utils/errors';
import { logger } from '../utils/logger';

// Error handling middleware
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = getErrorStatusCode(error);
  
  // Log the error
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else {
    logger.warn('Client Error:', {
      error: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409; // Duplicate key error
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
  } else if (error.name === 'MulterError') {
    statusCode = 400;
  }

  // Create error response
  const errorResponse = createErrorResponse(
    error,
    statusCode,
    req.path,
    process.env.NODE_ENV === 'development'
  );

  // Add additional debugging info in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      ...errorResponse.error.details,
      url: req.url,
      method: req.method,
      headers: req.headers,
      params: req.params,
      query: req.query
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// MongoDB connection error handler
export const mongoErrorHandler = (error: any): void => {
  if (error.name === 'MongoNetworkError') {
    logger.error('MongoDB connection failed:', error.message);
    process.exit(1);
  } else if (error.name === 'MongooseServerSelectionError') {
    logger.error('MongoDB server selection failed:', error.message);
    process.exit(1);
  }
};

// Unhandled rejection handler
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Rejection at: ' + promise + ' reason: ' + reason);
  
  // Close server gracefully
  if (!isOperationalError(reason)) {
    process.exit(1);
  }
};

// Uncaught exception handler
export const uncaughtExceptionHandler = (error: Error): void => {
  logger.error('Uncaught Exception:', error);
  
  // Close server gracefully
  process.exit(1);
};

export default errorMiddleware;
