import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

export class StorageService {
  private s3?: AWS.S3;
  private bucketName: string;
  private useLocalStorage: boolean;
  private localStoragePath: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'elimuconnect-dev';
    this.useLocalStorage = process.env.NODE_ENV === 'development' || !process.env.AWS_ACCESS_KEY_ID;
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './uploads';

    if (!this.useLocalStorage) {
      AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
      this.s3 = new AWS.S3();
    } else {
      // Ensure local storage directory exists
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    if (this.useLocalStorage) {
      const filePath = path.join(this.localStoragePath, fileName);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, file.buffer);
      return `uploads/${fileName}`;
    } else if (this.s3) {
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    }
    
    throw new Error('Storage service not configured');
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      if (this.useLocalStorage) {
        const filePath = path.join(process.cwd(), fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return true;
      } else if (this.s3) {
        const key = fileUrl.split('/').pop();
        if (key) {
          await this.s3.deleteObject({ Bucket: this.bucketName, Key: key }).promise();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general') {
    const results = { success: [] as string[], failed: [] as string[] };

    for (const file of files) {
      try {
        const filePath = await this.uploadFile(file, folder);
        results.success.push(filePath);
      } catch (error) {
        results.failed.push(file.originalname);
      }
    }

    return results;
  }

  async deleteMultipleFiles(fileUrls: string[]) {
    const results = { success: [] as string[], failed: [] as string[] };

    for (const filePath of fileUrls) {
      try {
        await this.deleteFile(filePath);
        results.success.push(filePath);
      } catch (error) {
        results.failed.push(filePath);
      }
    }

    return results;
  }
}

export default new StorageService();
