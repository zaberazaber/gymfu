import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/authMiddleware';
import { asyncHandler } from '../middleware/errorHandler';
import * as gymController from '../controllers/gymController';

const router = Router();

// Validation rules
const registerGymValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Gym name must be between 2 and 255 characters'),
  body('address')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('pincode')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('amenities.*')
    .optional()
    .isIn(['cardio', 'weights', 'shower', 'parking', 'locker', 'trainer', 'pool', 'sauna', 'yoga', 'crossfit'])
    .withMessage('Invalid amenity'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
];

const updateGymValidation = [
  param('id').isInt().withMessage('Invalid gym ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Gym name must be between 2 and 255 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
];

// Routes
router.post(
  '/register',
  authenticate,
  registerGymValidation,
  asyncHandler(gymController.registerGym)
);

router.get(
  '/my-gyms',
  authenticate,
  asyncHandler(gymController.getMyGyms)
);

router.get(
  '/nearby',
  asyncHandler(gymController.getNearbyGyms)
);

router.get(
  '/',
  asyncHandler(gymController.getAllGyms)
);

router.get(
  '/:id',
  param('id').isInt().withMessage('Invalid gym ID'),
  asyncHandler(gymController.getGymById)
);

router.put(
  '/:id',
  authenticate,
  updateGymValidation,
  asyncHandler(gymController.updateGym)
);

router.delete(
  '/:id',
  authenticate,
  param('id').isInt().withMessage('Invalid gym ID'),
  asyncHandler(gymController.deleteGym)
);

// Image upload routes
router.post(
  '/:id/images',
  authenticate,
  [
    param('id').isInt().withMessage('Invalid gym ID'),
    body('images')
      .isArray({ min: 1, max: 10 })
      .withMessage('Images must be an array with 1-10 items'),
    body('images.*')
      .isString()
      .withMessage('Each image must be a string (URL or base64)'),
  ],
  asyncHandler(gymController.uploadGymImages)
);

router.delete(
  '/:id/images',
  authenticate,
  [
    param('id').isInt().withMessage('Invalid gym ID'),
    body('imageUrl')
      .isString()
      .withMessage('Image URL is required'),
  ],
  asyncHandler(gymController.removeGymImage)
);

export default router;
