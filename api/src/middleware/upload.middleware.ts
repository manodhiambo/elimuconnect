/ api/src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { APP_CONFIG } from '@elimuconnect/shared/constants';
import { helpers } from '@elimuconnect/shared/utils';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || 'uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = helpers.sanitizeFilename(file.originalname);
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    ...APP_CONFIG.SUPPORTED_FILE_TYPES.IMAGES,
    ...APP_CONFIG.SUPPORTED_FILE_TYPES.DOCUMENTS,
    ...APP_CONFIG.SUPPORTED_FILE_TYPES.AUDIO,
    ...APP_CONFIG.SUPPORTED_FILE_TYPES.VIDEO
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: APP_CONFIG.MAX_FILE_SIZE
  }
});
