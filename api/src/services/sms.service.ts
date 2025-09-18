import twilio from 'twilio';

export class SmsService {
  private client: twilio.Twilio;
  private fromNumber: string;
  private isEnabled: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
      this.isEnabled = true;
    } else {
      console.warn('Twilio credentials not found. SMS service disabled.');
      this.isEnabled = false;
    }
    
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.isEnabled) {
      console.log(`SMS would be sent to ${to}: ${message}`);
      return true;
    }

    try {
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendVerificationCode(phone: string, code: string): Promise<boolean> {
    const message = `Your ElimuConnect verification code is: ${code}`;
    return this.sendSMS(phone, message);
  }

  async sendPasswordReset(phone: string, resetLink: string): Promise<boolean> {
    const message = `Reset your ElimuConnect password: ${resetLink}`;
    return this.sendSMS(phone, message);
  }
}

export default new SmsService();
