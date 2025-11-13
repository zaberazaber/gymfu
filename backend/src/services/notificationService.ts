import logger from '../config/logger';

export class NotificationService {
  // Send OTP via SMS (mock implementation)
  static async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // TODO: Integrate with Twilio/MSG91 in production
      logger.info(`📱 SMS to ${phoneNumber}: ${message}`);
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📱 SMS SENT`);
      console.log(`To: ${phoneNumber}`);
      console.log(`Message: ${message}`);
      console.log(`${'='.repeat(50)}\n`);
      return true;
    } catch (error) {
      logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      return false;
    }
  }

  // Send OTP via Email (mock implementation)
  static async sendEmail(
    email: string,
    subject: string,
    message: string
  ): Promise<boolean> {
    try {
      // TODO: Integrate with SendGrid in production
      logger.info(`📧 Email to ${email}: ${subject}`);
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📧 EMAIL SENT`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log(`${'='.repeat(50)}\n`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${email}:`, error);
      return false;
    }
  }

  // Send OTP (determines whether to use SMS or Email)
  static async sendOTP(identifier: string, otp: string): Promise<boolean> {
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      const subject = 'Your GYMFU Verification Code';
      const message = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`;
      return this.sendEmail(identifier, subject, message);
    } else {
      const message = `Your GYMFU verification code is: ${otp}. Valid for 10 minutes.`;
      return this.sendSMS(identifier, message);
    }
  }

  // Send welcome notification
  static async sendWelcome(identifier: string, name: string): Promise<boolean> {
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      const subject = 'Welcome to GYMFU!';
      const message = `Hi ${name},\n\nWelcome to GYMFU! Your account has been successfully created.\n\nStart exploring gyms near you and book your first session today!\n\nBest regards,\nThe GYMFU Team`;
      return this.sendEmail(identifier, subject, message);
    } else {
      const message = `Welcome to GYMFU, ${name}! Your account is ready. Start booking gym sessions today!`;
      return this.sendSMS(identifier, message);
    }
  }
}
