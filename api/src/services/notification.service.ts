// api/src/services/notification.service.ts
import { io } from '../main';
import { redis } from '../config/redis';
import User from '../models/User';
import { NotificationType } from '@elimuconnect/shared/types';
import { logger } from '@elimuconnect/shared/utils';

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  async sendNotification(
    userId: string, 
    type: NotificationType, 
    title: string, 
    message: string, 
    data?: any
  ): Promise<void> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date()
    };

    try {
      // Store notification in Redis
      await redis.lpush(
        `notifications:${userId}`, 
        JSON.stringify(notification)
      );
      
      // Keep only last 100 notifications
      await redis.ltrim(`notifications:${userId}`, 0, 99);

      // Send real-time notification via Socket.IO
      io.to(`user_${userId}`).emit('notification', notification);

      logger.info(`Notification sent to user ${userId}:`, { type, title });
    } catch (error) {
      logger.error('Failed to send notification:', error);
    }
  }

  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    try {
      const notifications = await redis.lrange(`notifications:${userId}`, 0, limit - 1);
      return notifications.map(notif => JSON.parse(notif));
    } catch (error) {
      logger.error('Failed to get notifications:', error);
      return [];
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
      const updatedNotifications = notifications.map(notif => {
        const parsed = JSON.parse(notif);
        if (parsed.id === notificationId) {
          parsed.read = true;
        }
        return JSON.stringify(parsed);
      });

      // Replace the list
      await redis.del(`notifications:${userId}`);
      if (updatedNotifications.length > 0) {
        await redis.lpush(`notifications:${userId}`, ...updatedNotifications);
      }
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
      const updatedNotifications = notifications.map(notif => {
        const parsed = JSON.parse(notif);
        parsed.read = true;
        return JSON.stringify(parsed);
      });

      // Replace the list
      await redis.del(`notifications:${userId}`);
      if (updatedNotifications.length > 0) {
        await redis.lpush(`notifications:${userId}`, ...updatedNotifications);
      }
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
      return notifications.filter(notif => !JSON.parse(notif).read).length;
    } catch (error) {
      logger.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Broadcast notification to multiple users
  async broadcastNotification(
    userIds: string[], 
    type: NotificationType, 
    title: string, 
    message: string, 
    data?: any
  ): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendNotification(userId, type, title, message, data)
    );
    
    await Promise.allSettled(promises);
  }

  // Send notification to all users of a specific role
  async notifyUsersByRole(
    role: string, 
    type: NotificationType, 
    title: string, 
    message: string, 
    data?: any
  ): Promise<void> {
    try {
      const users = await User.find({ role, verified: true }).select('_id');
      const userIds = users.map((user: any) => user._id.toString());
      
      await this.broadcastNotification(userIds, type, title, message, data);
    } catch (error) {
      logger.error('Failed to notify users by role:', error);
    }
  }
}

  async create(userId: string, type: string, title: string, message: string, data?: any) {
    // Implementation for creating notifications
    console.log(`Notification created for ${userId}: ${title} - ${message}`);
    return { success: true };
  }
