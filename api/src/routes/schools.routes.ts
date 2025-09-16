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

router.get('/:schoolId', schoolController.getSchoolById);
router.get('/:schoolId/public-info', schoolController.getSchoolPublicInfo);

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

router.put('/:schoolId', 
  validationMiddleware(updateSchoolSchema),
  schoolController.updateSchool
);

router.delete('/:schoolId', schoolController.deleteSchool);

// School verification
router.post('/:schoolId/verify', 
  validationMiddleware(verifySchoolSchema),
  schoolController.verifySchool
);

router.post('/:schoolId/request-verification', 
  schoolController.requestVerification
);

// School media
router.post('/:schoolId/logo', 
  uploadMiddleware.single('logo'),
  schoolController.uploadSchoolLogo
);

router.post('/:schoolId/images', 
  uploadMiddleware.array('images', 10),
  schoolController.uploadSchoolImages
);

router.delete('/:schoolId/images/:imageId', 
  schoolController.deleteSchoolImage
);

// School membership
router.post('/:schoolId/join', schoolController.joinSchool);
router.delete('/:schoolId/leave', schoolController.leaveSchool);
router.get('/:schoolId/members', schoolController.getSchoolMembers);

// School administration
router.post('/:schoolId/admins', schoolController.addSchoolAdmin);
router.delete('/:schoolId/admins/:userId', schoolController.removeSchoolAdmin);
router.get('/:schoolId/admins', schoolController.getSchoolAdmins);

// School resources
router.get('/:schoolId/books', schoolController.getSchoolBooks);
router.get('/:schoolId/papers', schoolController.getSchoolPapers);
router.get('/:schoolId/discussions', schoolController.getSchoolDiscussions);

// School statistics
router.get('/:schoolId/stats', schoolController.getSchoolStatistics);
router.get('/:schoolId/performance', schoolController.getSchoolPerformance);

// School settings (admin only)
router.get('/:schoolId/settings', schoolController.getSchoolSettings);
router.put('/:schoolId/settings', schoolController.updateSchoolSettings);

export default router;
