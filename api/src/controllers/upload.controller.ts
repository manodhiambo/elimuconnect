import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import storageService from '../services/storage.service';

interface MulterRequest extends Request {
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

export class UploadController {
  // Upload single file
  uploadFile = asyncHandler(async (req: MulterRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const fileUrl = await storageService.uploadFile(req.file);

    res.json({
      success: true,
      data: { fileUrl }
    });
  });

  // Upload multiple files
  uploadMultiple = asyncHandler(async (req: MulterRequest, res: Response) => {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'No files provided'
      });
    }

    const results = await storageService.uploadMultipleFiles(req.files);

    res.json({
      success: true,
      data: results
    });
  });

  // Delete file
  deleteFile = asyncHandler(async (req: Request, res: Response) => {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'File URL required'
      });
    }

    const success = await storageService.deleteFile(fileUrl);

    if (success) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  });
}

export default new UploadController();
