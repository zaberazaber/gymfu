import { Request, Response } from 'express';
import BookingModel from '../models/Booking';
import { GymModel } from '../models/Gym';
import qrCodeService from '../services/qrCodeService';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { gymId, sessionDate } = req.body;
    const userId = (req as any).user.id;

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

    // Create booking with gym's base price (status is 'confirmed' by default)
    const booking = await BookingModel.create({
      userId,
      gymId,
      sessionDate: session,
      price: gym.basePrice,
    });

    // Generate QR code immediately
    const qrCodeString = qrCodeService.generateQRCodeString(booking.id);
    
    // Set QR code expiry to 24 hours from now
    const qrCodeExpiry = new Date();
    qrCodeExpiry.setHours(qrCodeExpiry.getHours() + 24);
    
    // Update booking with QR code and expiry
    const updatedBooking = await BookingModel.updateQrCode(booking.id, qrCodeString, qrCodeExpiry);

    // Generate QR code image
    const qrCodeImage = await qrCodeService.generateQRCodeImage(qrCodeString);

    res.status(201).json({
      success: true,
      data: {
        ...updatedBooking,
        qrCodeImage,
      },
      message: 'Booking confirmed successfully',
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
    const userId = (req as any).user.id;

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
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const bookings = await BookingModel.findByUserId(userId, limit, offset);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        limit,
        offset,
        total: bookings.length,
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
    const userId = (req as any).user.id;

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

    const updatedBooking = await BookingModel.updateStatus(parseInt(bookingId), 'cancelled');

    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking cancelled successfully',
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
    const userId = (req as any).user.id;

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
    const userId = (req as any).user.id;

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
