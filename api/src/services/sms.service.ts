// Optional SMS service - will work without Twilio
let twilioClient: any = null;

try {
  const twilio = require('twilio');
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log('SMS service not configured - SMS features will be disabled');
}

export class SMSService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!twilioClient) {
        console.log('SMS would be sent to:', to, 'Message:', message);
        return true; // Mock success for development
      }

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }
}

export const smsService = new SMSService();
