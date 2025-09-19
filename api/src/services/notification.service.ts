import { User } from '../models/User';

export class NotificationService {
  async sendNotification(userId: string, message: string) {
    console.log(`Sending notification to ${userId}: ${message}`);
  }
}

export const notificationService = new NotificationService();
