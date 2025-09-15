import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ElimuConnect API is running',
    timestamp: new Date().toISOString()
  });
});

// Placeholder routes - to be implemented
router.use('/auth', (req, res) => {
  res.json({ message: 'Auth routes coming soon' });
});

router.use('/users', (req, res) => {
  res.json({ message: 'User routes coming soon' });
});

router.use('/schools', (req, res) => {
  res.json({ message: 'School routes coming soon' });
});

router.use('/books', (req, res) => {
  res.json({ message: 'Books routes coming soon' });
});

router.use('/papers', (req, res) => {
  res.json({ message: 'Papers routes coming soon' });
});

router.use('/forum', (req, res) => {
  res.json({ message: 'Forum routes coming soon' });
});

router.use('/messages', (req, res) => {
  res.json({ message: 'Messages routes coming soon' });
});

export default router;
