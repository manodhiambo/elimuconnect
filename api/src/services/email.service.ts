export class EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`Sending verification email to ${email} with token ${token}`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log(`Sending password reset email to ${email} with token ${token}`);
  }

  async sendWelcomeEmail(email: string): Promise<void> {
    console.log(`Sending welcome email to ${email}`);
  }
}

export const emailService = new EmailService();
