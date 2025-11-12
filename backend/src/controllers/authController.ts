import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { OTPService } from '../services/otpService';
import { NotificationService } from '../services/notificationService';
import logger from '../config/logger';

export class AuthController {
  // Register a new user
  static async register(req: Request, res: Response) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        400,
        'VALIDATION_FAILED'
      );
    }

    const { phoneNumber, email, name, password } = req.body;
    const identifier = phoneNumber || email;

    // Check if user already exists
    if (phoneNumber) {
      const existingUser = await UserModel.findByPhone(phoneNumber);
      if (existingUser) {
        throw new AppError(
          'Phone number already registered',
          400,
          'PHONE_EXISTS'
        );
      }
    }

    if (email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError(
          'Email already registered',
          400,
          'EMAIL_EXISTS'
        );
      }
    }

    // Create user
    const user = await UserModel.create({
      phoneNumber,
      email,
      name,
      password,
    });

    // Generate and store OTP
    const otp = OTPService.generateOTP();
    await OTPService.storeOTP(identifier, otp);

    // Send OTP
    await NotificationService.sendOTP(identifier, otp);

    logger.info(`User registered: ${user.id}, OTP sent to ${identifier}`);

    // Return success (without password)
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      message: 'User registered successfully. Please verify your OTP.',
      timestamp: new Date().toISOString(),
    });
  }

  // Verify OTP
  static async verifyOTP(req: Request, res: Response) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        400,
        'VALIDATION_FAILED'
      );
    }

    const { phoneNumber, email, otp } = req.body;
    const identifier = phoneNumber || email;

    // Verify OTP
    const isValid = await OTPService.verifyOTP(identifier, otp);

    if (!isValid) {
      throw new AppError(
        'Invalid or expired OTP',
        400,
        'INVALID_OTP'
      );
    }

    // Find user
    let user;
    if (phoneNumber) {
      user = await UserModel.findByPhone(phoneNumber);
    } else {
      user = await UserModel.findByEmail(email!);
    }

    if (!user) {
      throw new AppError(
        'User not found',
        404,
        'USER_NOT_FOUND'
      );
    }

    // Generate JWT token
    const { JWTService } = await import('../services/jwtService');
    const token = JWTService.generateToken(user);

    logger.info(`OTP verified for user: ${user.id}`);

    // Return success with token
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      message: 'OTP verified successfully',
      timestamp: new Date().toISOString(),
    });
  }

  // Get current user (placeholder for now)
  static async me(req: Request, res: Response) {
    // This will be implemented after JWT authentication
    res.json({
      success: true,
      message: 'Get current user - to be implemented',
      timestamp: new Date().toISOString(),
    });
  }
}
