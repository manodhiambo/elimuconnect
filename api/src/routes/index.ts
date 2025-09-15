import { Express } from 'express';

export const setupRoutes = (app: Express): void => {
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString()
    });
  });

  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method
    });
  });
};

export default setupRoutes;
