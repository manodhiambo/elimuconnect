// Import and re-export all middleware
import { authenticate, authorize, authMiddleware } from './auth.middleware';
import { verifyToken, auth, requireRole, requireEmailVerification } from './auth';
import { 
  validationMiddleware, 
  validate, 
  validateQuery, 
  validateParams, 
  validateFile, 
  validateMultiple 
} from './validation.middleware';

// Auth middleware exports
export { authenticate, authorize, authMiddleware };
export { verifyToken, auth, requireRole, requireEmailVerification };

// Validation middleware exports
export { 
  validationMiddleware, 
  validate, 
  validateQuery, 
  validateParams, 
  validateFile, 
  validateMultiple 
};
