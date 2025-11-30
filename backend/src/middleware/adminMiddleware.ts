import { Request, Response, NextFunction } from 'express';
import AdminModel from '../models/Admin';
import { AppError } from './errorHandler';
import logger from '../config/logger';

/**
 * Admin Authorization Middleware
 * Checks if the authenticated user has admin privileges
 * Must be used after the authenticate middleware
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError('Authentication required', 401, 'NO_AUTH');
    }
    
    const isAdmin = await AdminModel.isAdmin(userId);
    
    if (!isAdmin) {
      logger.warn(`Non-admin user ${userId} attempted to access admin route`);
      throw new AppError('Admin access required', 403, 'NOT_ADMIN');
    }
    
    logger.debug(`Admin access granted for user ${userId}`);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional admin check middleware
 * Attaches isAdmin flag to request but doesn't block non-admins
 */
export const checkAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    
    if (userId) {
      const isAdmin = await AdminModel.isAdmin(userId);
      (req as any).isAdmin = isAdmin;
    } else {
      (req as any).isAdmin = false;
    }
    
    next();
  } catch (error) {
    (req as any).isAdmin = false;
    next();
  }
};
