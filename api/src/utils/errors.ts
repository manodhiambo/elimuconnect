export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message, 400);
    this.field = field;
    this.value = value;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

export class DatabaseError extends AppError {
  public readonly query?: string;
  public readonly parameters?: any[];

  constructor(message: string, query?: string, parameters?: any[]) {
    super(message, 500);
    this.query = query;
    this.parameters = parameters;
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;
  public readonly originalError?: Error;

  constructor(service: string, message: string, originalError?: Error) {
    super(`External service error (${service}): ${message}`, 502);
    this.service = service;
    this.originalError = originalError;
  }
}

export class FileUploadError extends AppError {
  public readonly fileName?: string;
  public readonly fileSize?: number;

  constructor(message: string, fileName?: string, fileSize?: number) {
    super(message, 400);
    this.fileName = fileName;
    this.fileSize = fileSize;
  }
}

// Error factory functions
export const createValidationError = (field: string, value: any, message: string): ValidationError => {
  return new ValidationError(`Validation failed for field '${field}': ${message}`, field, value);
};

export const createNotFoundError = (resource: string, identifier?: string): NotFoundError => {
  const message = identifier 
    ? `${resource} with identifier '${identifier}' not found`
    : `${resource} not found`;
  return new NotFoundError(message);
};

export const createConflictError = (resource: string, field?: string, value?: string): ConflictError => {
  const message = field && value
    ? `${resource} with ${field} '${value}' already exists`
    : `${resource} already exists`;
  return new ConflictError(message);
};

// Error status code mappings
export const ERROR_CODES = {
  // Client errors (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error response interface
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    details?: any;
    stack?: string;
  };
}

// Helper function to create error response
export const createErrorResponse = (
  error: Error,
  statusCode: number = 500,
  path?: string,
  includeStack: boolean = false
): ErrorResponse => {
  const response: ErrorResponse = {
    error: {
      message: error.message,
      statusCode,
      timestamp: new Date().toISOString(),
    }
  };

  if (path) {
    response.error.path = path;
  }

  if (error instanceof AppError) {
    response.error.code = error.constructor.name;
  }

  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }

  // Add specific error details based on error type
  if (error instanceof ValidationError) {
    response.error.details = {
      field: error.field,
      value: error.value
    };
  } else if (error instanceof DatabaseError) {
    response.error.details = {
      query: error.query,
      parameters: error.parameters
    };
  } else if (error instanceof ExternalServiceError) {
    response.error.details = {
      service: error.service,
      originalError: error.originalError?.message
    };
  } else if (error instanceof FileUploadError) {
    response.error.details = {
      fileName: error.fileName,
      fileSize: error.fileSize
    };
  } else if (error instanceof RateLimitError) {
    response.error.details = {
      retryAfter: error.retryAfter
    };
  }

  return response;
};

// Helper function to check if error is operational
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Helper function to get appropriate status code for an error
export const getErrorStatusCode = (error: Error): number => {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  
  // Default to 500 for unknown errors
  return ERROR_CODES.INTERNAL_SERVER_ERROR;
};
