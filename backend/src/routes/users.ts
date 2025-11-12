import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', asyncHandler(AuthController.me));

export default router;
