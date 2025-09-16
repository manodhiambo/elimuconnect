import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// File type configurations
const FILE_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/rtf',
      'application/vnd.oasis.opendocument.text'
    ],
    maxSize: 25 * 1024 * 1024, // 25MB
  },
  spreadsheets: {
    extensions: ['.xls', '.xlsx', '.csv', '.ods'],
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.oasis.opendocument.spreadsheet'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  presentations: {
    extensions: ['.ppt', '.pptx', '.odp'],
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation'
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  audio: {
    extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.aac'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'],
    maxSize: 20 * 1024 * 1024, // 20MB
  },
  video: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  archives: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    mimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip'
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
  }
};

// Create upload directories if they don't exist
const createUploadDirectories = () => {
  const uploadPaths = [
    'uploads',
    'uploads/avatars',
    'uploads/books',
    'uploads/papers',
    'uploads/images',
    'uploads/documents',
    'uploads/temp',
    'uploads/assignments',
    'uploads/discussions'
  ];

  uploadPaths.forEach(uploadPath => {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.info(`Created upload directory: ${uploadPath}`);
    }
  });
};

// Initialize upload directories
createUploadDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type and route
    if (req.path.includes('/avatar')) {
      uploadPath += 'avatars/';
    } else if (req.path.includes('/books')) {
      uploadPath += 'books/';
    } else if (req.path.includes('/papers')) {
      uploadPath += 'papers/';
    } else if (req.path.includes('/assignments')) {
      uploadPath += 'assignments/';
    } else if (req.path.includes('/discussions')) {
      uploadPath += 'discussions/';
    } else if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else {
      uploadPath += 'documents/';
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50); // Limit base name length

    const fileName = `${baseName}-${uniqueSuffix}${extension}`;
    cb(null, fileName);
  }
});

// Memory storage for temporary uploads
const memoryStorage = multer.memoryStorage();

// File filter function
const createFileFilter = (allowedTypes: string[] = []) => {
  return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
      // Check file extension
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const mimeType = file.mimetype.toLowerCase();

      // If specific types are allowed, check against them
      if (allowedTypes.length > 0) {
        const isAllowedType = allowedTypes.some(type => {
          const typeConfig = FILE_TYPES[type as keyof typeof FILE_TYPES];
          return typeConfig?.extensions.includes(fileExtension) && 
                 typeConfig?.mimeTypes.includes(mimeType);
        });

        if (!isAllowedType) {
          return cb(new AppError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400));
        }
      }

      // Security checks
      // Prevent dangerous file extensions
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.php', '.asp', '.jsp'];
      if (dangerousExtensions.includes(fileExtension)) {
        return cb(new AppError('File type not allowed for security reasons', 400));
      }

      // Check for double extensions (e.g., .jpg.exe)
      const allExtensions = file.originalname.match(/\.[^.]+/g) || [];
      if (allExtensions.length > 1) {
        const hassDangerousExtension = allExtensions.some(ext => 
          dangerousExtensions.includes(ext.toLowerCase())
        );
        if (hassDangerousExtension) {
          return cb(new AppError('File with multiple extensions not allowed', 400));
        }
      }

      // Check filename for suspicious patterns
      const suspiciousPatterns = [
        /[<>:"/\\|?*]/,  // Windows reserved characters
        /^\./,           // Hidden files
        /\x00/,          // Null bytes
        /__MACOSX/,      // Mac system files
        /\.(htaccess|htpasswd)$/i  // Apache config files
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(file.originalname))) {
        return cb(new AppError('Invalid filename', 400));
      }

      cb(null, true);
    } catch (error) {
      logger.error('File filter error:', error);
      cb(new AppError('File validation failed', 500));
    }
  };
};

// Limits configuration
const createLimits = (maxFileSize?: number, maxFiles?: number) => ({
  fileSize: maxFileSize || 50 * 1024 * 1024, // Default 50MB
  files: maxFiles || 10,
  parts: 1000,
  headerPairs: 20
});

// Base multer configuration
const createMulterConfig = (options: {
  storage?: 'disk' | 'memory';
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}) => {
  const { storage: storageType = 'disk', allowedTypes, maxFileSize, maxFiles } = options;

  return multer({
    storage: storageType === 'memory' ? memoryStorage : storage,
    fileFilter: createFileFilter(allowedTypes),
    limits: createLimits(maxFileSize, maxFiles),
    preservePath: false
  });
};

// Specific upload middleware configurations
export const uploadMiddleware = {
  // Single file upload
  single: (fieldName: string, options: {
    allowedTypes?: string[];
    maxFileSize?: number;
  } = {}) => {
    const upload = createMulterConfig({
      allowedTypes: options.allowedTypes,
      maxFileSize: options.maxFileSize
    });
    return upload.single(fieldName);
  },

  // Multiple files upload
  array: (fieldName: string, maxCount: number = 10, options: {
    allowedTypes?: string[];
    maxFileSize?: number;
  } = {}) => {
    const upload = createMulterConfig({
      allowedTypes: options.allowedTypes,
      maxFileSize: options.maxFileSize,
      maxFiles: maxCount
    });
    return upload.array(fieldName, maxCount);
  },

  // Multiple fields upload
  fields: (fields: { name: string; maxCount: number }[], options: {
    allowedTypes?: string[];
    maxFileSize?: number;
  } = {}) => {
    const upload = createMulterConfig({
      allowedTypes: options.allowedTypes,
      maxFileSize: options.maxFileSize
    });
    return upload.fields(fields);
  },

  // Avatar upload (single image)
  avatar: createMulterConfig({
    allowedTypes: ['images'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 1
  }).single('avatar'),

  // Book cover upload
  bookCover: createMulterConfig({
    allowedTypes: ['images'],
    maxFileSize: 3 * 1024 * 1024, // 3MB
    maxFiles: 1
  }).single('cover'),

  // Book file upload
  bookFile: createMulterConfig({
    allowedTypes: ['documents'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 1
  }).single('book'),

  // Past paper upload
  paperUpload: createMulterConfig({
    allowedTypes: ['documents'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 2
  }).fields([
    { name: 'paper', maxCount: 1 },
    { name: 'markingScheme', maxCount: 1 }
  ]),

  // Assignment submission
  assignmentSubmission: createMulterConfig({
    allowedTypes: ['documents', 'images'],
    maxFileSize: 25 * 1024 * 1024, // 25MB
    maxFiles: 5
  }).array('files', 5),

  // Discussion attachments
  discussionAttachments: createMulterConfig({
    allowedTypes: ['images', 'documents'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 3
  }).array('attachments', 3),

  // General file upload
  general: createMulterConfig({
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5
  }).array('files', 5),

  // Memory storage for temporary processing
  memory: createMulterConfig({
    storage: 'memory',
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }).single('file')
};

// Error handling middleware for multer errors
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'MISSING_FIELD_NAME':
        message = 'Missing field name';
        break;
    }

    logger.warn('Multer upload error:', {
      code: error.code,
      message: error.message,
      field: error.field
    });

    return res.status(statusCode).json({
      error: message,
      code: error.code,
      details: error.message
    });
  }

  next(error);
};

// File cleanup utility
export const cleanupTempFiles = (files: Express.Multer.File[]) => {
  files.forEach(file => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          logger.error('Failed to cleanup temp file:', err);
        } else {
          logger.debug('Cleaned up temp file:', file.path);
        }
      });
    }
  });
};

// File validation after upload
export const validateUploadedFile = (file: Express.Multer.File, options: {
  minSize?: number;
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}) => {
  const { minSize, maxSize, allowedMimeTypes, allowedExtensions } = options;

  // Size validation
  if (minSize && file.size < minSize) {
    throw new AppError(`File too small. Minimum size: ${minSize} bytes`, 400);
  }

  if (maxSize && file.size > maxSize) {
    throw new AppError(`File too large. Maximum size: ${maxSize} bytes`, 400);
  }

  // MIME type validation
  if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`, 400);
  }

  // Extension validation
  if (allowedExtensions) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new AppError(`Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`, 400);
    }
  }

  return true;
};

// Get file info utility
export const getFileInfo = (file: Express.Multer.File) => ({
  originalName: file.originalname,
  filename: file.filename,
  size: file.size,
  mimeType: file.mimetype,
  extension: path.extname(file.originalname),
  uploadPath: file.path,
  url: file.path ? `/uploads/${path.relative('uploads', file.path)}` : null
});

export default uploadMiddleware;
