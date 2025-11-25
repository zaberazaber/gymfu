import { Request, Response } from 'express';
import PaymentModel from '../models/Payment';
import BookingModel from '../models/Booking';
import { GymModel } from '../models/Gym';
import RazorpayService from '../services/razorpayService';
import { pgPool } from '../config/database';

/**
 * Initiate payment for a booking
 * POST /api/v1/payments/initiate
 */
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Validate booking ID
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID is required',
        },
      });
    }

    // Check if Razorpay is configured
    if (!RazorpayService.isConfigured()) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_CONFIGURED',
          message: 'Payment gateway is not configured',
        },
      });
    }

    // Get booking details
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Verify user owns the booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to pay for this booking',
        },
      });
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BOOKING_STATUS',
          message: `Cannot initiate payment for booking with status '${booking.status}'`,
        },
      });
    }

    // Check if payment already exists for this booking
    const existingPayment = await PaymentModel.findByBookingId(bookingId);
    if (existingPayment && existingPayment.status === 'success') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_ALREADY_EXISTS',
          message: 'Payment already completed for this booking',
        },
      });
    }

    // Get gym details
    const gym = await GymModel.findById(booking.gymId);
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GYM_NOT_FOUND',
          message: 'Gym not found',
        },
      });
    }

    // Create or update payment record
    let payment;
    if (existingPayment) {
      payment = existingPayment;
    } else {
      payment = await PaymentModel.create({
        bookingId: booking.id,
        userId: booking.userId,
        gymId: booking.gymId,
        amount: booking.price,
      });
    }

    // Create Razorpay order
    const razorpayOrder = await RazorpayService.createOrder({
      amount: booking.price,
      currency: 'INR',
      receipt: `booking_${booking.id}_payment_${payment.id}`,
      notes: {
        bookingId: booking.id.toString(),
        paymentId: payment.id.toString(),
        userId: userId.toString(),
        gymId: booking.gymId.toString(),
        gymName: gym.name,
      },
    });

    // Update payment with Razorpay order ID
    await PaymentModel.updateRazorpayDetails(payment.id, razorpayOrder.id);

    // Return order details to frontend
    res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // Amount in paise
        currency: razorpayOrder.currency,
        keyId: RazorpayService.getKeyId(),
        booking: {
          id: booking.id,
          gymName: gym.name,
          sessionDate: booking.sessionDate,
          price: booking.price,
        },
      },
      message: 'Payment initiated successfully',
    });
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to initiate payment',
        details: error.message,
      },
    });
  }
};

/**
 * Get payment details
 * GET /api/v1/payments/:paymentId
 */
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const payment = await PaymentModel.findById(parseInt(paymentId));

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found',
        },
      });
    }

    // Verify user owns the payment
    if (payment.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this payment',
        },
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get payment',
      },
    });
  }
};

/**
 * Get user's payment history
 * GET /api/v1/payments/user
 */
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const payments = await PaymentModel.findByUserId(userId, limit, offset);
    const total = await PaymentModel.countByUserId(userId);

    res.json({
      success: true,
      data: payments,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + payments.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error getting user payments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get payments',
      },
    });
  }
};


/**
 * Process refund for a payment
 * POST /api/v1/payments/refund
 */
export const processRefund = async (req: Request, res: Response) => {
  try {
    const { bookingId, amount } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Validate booking ID
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID is required',
        },
      });
    }

    // Get booking details
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Verify user owns the booking
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to refund this booking',
        },
      });
    }

    // Check if booking is cancelled
    if (booking.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BOOKING_STATUS',
          message: 'Only cancelled bookings can be refunded',
        },
      });
    }

    // Get payment record
    const payment = await PaymentModel.findByBookingId(bookingId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found for this booking',
        },
      });
    }

    // Check if already refunded
    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_REFUNDED',
          message: 'Payment has already been refunded',
        },
      });
    }

    // Check if payment was successful
    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_SUCCESSFUL',
          message: 'Cannot refund a payment that was not successful',
        },
      });
    }

    // Check if Razorpay payment ID exists
    if (!payment.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_PAYMENT_ID',
          message: 'Razorpay payment ID not found',
        },
      });
    }

    // Validate refund amount
    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REFUND_AMOUNT',
          message: 'Refund amount cannot exceed payment amount',
        },
      });
    }

    // Initiate refund with Razorpay
    const refund = await RazorpayService.initiateRefund(
      payment.razorpayPaymentId,
      refundAmount
    );

    // Update payment with refund details
    await PaymentModel.addRefundDetails(
      payment.id,
      refund.id,
      refundAmount
    );

    // Get updated payment
    const updatedPayment = await PaymentModel.findById(payment.id);

    res.json({
      success: true,
      data: {
        payment: updatedPayment,
        refund: {
          id: refund.id,
          amount: refundAmount,
          status: refund.status,
        },
      },
      message: 'Refund processed successfully',
    });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process refund',
        details: error.message,
      },
    });
  }
};

/**
 * Get gym earnings and statistics
 * GET /api/v1/payments/gym/:gymId/earnings
 */
export const getGymEarnings = async (req: Request, res: Response) => {
  try {
    const { gymId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Get gym details
    const gym = await GymModel.findById(parseInt(gymId));
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GYM_NOT_FOUND',
          message: 'Gym not found',
        },
      });
    }

    // Verify user owns the gym
    if (gym.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to view earnings for this gym',
        },
      });
    }

    // Get date range from query params (optional)
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Calculate total earnings
    const earningsData = await PaymentModel.calculateGymEarnings(parseInt(gymId));

    // Get recent transactions
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const transactions = await PaymentModel.findByGymId(parseInt(gymId), limit, offset);
    const totalTransactions = await PaymentModel.countByGymId(parseInt(gymId));

    // Calculate earnings by status
    const earningsByStatus = {
      successful: earningsData.totalEarnings,
      pending: 0,
      refunded: 0,
    };

    // Get pending and refunded amounts
    const statusQuery = `
      SELECT 
        status,
        COALESCE(SUM(gym_earnings), 0) as total
      FROM payments
      WHERE gym_id = $1 AND status IN ('pending', 'refunded')
      GROUP BY status
    `;
    const statusResult = await pgPool.query(statusQuery, [parseInt(gymId)]);
    statusResult.rows.forEach((row: any) => {
      if (row.status === 'pending') {
        earningsByStatus.pending = parseFloat(row.total);
      } else if (row.status === 'refunded') {
        earningsByStatus.refunded = parseFloat(row.total);
      }
    });

    // Calculate earnings by date range if provided
    let earningsByPeriod = null;
    if (startDate && endDate) {
      const periodQuery = `
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(gym_earnings), 0) as earnings,
          COUNT(*) as transactions
        FROM payments
        WHERE gym_id = $1 
          AND status = 'success'
          AND created_at >= $2
          AND created_at <= $3
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
      const periodResult = await pgPool.query(periodQuery, [
        parseInt(gymId),
        startDate,
        endDate,
      ]);
      earningsByPeriod = periodResult.rows;
    }

    res.json({
      success: true,
      data: {
        gym: {
          id: gym.id,
          name: gym.name,
        },
        earnings: {
          total: earningsData.totalEarnings,
          successfulPayments: earningsData.successfulPayments,
          pending: earningsByStatus.pending,
          refunded: earningsByStatus.refunded,
          netEarnings: earningsData.totalEarnings - earningsByStatus.refunded,
        },
        transactions: {
          data: transactions,
          pagination: {
            limit,
            offset,
            total: totalTransactions,
            hasMore: offset + transactions.length < totalTransactions,
          },
        },
        earningsByPeriod,
      },
      message: 'Gym earnings retrieved successfully',
    });
  } catch (error: any) {
    console.error('Error getting gym earnings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get gym earnings',
        details: error.message,
      },
    });
  }
};

/**
 * Verify Razorpay payment
 * POST /api/v1/payments/verify
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !paymentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required payment verification fields',
        },
      });
    }

    // Get payment record
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PAYMENT_NOT_FOUND',
          message: 'Payment not found',
        },
      });
    }

    // Verify user owns the payment
    if (payment.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to verify this payment',
        },
      });
    }

    // Check if payment is already successful
    if (payment.status === 'success') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PAYMENT_ALREADY_VERIFIED',
          message: 'Payment has already been verified',
        },
      });
    }

    // Verify Razorpay signature
    const isValid = RazorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      // Update payment status to failed
      await PaymentModel.updateStatus(payment.id, 'failed');

      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Payment signature verification failed',
        },
      });
    }

    // Update payment with Razorpay details and status
    await PaymentModel.updateRazorpayDetails(
      payment.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    await PaymentModel.updateStatus(payment.id, 'success');

    // Update booking status to confirmed
    const booking = await BookingModel.updateStatus(payment.bookingId, 'confirmed');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Associated booking not found',
        },
      });
    }

    // Get updated payment
    const updatedPayment = await PaymentModel.findById(payment.id);

    res.json({
      success: true,
      data: {
        payment: updatedPayment,
        booking: booking,
      },
      message: 'Payment verified successfully',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify payment',
        details: error.message,
      },
    });
  }
};
