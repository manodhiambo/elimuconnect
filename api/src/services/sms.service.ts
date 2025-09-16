import twilio from 'twilio';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class SmsService {
  private client: twilio.Twilio;
  private fromNumber: string;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (this.isEnabled) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.isEnabled) {
      logger.warn('SMS service is not configured');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to)
      });

      logger.info(`SMS sent successfully to ${to}. SID: ${result.sid}`);
      return true;
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      throw new AppError('Failed to send SMS', 500);
    }
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your ElimuConnect verification code is: ${code}. This code will expire in 10 minutes.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<boolean> {
    const message = `Your ElimuConnect password reset code is: ${code}. If you didn't request this, please ignore this message.`;
    return this.sendSms(phoneNumber, message);
  }

  async sendNotification(phoneNumber: string, title: string, content: string): Promise<boolean> {
    const message = `${title}\n\n${content}\n\n- ElimuConnect`;
    return this.sendSms(phoneNumber, message);
  }

  async sendBulkSms(recipients: string[], message: string): Promise<{ success: number; failed: number }> {
    if (!this.isEnabled) {
      logger.warn('SMS service is not configured');
      return { success: 0, failed: recipients.length };
    }

    let success = 0;
    let failed = 0;

    const sendPromises = recipients.map(async (phoneNumber) => {
      try {
        await this.sendSms(phoneNumber, message);
        success++;
      } catch (error) {
        failed++;
        logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      }
    });

    await Promise.all(sendPromises);

    logger.info(`Bulk SMS completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Add country code if not present (assuming Kenya +254)
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return '+' + cleaned;
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const lookup = await this.client.lookups.v1.phoneNumbers(this.formatPhoneNumber(phoneNumber)).fetch();
      return !!lookup.phoneNumber;
    } catch (error) {
      logger.error('Phone number validation failed:', error);
      return false;
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendSchoolNotification(phoneNumbers: string[], schoolName: string, message: string): Promise<any> {
    const fullMessage = `${schoolName} Notification:\n\n${message}\n\n- ElimuConnect`;
    return this.sendBulkSms(phoneNumbers, fullMessage);
  }

  async sendExamReminder(phoneNumber: string, examName: string, examDate: string): Promise<boolean> {
    const message = `Reminder: Your ${examName} exam is scheduled for ${examDate}. Good luck with your preparation!\n\n- ElimuConnect`;
    return this.sendSms(phoneNumber, message);
  }

  async sendAssignmentDue(phoneNumber: string, assignmentName: string, dueDate: string): Promise<boolean> {
    const message = `Assignment Reminder: "${assignmentName}" is due on ${dueDate}. Don't forget to submit!\n\n- ElimuConnect`;
    return this.sendSms(phoneNumber, message);
  }
}
