import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';

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

// Validation for login
const loginValidation = [
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

// Validation for OTP verification
const verifyOTPValidation = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  
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

// Validation for password login
const passwordLoginValidation = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, asyncHandler(AuthController.register));
router.post('/login', loginValidation, asyncHandler(AuthController.login));
router.post('/login-password', passwordLoginValidation, asyncHandler(AuthController.loginWithPassword));
router.post('/verify-otp', verifyOTPValidation, asyncHandler(AuthController.verifyOTP));

// Protected routes
router.get('/me', authenticate, asyncHandler(AuthController.me));

export default router;
