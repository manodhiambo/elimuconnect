import { authMiddleware } from "./../middleware";
import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { validationMiddleware, validate, validateQuery, validateParams, validateMultiple } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { 
  createBookSchema, 
  updateBookSchema,
  bookSearchSchema,
  bookReviewSchema,
  bookRequestSchema 
} from '../schemas/book.schemas';

const router = Router();
const bookController = new BookController();

// Public routes
router.get('/', 
  validateQuery(bookSearchSchema),
  bookController.getAllBooks
);

router.get('/search', 
  validateQuery(bookSearchSchema),
  bookController.searchBooks
);

router.get('/featured', bookController.getFeaturedBooks);
router.get('/popular', bookController.getPopularBooks);
router.get('/recent', bookController.getRecentBooks);

router.get('/:bookId', bookController.getBookById);
router.get('/:bookId/details', bookController.getBookDetails);

// Categories and subjects
router.get('/categories/all', bookController.getAllCategories);
router.get('/subjects/all', bookController.getAllSubjects);
router.get('/categories/:category/books', bookController.getBooksByCategory);
router.get('/subjects/:subject/books', bookController.getBooksBySubject);

// Education levels
router.get('/levels/all', bookController.getEducationLevels);
router.get('/levels/:level/books', bookController.getBooksByLevel);

// Publisher integration
router.get('/publishers/all', bookController.getAllPublishers);
router.get('/publishers/:publisher/books', bookController.getBooksByPublisher);

// Protected routes
router.use(authMiddleware);

// Book management
router.post('/', 
  validationMiddleware(createBookSchema),
  uploadMiddleware.single('cover'),
  bookController.createBook
);

router.put('/:bookId', 
  validationMiddleware(updateBookSchema),
  bookController.updateBook
);

router.delete('/:bookId', bookController.deleteBook);

// Book content management
router.post('/:bookId/upload', 
  uploadMiddleware.single('file'),
  bookController.uploadBookFile
);

router.post('/:bookId/cover', 
  uploadMiddleware.single('cover'),
  bookController.uploadBookCover
);

router.delete('/:bookId/file', bookController.deleteBookFile);

// Book interactions
router.post('/:bookId/favorite', bookController.favoriteBook);
router.delete('/:bookId/favorite', bookController.unfavoriteBook);
router.get('/favorites', bookController.getFavoriteBooks);

router.post('/:bookId/download', bookController.downloadBook);
router.get('/downloads', bookController.getDownloadHistory);

// Book reviews and ratings
router.post('/:bookId/reviews', 
  validationMiddleware(bookReviewSchema),
  bookController.addBookReview
);

router.get('/:bookId/reviews', bookController.getBookReviews);
router.put('/reviews/:reviewId', bookController.updateBookReview);
router.delete('/reviews/:reviewId', bookController.deleteBookReview);

router.post('/:bookId/rate', bookController.rateBook);

// Book requests
router.post('/requests', 
  validationMiddleware(bookRequestSchema),
  bookController.requestBook
);

router.get('/requests', bookController.getBookRequests);
router.get('/requests/my', bookController.getUserBookRequests);
router.put('/requests/:requestId/status', bookController.updateBookRequestStatus);

// Reading progress
router.post('/:bookId/progress', bookController.updateReadingProgress);
router.get('/:bookId/progress', bookController.getReadingProgress);
router.get('/reading/current', bookController.getCurrentlyReading);
router.get('/reading/completed', bookController.getCompletedBooks);

// Book sharing
router.post('/:bookId/share', bookController.shareBook);
router.get('/shared', bookController.getSharedBooks);

// Book collections/playlists
router.post('/collections', bookController.createBookCollection);
router.get('/collections', bookController.getUserCollections);
router.get('/collections/:collectionId', bookController.getBookCollection);
router.put('/collections/:collectionId', bookController.updateBookCollection);
router.delete('/collections/:collectionId', bookController.deleteBookCollection);
router.post('/collections/:collectionId/books/:bookId', bookController.addBookToCollection);
router.delete('/collections/:collectionId/books/:bookId', bookController.removeBookFromCollection);

// Analytics
router.get('/:bookId/analytics', bookController.getBookAnalytics);
router.get('/analytics/reading-stats', bookController.getReadingStatistics);

export default router;
