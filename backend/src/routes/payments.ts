import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  initiatePayment,
  verifyPayment,
  getPaymentById,
  getUserPayments,
} from '../controllers/paymentController';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// Initiate payment for a booking
router.post('/initiate', initiatePayment);

// Verify payment
router.post('/verify', verifyPayment);

// Get payment by ID
router.get('/:paymentId', getPaymentById);

// Get user's payment history
router.get('/user', getUserPayments);

export default router;
