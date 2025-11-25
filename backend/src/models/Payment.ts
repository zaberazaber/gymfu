import { pgPool } from '../config/database';

export interface Payment {
    id: number;
    bookingId: number;
    userId: number;
    gymId: number;
    amount: number;
    platformCommission: number;
    gymEarnings: number;
    status: 'pending' | 'success' | 'failed' | 'refunded';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    razorpayRefundId?: string;
    refundAmount?: number;
    createdAt: Date;
    updatedAt?: Date;
}

export interface CreatePaymentData {
    bookingId: number;
    userId: number;
    gymId: number;
    amount: number;
}

export class PaymentModel {
    // Commission rates
    private static readonly PLATFORM_COMMISSION_RATE = 0.15; // 15%
    private static readonly GYM_EARNINGS_RATE = 0.85; // 85%

    // Calculate commission and earnings
    static calculateCommission(amount: number): { platformCommission: number; gymEarnings: number } {
        const platformCommission = Math.round(amount * this.PLATFORM_COMMISSION_RATE * 100) / 100;
        const gymEarnings = Math.round(amount * this.GYM_EARNINGS_RATE * 100) / 100;

        return {
            platformCommission,
            gymEarnings,
        };
    }

    // Create a new payment
    static async create(paymentData: CreatePaymentData): Promise<Payment> {
        const { platformCommission, gymEarnings } = this.calculateCommission(paymentData.amount);

        const query = `
      INSERT INTO payments (
        booking_id, user_id, gym_id, amount, 
        platform_commission, gym_earnings, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", created_at as "createdAt", updated_at as "updatedAt"
    `;

        const result = await pgPool.query(query, [
            paymentData.bookingId,
            paymentData.userId,
            paymentData.gymId,
            paymentData.amount,
            platformCommission,
            gymEarnings,
            'pending',
        ]);

        return result.rows[0];
    }

    // Find payment by ID
    static async findById(id: number): Promise<Payment | null> {
        const query = `
      SELECT 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", razorpay_refund_id as "razorpayRefundId",
        refund_amount as "refundAmount", created_at as "createdAt", updated_at as "updatedAt"
      FROM payments
      WHERE id = $1
    `;

        const result = await pgPool.query(query, [id]);
        return result.rows[0] || null;
    }

    // Find payment by booking ID
    static async findByBookingId(bookingId: number): Promise<Payment | null> {
        const query = `
      SELECT 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", razorpay_refund_id as "razorpayRefundId",
        refund_amount as "refundAmount", created_at as "createdAt", updated_at as "updatedAt"
      FROM payments
      WHERE booking_id = $1
    `;

        const result = await pgPool.query(query, [bookingId]);
        return result.rows[0] || null;
    }

    // Find payments by user ID
    static async findByUserId(userId: number, limit: number = 10, offset: number = 0): Promise<Payment[]> {
        const query = `
      SELECT 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", razorpay_refund_id as "razorpayRefundId",
        refund_amount as "refundAmount", created_at as "createdAt", updated_at as "updatedAt"
      FROM payments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

        const result = await pgPool.query(query, [userId, limit, offset]);
        return result.rows;
    }

    // Find payments by gym ID (for gym earnings)
    static async findByGymId(gymId: number, limit: number = 10, offset: number = 0): Promise<Payment[]> {
        const query = `
      SELECT 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", razorpay_refund_id as "razorpayRefundId",
        refund_amount as "refundAmount", created_at as "createdAt", updated_at as "updatedAt"
      FROM payments
      WHERE gym_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

        const result = await pgPool.query(query, [gymId, limit, offset]);
        return result.rows;
    }

    // Update payment status
    static async updateStatus(
        id: number,
        status: 'pending' | 'success' | 'failed' | 'refunded'
    ): Promise<Payment | null> {
        const query = `
      UPDATE payments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", razorpay_refund_id as "razorpayRefundId",
        refund_amount as "refundAmount", created_at as "createdAt", updated_at as "updatedAt"
    `;

        const result = await pgPool.query(query, [status, id]);
        return result.rows[0] || null;
    }

    // Update Razorpay details
    static async updateRazorpayDetails(
        id: number,
        razorpayOrderId: string,
        razorpayPaymentId?: string,
        razorpaySignature?: string
    ): Promise<Payment | null> {
        const query = `
      UPDATE payments
      SET 
        razorpay_order_id = $1,
        razorpay_payment_id = $2,
        razorpay_signature = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", razorpay_refund_id as "razorpayRefundId",
        refund_amount as "refundAmount", created_at as "createdAt", updated_at as "updatedAt"
    `;

        const result = await pgPool.query(query, [razorpayOrderId, razorpayPaymentId, razorpaySignature, id]);
        return result.rows[0] || null;
    }

    // Calculate total earnings for a gym
    static async calculateGymEarnings(gymId: number): Promise<{ totalEarnings: number; successfulPayments: number }> {
        const query = `
      SELECT 
        COALESCE(SUM(gym_earnings), 0) as "totalEarnings",
        COUNT(*) as "successfulPayments"
      FROM payments
      WHERE gym_id = $1 AND status = 'success'
    `;

        const result = await pgPool.query(query, [gymId]);
        return {
            totalEarnings: parseFloat(result.rows[0].totalEarnings),
            successfulPayments: parseInt(result.rows[0].successfulPayments),
        };
    }

    // Calculate platform commission total
    static async calculatePlatformCommission(): Promise<{ totalCommission: number; successfulPayments: number }> {
        const query = `
      SELECT 
        COALESCE(SUM(platform_commission), 0) as "totalCommission",
        COUNT(*) as "successfulPayments"
      FROM payments
      WHERE status = 'success'
    `;

        const result = await pgPool.query(query);
        return {
            totalCommission: parseFloat(result.rows[0].totalCommission),
            successfulPayments: parseInt(result.rows[0].successfulPayments),
        };
    }

    // Count payments by user
    static async countByUserId(userId: number): Promise<number> {
        const query = 'SELECT COUNT(*) as count FROM payments WHERE user_id = $1';
        const result = await pgPool.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }

    // Count payments by gym
    static async countByGymId(gymId: number): Promise<number> {
        const query = 'SELECT COUNT(*) as count FROM payments WHERE gym_id = $1';
        const result = await pgPool.query(query, [gymId]);
        return parseInt(result.rows[0].count);
    }

    // Add refund details to payment
    static async addRefundDetails(
        id: number,
        razorpayRefundId: string,
        refundAmount: number
    ): Promise<Payment | null> {
        const query = `
      UPDATE payments
      SET 
        razorpay_refund_id = $1,
        refund_amount = $2,
        status = 'refunded',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING 
        id, booking_id as "bookingId", user_id as "userId", gym_id as "gymId",
        amount, platform_commission as "platformCommission", gym_earnings as "gymEarnings",
        status, razorpay_order_id as "razorpayOrderId", razorpay_payment_id as "razorpayPaymentId",
        razorpay_signature as "razorpaySignature", razorpay_refund_id as "razorpayRefundId",
        refund_amount as "refundAmount", created_at as "createdAt", updated_at as "updatedAt"
    `;

        const result = await pgPool.query(query, [razorpayRefundId, refundAmount, id]);
        return result.rows[0] || null;
    }
}

export default PaymentModel;
