import { Router } from 'express';
import { body } from 'express-validator';
import { ProfileController } from '../controllers/profileController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// Validation rules for profile update
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),
  
  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object'),
  
  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('location.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  
  body('location.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  
  body('location.pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  
  body('fitnessGoals')
    .optional()
    .isArray()
    .withMessage('Fitness goals must be an array'),
  
  body('fitnessGoals.*')
    .optional()
    .isIn(['weight_loss', 'muscle_gain', 'general_fitness', 'strength', 'endurance', 'flexibility', 'sports_training'])
    .withMessage('Invalid fitness goal'),
  
  body('profileImage')
    .optional()
    .isString()
    .withMessage('Profile image must be a string (URL or base64)'),
];

// Routes
router.get('/profile', asyncHandler(ProfileController.getProfile));
router.put('/profile', updateProfileValidation, asyncHandler(ProfileController.updateProfile));

export default router;
