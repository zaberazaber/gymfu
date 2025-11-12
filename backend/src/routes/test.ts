import { Router, Request, Response } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Test successful response
router.get('/success', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Test endpoint working correctly',
    timestamp: new Date().toISOString(),
  });
});

// Test error handling
router.get('/error', (req: Request, res: Response) => {
  throw new AppError('This is a test error', 400, 'TEST_ERROR');
});

// Test async error handling
router.get(
  '/async-error',
  asyncHandler(async (req: Request, res: Response) => {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new AppError('This is a test async error', 500, 'TEST_ASYNC_ERROR');
  })
);

// Test validation error
router.get('/validation-error', (req: Request, res: Response) => {
  const error: any = new Error('Validation failed: Invalid input');
  error.name = 'ValidationError';
  throw error;
});

// Test unhandled error
router.get('/unhandled-error', (req: Request, res: Response) => {
  throw new Error('This is an unhandled error');
});

export default router;
