import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  initiatePayment,
  verifyPayment,
  getPaymentById,
  getUserPayments,
  processRefund,
  getGymEarnings,
} from '../controllers/paymentController';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// Initiate payment for a booking
router.post('/initiate', initiatePayment);

// Verify payment
router.post('/verify', verifyPayment);

// Process refund
router.post('/refund', processRefund);

// Get gym earnings (must be before /:paymentId to avoid route conflict)
router.get('/gym/:gymId/earnings', getGymEarnings);

// Get payment by ID
router.get('/:paymentId', getPaymentById);

// Get user's payment history
router.get('/user', getUserPayments);

export default router;
