import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../services/jwtService';
import { AppError } from './errorHandler';
import logger from '../config/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        'No authorization token provided',
        401,
        'NO_TOKEN'
      );
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Invalid authorization format. Use: Bearer <token>',
        401,
        'INVALID_TOKEN_FORMAT'
      );
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AppError(
        'Token is empty',
        401,
        'EMPTY_TOKEN'
      );
    }

    // Verify token
    try {
      const payload = JWTService.verifyToken(token);
      
      // Attach user to request
      req.user = payload;
      
      logger.debug(`User authenticated: ${payload.userId}`);
      
      next();
    } catch (error) {
      // Handle specific JWT errors
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new AppError(
            'Token has expired',
            401,
            'TOKEN_EXPIRED'
          );
        } else if (error.message.includes('invalid')) {
          throw new AppError(
            'Invalid token',
            401,
            'INVALID_TOKEN'
          );
        }
      }
      
      throw new AppError(
        'Token verification failed',
        401,
        'TOKEN_VERIFICATION_FAILED'
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if no token
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    try {
      const payload = JWTService.verifyToken(token);
      req.user = payload;
      logger.debug(`User optionally authenticated: ${payload.userId}`);
    } catch (error) {
      // Token is invalid, but we don't fail - just continue without user
      logger.debug('Optional authentication failed, continuing without user');
    }

    next();
  } catch (error) {
    next(error);
  }
};
