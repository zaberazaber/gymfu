import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  initiatePayment,
  getPaymentById,
  getUserPayments,
} from '../controllers/paymentController';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// Initiate payment for a booking
router.post('/initiate', initiatePayment);

// Get payment by ID
router.get('/:paymentId', getPaymentById);

// Get user's payment history
router.get('/user', getUserPayments);

export default router;
