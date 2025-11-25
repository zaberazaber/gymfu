import { Request, Response } from 'express';
import PaymentModel from '../models/Payment';
import BookingModel from '../models/Booking';
import { GymModel } from '../models/Gym';
import RazorpayService from '../services/razorpayService';

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
