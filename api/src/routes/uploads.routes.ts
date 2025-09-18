import { authMiddleware } from "./../middleware";
import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';

const router = Router();
const uploadController = new UploadController();

// All routes require authentication
router.use(authMiddleware);

// General file uploads
router.post('/files', 
  rateLimitMiddleware.fileUpload,
  uploadMiddleware.single('file'),
  uploadController.uploadFile
);

router.post('/files/multiple', 
  rateLimitMiddleware.fileUpload,
  uploadMiddleware.array('files', 10),
  uploadController.uploadMultipleFiles
);

// Image uploads
router.post('/images', 
  rateLimitMiddleware.imageUpload,
  uploadMiddleware.single('image'),
  uploadController.uploadImage
);

router.post('/images/multiple', 
  rateLimitMiddleware.imageUpload,
  uploadMiddleware.array('images', 10),
  uploadController.uploadMultipleImages
);

// Document uploads (PDFs, DOCs, etc.)
router.post('/documents', 
  rateLimitMiddleware.documentUpload,
  uploadMiddleware.single('document'),
  uploadController.uploadDocument
);

router.post('/documents/multiple', 
  rateLimitMiddleware.documentUpload,
  uploadMiddleware.array('documents', 5),
  uploadController.uploadMultipleDocuments
);

// Avatar/Profile image uploads
router.post('/avatar', 
  rateLimitMiddleware.avatarUpload,
  uploadMiddleware.single('avatar'),
  uploadController.uploadAvatar
);

// Book cover uploads
router.post('/book-covers', 
  rateLimitMiddleware.imageUpload,
  uploadMiddleware.single('cover'),
  uploadController.uploadBookCover
);

// School logo uploads
router.post('/school-logos', 
  rateLimitMiddleware.imageUpload,
  uploadMiddleware.single('logo'),
  uploadController.uploadSchoolLogo
);

// Past paper uploads
router.post('/papers', 
  rateLimitMiddleware.documentUpload,
  uploadMiddleware.fields([
    { name: 'paper', maxCount: 1 },
    { name: 'markingScheme', maxCount: 1 }
  ]),
  uploadController.uploadPaper
);

// Book file uploads (eBooks, PDFs)
router.post('/books', 
  rateLimitMiddleware.documentUpload,
  uploadMiddleware.single('book'),
  uploadController.uploadBook
);

// Audio uploads (for language learning, pronunciation, etc.)
router.post('/audio', 
  rateLimitMiddleware.audioUpload,
  uploadMiddleware.single('audio'),
  uploadController.uploadAudio
);

// Video uploads (for tutorials, explanations)
router.post('/videos', 
  rateLimitMiddleware.videoUpload,
  uploadMiddleware.single('video'),
  uploadController.uploadVideo
);

// File management
router.get('/files', uploadController.getUserFiles);
router.get('/files/:fileId', uploadController.getFileById);
router.delete('/files/:fileId', uploadController.deleteFile);

// File information and metadata
router.get('/files/:fileId/info', uploadController.getFileInfo);
router.put('/files/:fileId/metadata', uploadController.updateFileMetadata);

// File sharing and permissions
router.post('/files/:fileId/share', uploadController.shareFile);
router.put('/files/:fileId/permissions', uploadController.updateFilePermissions);
router.get('/files/:fileId/permissions', uploadController.getFilePermissions);

// File download and serving
router.get('/files/:fileId/download', uploadController.downloadFile);
router.get('/files/:fileId/view', uploadController.viewFile);
router.get('/files/:fileId/thumbnail', uploadController.getFileThumbnail);

// Bulk operations
router.post('/files/bulk-delete', uploadController.bulkDeleteFiles);
router.post('/files/bulk-move', uploadController.bulkMoveFiles);
router.post('/files/bulk-share', uploadController.bulkShareFiles);

// File organization
router.post('/folders', uploadController.createFolder);
router.get('/folders', uploadController.getUserFolders);
router.put('/folders/:folderId', uploadController.updateFolder);
router.delete('/folders/:folderId', uploadController.deleteFolder);
router.post('/files/:fileId/move', uploadController.moveFile);

// Upload progress and resumable uploads
router.post('/upload-session', uploadController.createUploadSession);
router.put('/upload-session/:sessionId', uploadController.resumeUpload);
router.get('/upload-session/:sessionId/progress', uploadController.getUploadProgress);
router.delete('/upload-session/:sessionId', uploadController.cancelUpload);

// File conversion and processing
router.post('/files/:fileId/convert', uploadController.convertFile);
router.get('/files/:fileId/conversion-status', uploadController.getConversionStatus);

// File scanning and virus checking
router.get('/files/:fileId/scan-status', uploadController.getFileScanStatus);
router.post('/files/:fileId/rescan', uploadController.rescanFile);

// Storage management
router.get('/storage/usage', uploadController.getStorageUsage);
router.get('/storage/quota', uploadController.getStorageQuota);
router.delete('/storage/cleanup', uploadController.cleanupStorage);

// Temporary uploads (for previews, etc.)
router.post('/temp', 
  rateLimitMiddleware.tempUpload,
  uploadMiddleware.single('file'),
  uploadController.uploadTemporaryFile
);

router.get('/temp/:tempId', uploadController.getTemporaryFile);
router.delete('/temp/:tempId', uploadController.deleteTemporaryFile);

// Upload analytics
router.get('/analytics/uploads', uploadController.getUploadAnalytics);
router.get('/analytics/storage-trends', uploadController.getStorageTrends);

// Admin routes (for file management)
router.get('/admin/files', uploadController.getAllFiles);
router.get('/admin/storage-stats', uploadController.getStorageStatistics);
router.delete('/admin/files/:fileId', uploadController.adminDeleteFile);

export default router;
