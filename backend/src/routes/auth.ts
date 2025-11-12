import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  
  // At least one of phone or email must be provided
  body().custom((value, { req }) => {
    if (!req.body.phoneNumber && !req.body.email) {
      throw new Error('Either phone number or email is required');
    }
    return true;
  }),
];

// Routes
router.post('/register', registerValidation, asyncHandler(AuthController.register));
router.get('/me', asyncHandler(AuthController.me));

export default router;
