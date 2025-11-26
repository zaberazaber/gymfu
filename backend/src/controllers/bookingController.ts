import { Request, Response } from 'express';
import BookingModel from '../models/Booking';
import { GymModel } from '../models/Gym';
import PaymentModel from '../models/Payment';
import RazorpayService from '../services/razorpayService';
import qrCodeService from '../services/qrCodeService';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { gymId, sessionDate } = req.body;
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
    if (!gymId || !sessionDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Gym ID and session date are required',
        },
      });
    }

    // Validate session date is in the future
    const session = new Date(sessionDate);
    if (session < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Session date must be in the future',
        },
      });
    }

    // Get gym details to calculate price
    const gym = await GymModel.findById(gymId);
    if (!gym) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'GYM_NOT_FOUND',
          message: 'Gym not found',
        },
      });
    }

    // Check if gym has available capacity
    const hasCapacity = await GymModel.hasCapacity(gymId);
    if (!hasCapacity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'GYM_AT_CAPACITY',
          message: `Gym is currently at full capacity (${gym.currentOccupancy}/${gym.capacity}). Please try again later.`,
        },
      });
    }

    // Create booking with 'pending' status (will be confirmed after payment)
    const booking = await BookingModel.create({
      userId,
      gymId,
      sessionDate: session,
      price: gym.basePrice,
    });

    // Create payment record
    const payment = await PaymentModel.create({
      bookingId: booking.id,
      userId: booking.userId,
      gymId: booking.gymId,
      amount: booking.price,
    });

    // Check if Razorpay is configured
    if (!RazorpayService.isConfigured()) {
      // If payment gateway not configured, auto-confirm booking (for development)
      const confirmedBooking = await BookingModel.updateStatus(booking.id, 'confirmed');
      
      // Generate QR code
      const qrCodeString = qrCodeService.generateQRCodeString(booking.id);
      const qrCodeExpiry = new Date();
      qrCodeExpiry.setHours(qrCodeExpiry.getHours() + 24);
      const updatedBooking = await BookingModel.updateQrCode(booking.id, qrCodeString, qrCodeExpiry);
      const qrCodeImage = await qrCodeService.generateQRCodeImage(qrCodeString);

      return res.status(201).json({
        success: true,
        data: {
          booking: updatedBooking,
          qrCodeImage,
          paymentRequired: false,
        },
        message: 'Booking confirmed successfully (payment gateway not configured)',
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

    // Return booking and payment details
    res.status(201).json({
      success: true,
      data: {
        booking: booking,
        payment: {
          id: payment.id,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: RazorpayService.getKeyId(),
        },
        paymentRequired: true,
      },
      message: 'Booking created. Please complete payment to confirm.',
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking',
      },
    });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.userId;

    const booking = await BookingModel.findById(parseInt(bookingId));

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Ensure user can only access their own bookings
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this booking',
        },
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error('Error getting booking:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get booking',
      },
    });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
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

    // Get bookings with gym details
    const bookings = await BookingModel.findByUserIdWithGymDetails(userId, limit, offset);

    // Get total count for pagination
    const total = await BookingModel.countByUserId(userId);

    // Transform the flat structure to nested gym object
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      userId: booking.userId,
      gymId: booking.gymId,
      sessionDate: booking.sessionDate,
      price: booking.price,
      status: booking.status,
      qrCode: booking.qrCode,
      qrCodeExpiry: booking.qrCodeExpiry,
      checkInTime: booking.checkInTime,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      gym: {
        id: booking.gymId,
        name: booking.gymName,
        address: booking.gymAddress,
        city: booking.gymCity,
        pincode: booking.gymPincode,
        latitude: booking.gymLatitude,
        longitude: booking.gymLongitude,
        amenities: booking.gymAmenities,
        images: booking.gymImages,
        rating: booking.gymRating,
        isVerified: booking.gymIsVerified,
      },
    }));

    res.json({
      success: true,
      data: transformedBookings,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + bookings.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get bookings',
      },
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.userId;

    const booking = await BookingModel.findById(parseInt(bookingId));

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Ensure user can only cancel their own bookings
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to cancel this booking',
        },
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CANCELLED',
          message: 'Booking is already cancelled',
        },
      });
    }

    if (booking.status === 'completed' || booking.status === 'checked_in') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CANCEL',
          message: 'Cannot cancel a completed or checked-in booking',
        },
      });
    }

    // Cancel the booking
    const updatedBooking = await BookingModel.updateStatus(parseInt(bookingId), 'cancelled');

    // Check if there's a successful payment to refund
    const payment = await PaymentModel.findByBookingId(parseInt(bookingId));
    let refundInfo = null;

    if (payment && payment.status === 'success' && payment.razorpayPaymentId) {
      try {
        // Automatically initiate refund
        const refund = await RazorpayService.initiateRefund(payment.razorpayPaymentId);
        
        // Update payment with refund details
        await PaymentModel.addRefundDetails(payment.id, refund.id, payment.amount);
        
        refundInfo = {
          refundId: refund.id,
          amount: payment.amount,
          status: refund.status,
        };
      } catch (refundError: any) {
        console.error('Error processing automatic refund:', refundError);
        // Don't fail the cancellation if refund fails
        // User can request refund manually later
      }
    }

    res.json({
      success: true,
      data: {
        booking: updatedBooking,
        refund: refundInfo,
      },
      message: refundInfo 
        ? 'Booking cancelled and refund initiated successfully' 
        : 'Booking cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel booking',
      },
    });
  }
};

export const generateQRCode = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.userId;

    const booking = await BookingModel.findById(parseInt(bookingId));

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Ensure user can only access their own bookings
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this booking',
        },
      });
    }

    // Generate QR code string if not already generated
    let qrCodeString = booking.qrCode;
    if (!qrCodeString) {
      qrCodeString = qrCodeService.generateQRCodeString(booking.id);

      // Set QR code expiry to 24 hours from now
      const qrCodeExpiry = new Date();
      qrCodeExpiry.setHours(qrCodeExpiry.getHours() + 24);

      await BookingModel.updateQrCode(booking.id, qrCodeString, qrCodeExpiry);
    }

    // Generate QR code image
    const qrCodeImage = await qrCodeService.generateQRCodeImage(qrCodeString);

    res.json({
      success: true,
      data: {
        bookingId: booking.id,
        qrCodeString,
        qrCodeImage,
      },
    });
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate QR code',
      },
    });
  }
};

export const checkInBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.userId;

    const booking = await BookingModel.findById(parseInt(bookingId));

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Ensure user can only check-in their own bookings
    if (booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to check-in this booking',
        },
      });
    }

    // Check if booking status is 'confirmed'
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot check-in booking with status '${booking.status}'. Booking must be confirmed.`,
        },
      });
    }

    // Check if QR code exists
    if (!booking.qrCode) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_QR_CODE',
          message: 'Booking does not have a QR code',
        },
      });
    }

    // Check if QR code is expired
    if (booking.qrCodeExpiry) {
      const now = new Date();
      const expiry = new Date(booking.qrCodeExpiry);

      if (now > expiry) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QR_CODE_EXPIRED',
            message: 'QR code has expired',
          },
        });
      }
    }

    // Perform check-in
    const checkedInBooking = await BookingModel.checkIn(parseInt(bookingId));

    // Increment gym occupancy
    await GymModel.incrementOccupancy(booking.gymId);

    res.json({
      success: true,
      data: checkedInBooking,
      message: 'Check-in successful',
    });
  } catch (error: any) {
    console.error('Error checking in booking:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check-in booking',
      },
    });
  }
};
