import { Router } from 'express';
import { SchoolController } from '../controllers/school.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { 
  createSchoolSchema, 
  updateSchoolSchema,
  schoolSearchSchema,
  verifySchoolSchema 
} from '../schemas/school.schemas';

const router = Router();
const schoolController = new SchoolController();

// Public routes
router.get('/', 
  validationMiddleware(schoolSearchSchema, 'query'),
  schoolController.getAllSchools
);

router.get('/search', 
  validationMiddleware(schoolSearchSchema, 'query'),
  schoolController.searchSchools
);

router.get('/:id', schoolController.getSchoolById);
router.get('/:id/public-info', schoolController.getSchoolPublicInfo);

// County and region endpoints
router.get('/counties/all', schoolController.getAllCounties);
router.get('/counties/:county/schools', schoolController.getSchoolsByCounty);
router.get('/regions/:region/schools', schoolController.getSchoolsByRegion);

// School types and categories
router.get('/types/all', schoolController.getSchoolTypes);
router.get('/categories/all', schoolController.getSchoolCategories);

// Protected routes
router.use(authMiddleware);

// School management (admin only)
router.post('/', 
  authMiddleware,
  validationMiddleware(createSchoolSchema),
  schoolController.createSchool
);

router.put('/:id', 
  validationMiddleware(updateSchoolSchema),
  schoolController.updateSchool
);

router.delete('/:id', schoolController.deleteSchool);

// School verification
router.post('/:id/verify', 
  validationMiddleware(verifySchoolSchema),
  schoolController.verifySchool
);

router.post('/:id/request-verification', 
  schoolController.requestVerification
);

// School media
router.post('/:id/logo', 
  uploadMiddleware.single('logo'),
  schoolController.uploadSchoolLogo
);

router.post('/:id/images', 
  uploadMiddleware.array('images', 10),
  schoolController.uploadSchoolImages
);

router.delete('/:id/images/:imageId', 
  schoolController.deleteSchoolImage
);

// School membership
router.post('/:id/join', schoolController.joinSchool);
router.delete('/:id/leave', schoolController.leaveSchool);
router.get('/:id/members', schoolController.getSchoolMembers);

// School administration
router.post('/:id/admins', schoolController.addSchoolAdmin);
router.delete('/:id/admins/:userId', schoolController.removeSchoolAdmin);
router.get('/:id/admins', schoolController.getSchoolAdmins);

// School resources
router.get('/:id/books', schoolController.getSchoolBooks);
router.get('/:id/papers', schoolController.getSchoolPapers);
router.get('/:id/discussions', schoolController.getSchoolDiscussions);

// School statistics
router.get('/:id/stats', schoolController.getSchoolStatistics);
router.get('/:id/performance', schoolController.getSchoolPerformance);

// School settings (admin only)
router.get('/:id/settings', schoolController.getSchoolSettings);
router.put('/:id/settings', schoolController.updateSchoolSettings);

export default router;

