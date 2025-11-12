import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
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

    logger.info(`User registered: ${user.id}`);

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
      message: 'User registered successfully',
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
