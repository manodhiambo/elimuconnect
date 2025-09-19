import { authMiddleware } from "./../middleware";
import { Router } from 'express';
import { PaperController } from '../controllers/paper.controller';
import { validationMiddleware, validate, validateQuery, validateParams, validateMultiple } from '../middleware/validation.middleware';
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
  validateQuery(paperSearchSchema),
  paperController.getAllPapers
);

router.get('/search', 
  validateQuery(paperSearchSchema),
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

// Keep only implemented review methods
router.post('/:paperId/reviews', paperController.addPaperReview);
router.get('/:paperId/reviews', paperController.getPaperReviews);

export default router;
