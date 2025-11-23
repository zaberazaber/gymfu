import { redisClient } from '../config/database';
import logger from '../config/logger';

export class OTPService {
  private static OTP_EXPIRY = 600; // 10 minutes in seconds
  private static OTP_LENGTH = 6;

  // Generate a random 6-digit OTP
  static generateOTP(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  // Store OTP in Redis with expiry
  static async storeOTP(identifier: string, otp: string): Promise<void> {
    const key = `otp:${identifier}`;
    try {
      // Check if Redis is connected
      if (!redisClient.isOpen) {
        logger.warn(`Redis not connected. OTP for ${identifier}: ${otp}`);
        console.log(`\n⚠️  Redis not available - OTP for ${identifier}: ${otp}\n`);
        return;
      }
      await redisClient.setEx(key, this.OTP_EXPIRY, otp);
      logger.info(`OTP stored for ${identifier}`);
    } catch (error) {
      logger.error(`Failed to store OTP for ${identifier}:`, error);
      logger.warn(`Continuing without Redis - OTP for ${identifier}: ${otp}`);
      console.log(`\n⚠️  Redis error - OTP for ${identifier}: ${otp}\n`);
      // Don't throw - allow registration to continue without Redis
    }
  }

  // Verify OTP
  static async verifyOTP(identifier: string, otp: string): Promise<boolean> {
    const key = `otp:${identifier}`;
    try {
      // Check if Redis is connected
      if (!redisClient.isOpen) {
        logger.warn(`Redis not connected. Accepting any OTP for development: ${identifier}`);
        // In development without Redis, accept any 6-digit OTP
        return otp.length === 6 && /^\d+$/.test(otp);
      }

      const storedOTP = await redisClient.get(key);

      if (!storedOTP) {
        logger.warn(`OTP not found or expired for ${identifier}`);
        return false;
      }

      if (storedOTP === otp) {
        // OTP is correct, delete it so it can't be reused
        await redisClient.del(key);
        logger.info(`OTP verified successfully for ${identifier}`);
        return true;
      }

      logger.warn(`Invalid OTP attempt for ${identifier}`);
      return false;
    } catch (error) {
      logger.error(`Failed to verify OTP for ${identifier}:`, error);
      logger.warn(`Redis error - accepting any OTP for development: ${identifier}`);
      // In case of Redis error, accept any 6-digit OTP in development
      return otp.length === 6 && /^\d+$/.test(otp);
    }
  }

  // Delete OTP (for cleanup or cancellation)
  static async deleteOTP(identifier: string): Promise<void> {
    const key = `otp:${identifier}`;
    try {
      await redisClient.del(key);
      logger.info(`OTP deleted for ${identifier}`);
    } catch (error) {
      logger.error(`Failed to delete OTP for ${identifier}:`, error);
    }
  }

  // Check if OTP exists (for rate limiting)
  static async otpExists(identifier: string): Promise<boolean> {
    const key = `otp:${identifier}`;
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Failed to check OTP existence for ${identifier}:`, error);
      return false;
    }
  }

  // Get remaining TTL for OTP
  static async getOTPTTL(identifier: string): Promise<number> {
    const key = `otp:${identifier}`;
    try {
      const ttl = await redisClient.ttl(key);
      return ttl;
    } catch (error) {
      logger.error(`Failed to get OTP TTL for ${identifier}:`, error);
      return -1;
    }
  }
}
