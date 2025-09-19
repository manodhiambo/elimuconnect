import { User } from '../models/User';

export class NotificationService {
  async sendNotification(userId: string, message: string) {
    console.log(`Sending notification to ${userId}: ${message}`);
  }

  async create(notification: any) {
    console.log('Creating notification:', notification);
    return { id: 'notification-id', ...notification };
  }
}

export const notificationService = new NotificationService();
