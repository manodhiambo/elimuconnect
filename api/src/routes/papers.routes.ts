
import { Router } from 'express';
import { PaperController } from '../controllers/paper.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { 
  createPaperSchema, 
  updatePaperSchema,
  paperSearchSchema,
  paperAttemptSchema 
} from '../schemas/paper.schemas';

const router = Router();
const paperController = new PaperController();

// Public routes
router.get('/', 
  validationMiddleware(paperSearchSchema, 'query'),
  paperController.getAllPapers
);

router.get('/search', 
  validationMiddleware(paperSearchSchema, 'query'),
  paperController.searchPapers
);

router.get('/recent', paperController.getRecentPapers);
router.get('/popular', paperController.getPopularPapers);

router.get('/:paperId', paperController.getPaperById);
router.get('/:paperId/preview', paperController.getPaperPreview);

// Filter routes
router.get('/subjects/all', paperController.getAllSubjects);
router.get('/subjects/:subject/papers', paperController.getPapersBySubject);

router.get('/years/all', paperController.getAllYears);
router.get('/years/:year/papers', paperController.getPapersByYear);

router.get('/exams/all', paperController.getAllExamBoards);
router.get('/exams/:examBoard/papers', paperController.getPapersByExamBoard);

router.get('/levels/all', paperController.getEducationLevels);
router.get('/levels/:level/papers', paperController.getPapersByLevel);

router.get('/terms/all', paperController.getAllTerms);
router.get('/terms/:term/papers', paperController.getPapersByTerm);

// Protected routes
router.use(authMiddleware);

// Paper management
router.post('/', 
  validationMiddleware(createPaperSchema),
  uploadMiddleware.single('file'),
  paperController.createPaper
);

router.put('/:paperId', 
  validationMiddleware(updatePaperSchema),
  paperController.updatePaper
);

router.delete('/:paperId', paperController.deletePaper);

// File management
router.post('/:paperId/upload', 
  uploadMiddleware.single('file'),
  paperController.uploadPaperFile
);

router.post('/:paperId/marking-scheme', 
  uploadMiddleware.single('markingScheme'),
  paperController.uploadMarkingScheme
);

router.delete('/:paperId/file', paperController.deletePaperFile);

// Paper interactions
router.post('/:paperId/download', paperController.downloadPaper);
router.get('/downloads', paperController.getDownloadHistory);

router.post('/:paperId/favorite', paperController.favoritePaper);
router.delete('/:paperId/favorite', paperController.unfavoritePaper);
router.get('/favorites', paperController.getFavoritePapers);

// Paper attempts and practice
router.post('/:paperId/attempt', 
  validationMiddleware(paperAttemptSchema),
  paperController.startPaperAttempt
);

router.put('/attempts/:attemptId', paperController.updatePaperAttempt);
router.post('/attempts/:attemptId/submit', paperController.submitPaperAttempt);
router.get('/attempts/:attemptId', paperController.getPaperAttempt);
router.get('/attempts', paperController.getUserAttempts);

// Paper reviews and ratings
router.post('/:paperId/reviews', paperController.addPaperReview);
router.get('/:paperId/reviews', paperController.getPaperReviews);
router.put('/reviews/:reviewId', paperController.updatePaperReview);
router.delete('/reviews/:reviewId', paperController.deletePaperReview);

router.post('/:paperId/rate', paperController.ratePaper);

// Paper sharing
router.post('/:paperId/share', paperController.sharePaper);
router.get('/shared', paperController.getSharedPapers);

// Study planner integration
router.post('/:paperId/schedule', paperController.scheduleStudy);
router.get('/scheduled', paperController.getScheduledPapers);
router.put('/scheduled/:scheduleId', paperController.updateStudySchedule);
router.delete('/scheduled/:scheduleId', paperController.removeFromSchedule);

// Paper collections/sets
router.post('/collections', paperController.createPaperCollection);
router.get('/collections', paperController.getUserCollections);
router.get('/collections/:collectionId', paperController.getPaperCollection);
router.put('/collections/:collectionId', paperController.updatePaperCollection);
router.delete('/collections/:collectionId', paperController.deletePaperCollection);
router.post('/collections/:collectionId/papers/:paperId', paperController.addPaperToCollection);
router.delete('/collections/:collectionId/papers/:paperId', paperController.removePaperFromCollection);

// Practice tests and mock exams
router.post('/practice-tests', paperController.createPracticeTest);
router.get('/practice-tests', paperController.getPracticeTests);
router.post('/practice-tests/:testId/start', paperController.startPracticeTest);
router.get('/practice-tests/:testId/results', paperController.getPracticeTestResults);

// Analytics and statistics
router.get('/:paperId/analytics', paperController.getPaperAnalytics);
router.get('/analytics/performance', paperController.getPerformanceAnalytics);
router.get('/analytics/progress', paperController.getProgressAnalytics);

// Revision materials
router.get('/:paperId/revision-notes', paperController.getRevisionNotes);
router.post('/:paperId/revision-notes', paperController.createRevisionNote);
router.put('/revision-notes/:noteId', paperController.updateRevisionNote);
router.delete('/revision-notes/:noteId', paperController.deleteRevisionNote);

export default router;
