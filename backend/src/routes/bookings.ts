import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  createBooking,
  getBookingById,
  getUserBookings,
  cancelBooking,
  generateQRCode,
  checkInBooking,
} from '../controllers/bookingController';

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Create a new booking
router.post('/', createBooking);

// Get user's bookings
router.get('/user', getUserBookings);

// Get specific booking by ID
router.get('/:bookingId', getBookingById);

// Get QR code for booking
router.get('/:bookingId/qrcode', generateQRCode);

// Check-in to booking
router.post('/:bookingId/checkin', checkInBooking);

// Cancel a booking
router.put('/:bookingId/cancel', cancelBooking);

export default router;
