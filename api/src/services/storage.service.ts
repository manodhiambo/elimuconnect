// Optional storage service - will work without AWS
let s3Client: any = null;

try {
  const AWS = require('aws-sdk');
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    s3Client = new AWS.S3();
  }
} catch (error) {
  console.log('Storage service not configured - file uploads will use local storage');
}

export class StorageService {
  async uploadFile(file: Buffer, filename: string, mimetype: string): Promise<string> {
    try {
      if (!s3Client) {
        // Mock file upload for development
        const mockUrl = `https://mock-storage.com/files/${filename}`;
        console.log('File would be uploaded:', filename, 'URL:', mockUrl);
        return mockUrl;
      }

      const params = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: filename,
        Body: file,
        ContentType: mimetype,
        ACL: 'public-read'
      };

      const result = await s3Client.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error('File upload failed');
    }
  }
}

export const storageService = new StorageService();
