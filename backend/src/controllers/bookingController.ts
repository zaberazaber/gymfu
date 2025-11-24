import { Request, Response } from 'express';
import BookingModel from '../models/Booking';
import { GymModel } from '../models/Gym';

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

    // Create booking with gym's base price
    const booking = await BookingModel.create({
      userId,
      gymId,
      sessionDate: session,
      price: gym.basePrice,
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully',
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
