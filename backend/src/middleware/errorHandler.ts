import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_FAILED';
    message = 'Validation failed';
    details = err.message;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTH_TOKEN_INVALID';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'AUTH_TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Handle database errors
  if (err.name === 'SequelizeValidationError' || err.name === 'MongoError') {
    statusCode = 400;
    code = 'DATABASE_ERROR';
    message = 'Database operation failed';
    details = err.message;
  }

  // Log error
  logger.error(
    `${statusCode} - ${code} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  // Log stack trace in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Send error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Async handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
