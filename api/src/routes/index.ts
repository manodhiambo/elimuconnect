import { Router } from 'express';
import { Request, Response } from 'express';

// Import all route modules
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import schoolRoutes from './schools.routes';
import bookRoutes from './books.routes';
import paperRoutes from './papers.routes';
import forumRoutes from './forums.routes';
import messageRoutes from './messages.routes';
import uploadRoutes from './uploads.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// API Health Check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'ElimuConnect API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// API Root endpoint
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to ElimuConnect API',
    version: process.env.API_VERSION || '1.0.0',
    documentation: process.env.API_DOCS_URL || '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      schools: '/api/schools',
      books: '/api/books',
      papers: '/api/papers',
      forums: '/api/forums',
      messages: '/api/messages',
      uploads: '/api/uploads',
      analytics: '/api/analytics'
    }
  });
});

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/schools', schoolRoutes);
router.use('/books', bookRoutes);
router.use('/papers', paperRoutes);
router.use('/forums', forumRoutes);
router.use('/messages', messageRoutes);
router.use('/uploads', uploadRoutes);
router.use('/analytics', analyticsRoutes);

// 404 handler for undefined routes
router.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: '/api/auth',
      users: '/api/users',
      schools: '/api/schools',
      books: '/api/books',
      papers: '/api/papers',
      forums: '/api/forums',
      messages: '/api/messages',
      uploads: '/api/uploads',
      analytics: '/api/analytics'
    }
  });
});

export default router;
