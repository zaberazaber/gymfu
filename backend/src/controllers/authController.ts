import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { OTPService } from '../services/otpService';
import { NotificationService } from '../services/notificationService';
import { JWTService } from '../services/jwtService';
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

  // Login existing user
  static async login(req: Request, res: Response) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        400,
        'VALIDATION_FAILED'
      );
    }

    const { phoneNumber, email } = req.body;
    const identifier = phoneNumber || email;

    // Check if user exists
    let user;
    if (phoneNumber) {
      user = await UserModel.findByPhone(phoneNumber);
    } else {
      user = await UserModel.findByEmail(email!);
    }

    if (!user) {
      throw new AppError(
        'User not found. Please register first.',
        404,
        'USER_NOT_FOUND'
      );
    }

    // Generate and store OTP
    const otp = OTPService.generateOTP();
    await OTPService.storeOTP(identifier, otp);

    // Send OTP
    await NotificationService.sendOTP(identifier, otp);

    logger.info(`Login OTP sent to user: ${user.id}, identifier: ${identifier}`);

    // Return success
    res.json({
      success: true,
      data: {
        identifier: phoneNumber ? 'phone' : 'email',
        maskedValue: phoneNumber 
          ? `******${phoneNumber.slice(-4)}` 
          : email!.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      },
      message: 'OTP sent successfully. Please verify to complete login.',
      timestamp: new Date().toISOString(),
    });
  }

  // Login with password (email only)
  static async loginWithPassword(req: Request, res: Response) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        400,
        'VALIDATION_FAILED'
      );
    }

    const { email, password } = req.body;

    // Admin bypass for development: @varzio emails
    const isVarzioAdmin = email && email.includes('@varzio');
    
    if (isVarzioAdmin) {
      // Find or create admin user
      let user = await UserModel.findByEmail(email);
      
      if (!user) {
        // Create admin user on the fly
        const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
        user = await UserModel.create({
          email,
          name: email.split('@')[0],
          password: hashedPassword,
        });
        logger.info(`Admin user created: ${email}`);
      }
      
      // Generate JWT token without password verification
      const token = JWTService.generateToken(user);
      logger.info(`Admin bypass login: ${email}`);
      
      // Return token and user data
      return res.json({
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
        message: 'Admin login successful (development mode)',
        timestamp: new Date().toISOString(),
      });
    }

    // Regular user login flow
    // Check if user exists
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Generate JWT token
    const token = JWTService.generateToken(user);

    logger.info(`User logged in with password: ${user.id}`);

    // Return token and user data
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          location: user.location,
          fitnessGoals: user.fitnessGoals,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    });
  }

  // Get current user
  static async me(req: Request, res: Response) {
    // User is attached to request by authenticate middleware
    if (!req.user) {
      throw new AppError(
        'User not authenticated',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Find user by ID from JWT payload
    const user = await UserModel.findById(req.user.userId);

    if (!user) {
      throw new AppError(
        'User not found',
        404,
        'USER_NOT_FOUND'
      );
    }

    logger.info(`User profile retrieved: ${user.id}`);

    // Return user data (without password)
    res.json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: 'User profile retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  }
}
