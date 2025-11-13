import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class ProfileController {
  // Get user profile
  static async getProfile(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const profile = await UserModel.getProfile(req.user.userId);

    if (!profile) {
      throw new AppError('Profile not found', 404, 'PROFILE_NOT_FOUND');
    }

    logger.info(`Profile retrieved for user: ${req.user.userId}`);

    res.json({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully',
      timestamp: new Date().toISOString(),
    });
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400, 'VALIDATION_FAILED');
    }

    if (!req.user) {
      throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
    }

    const { name, age, gender, location, fitnessGoals, profileImage } = req.body;

    const profileData = {
      ...(name !== undefined && { name }),
      ...(age !== undefined && { age }),
      ...(gender !== undefined && { gender }),
      ...(location !== undefined && { location }),
      ...(fitnessGoals !== undefined && { fitnessGoals }),
      ...(profileImage !== undefined && { profileImage }),
    };

    const updatedProfile = await UserModel.updateProfile(req.user.userId, profileData);

    if (!updatedProfile) {
      throw new AppError('Failed to update profile', 500, 'UPDATE_FAILED');
    }

    logger.info(`Profile updated for user: ${req.user.userId}`);

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });
  }
}
