import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class StorageService {
  private s3: AWS.S3;
  private bucketName: string;
  private useLocalStorage: boolean;
  private localStoragePath: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'elimuconnect-uploads';
    this.useLocalStorage = process.env.STORAGE_TYPE === 'local' || !process.env.AWS_ACCESS_KEY_ID;
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './uploads';

    if (!this.useLocalStorage) {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    try {
      const fileName = this.generateFileName(file.originalname);
      const filePath = `${folder}/${fileName}`;

      if (this.useLocalStorage) {
        return await this.uploadToLocal(file, filePath);
      } else {
        return await this.uploadToS3(file, filePath);
      }
    } catch (error) {
      logger.error('File upload failed:', error);
      throw new AppError('File upload failed', 500);
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (this.useLocalStorage) {
        await this.deleteFromLocal(filePath);
      } else {
        await this.deleteFromS3(filePath);
      }
    } catch (error) {
      logger.error('File deletion failed:', error);
      throw new AppError('File deletion failed', 500);
    }
  }

  async getFileUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    if (this.useLocalStorage) {
      return `${process.env.BASE_URL}/uploads/${filePath}`;
    } else {
      return this.s3.getSignedUrl('getObject', {
        Bucket: this.bucketName,
        Key: filePath,
        Expires: expiresIn
      });
    }
  }

  async getFileInfo(filePath: string): Promise<any> {
    try {
      if (this.useLocalStorage) {
        return await this.getLocalFileInfo(filePath);
      } else {
        return await this.getS3FileInfo(filePath);
      }
    } catch (error) {
      logger.error('Failed to get file info:', error);
      throw new AppError('Failed to get file info', 500);
    }
  }

  private async uploadToS3(file: Express.Multer.File, filePath: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };

    const result = await this.s3.upload(params).promise();
    return result.Key;
  }

  private async uploadToLocal(file: Express.Multer.File, filePath: string): Promise<string> {
    const fullPath = path.join(this.localStoragePath, filePath);
    const directory = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, file.buffer);

    return filePath;
  }

  private async deleteFromS3(filePath: string): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: filePath
    };

    await this.s3.deleteObject(params).promise();
  }

  private async deleteFromLocal(filePath: string): Promise<void> {
    const fullPath = path.join(this.localStoragePath, filePath);
    await fs.unlink(fullPath);
  }

  private async getS3FileInfo(filePath: string): Promise<any> {
    const params = {
      Bucket: this.bucketName,
      Key: filePath
    };

    const result = await this.s3.headObject(params).promise();
    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
      etag: result.ETag
    };
  }

  private async getLocalFileInfo(filePath: string): Promise<any> {
    const fullPath = path.join(this.localStoragePath, filePath);
    const stats = await fs.stat(fullPath);
    
    return {
      size: stats.size,
      lastModified: stats.mtime,
      contentType: this.getContentType(fullPath)
    };
  }

  private generateFileName(originalName: string): string {
    const extension = path.extname(originalName);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    return `${timestamp}-${uuid}${extension}`;
  }

  private getContentType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.txt': 'text/plain'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  // File validation methods
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  // Image processing methods
  async generateThumbnail(filePath: string, width: number = 200, height: number = 200): Promise<string> {
    // Implementation for thumbnail generation
    // You might want to use sharp or jimp for image processing
    throw new AppError('Thumbnail generation not implemented', 501);
  }

  // File conversion methods
  async convertToPdf(filePath: string): Promise<string> {
    // Implementation for file conversion to PDF
    // You might want to use libraries like puppeteer, libreoffice, or pandoc
    throw new AppError('PDF conversion not implemented', 501);
  }

  // Bulk operations
  async uploadBatch(files: Express.Multer.File[], folder: string = 'batch'): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [], failed: [] };

    for (const file of files) {
      try {
        const filePath = await this.uploadFile(file, folder);
        results.success.push(filePath);
      } catch (error) {
        results.failed.push(file.originalname);
        logger.error(`Failed to upload ${file.originalname}:`, error);
      }
    }

    return results;
  }

  async deleteBatch(filePaths: string[]): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [], failed: [] };

    for (const filePath of filePaths) {
      try {
        await this.deleteFile(filePath);
        results.success.push(filePath);
      } catch (error) {
        results.failed.push(filePath);
        logger.error(`Failed to delete ${filePath}:`, error);
      }
    }

    return results;
  }

  // Storage analytics
  async getStorageUsage(userId?: string): Promise<any> {
    if (this.useLocalStorage) {
      return this.getLocalStorageUsage(userId);
    } else {
      return this.getS3StorageUsage(userId);
    }
  }

  private async getLocalStorageUsage(userId?: string): Promise<any> {
    // Implementation for local storage usage calculation
    const userPath = userId ? path.join(this.localStoragePath, 'users', userId) : this.localStoragePath;
    
    try {
      const stats = await fs.stat(userPath);
      return {
        totalSize: stats.size,
        fileCount: 0, // Would need recursive directory traversal
        lastModified: stats.mtime
      };
    } catch (error) {
      return { totalSize: 0, fileCount: 0 };
    }
  }

  private async getS3StorageUsage(userId?: string): Promise<any> {
    const prefix = userId ? `users/${userId}/` : '';
    
    const params = {
      Bucket: this.bucketName,
      Prefix: prefix
    };

    try {
      const result = await this.s3.listObjectsV2(params).promise();
      const totalSize = result.Contents?.reduce((sum, obj) => sum + (obj.Size || 0), 0) || 0;
      
      return {
        totalSize,
        fileCount: result.KeyCount || 0,
        objects: result.Contents
      };
    } catch (error) {
      logger.error('Failed to get S3 storage usage:', error);
      return { totalSize: 0, fileCount: 0 };
    }
  }
}
