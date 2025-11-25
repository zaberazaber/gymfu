import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance (lazy initialization to avoid errors in tests)
let razorpay: Razorpay | null = null;

const getRazorpayInstance = (): Razorpay => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }
    
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
};

export interface RazorpayOrderOptions {
  amount: number; // Amount in rupees (will be converted to paise)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export class RazorpayService {
  /**
   * Create a Razorpay order
   * @param options Order options
   * @returns Razorpay order details
   */
  static async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
    try {
      const razorpayInstance = getRazorpayInstance();
      
      // Convert amount from rupees to paise (Razorpay uses paise)
      const amountInPaise = Math.round(options.amount * 100);

      const orderOptions = {
        amount: amountInPaise,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {},
      };

      const order = await razorpayInstance.orders.create(orderOptions);
      return order as RazorpayOrder;
    } catch (error: any) {
      console.error('Razorpay order creation failed:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param orderId Razorpay order ID
   * @param paymentId Razorpay payment ID
   * @param signature Razorpay signature
   * @returns True if signature is valid
   */
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      
      // Create expected signature
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Compare signatures
      return generatedSignature === signature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Fetch payment details from Razorpay
   * @param paymentId Razorpay payment ID
   * @returns Payment details
   */
  static async fetchPayment(paymentId: string): Promise<any> {
    try {
      const razorpayInstance = getRazorpayInstance();
      const payment = await razorpayInstance.payments.fetch(paymentId);
      return payment;
    } catch (error: any) {
      console.error('Failed to fetch payment:', error);
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  /**
   * Initiate a refund
   * @param paymentId Razorpay payment ID
   * @param amount Amount to refund in rupees (optional, full refund if not specified)
   * @returns Refund details
   */
  static async initiateRefund(paymentId: string, amount?: number): Promise<any> {
    try {
      const razorpayInstance = getRazorpayInstance();
      const refundOptions: any = {};
      
      if (amount) {
        // Convert to paise
        refundOptions.amount = Math.round(amount * 100);
      }

      const refund = await razorpayInstance.payments.refund(paymentId, refundOptions);
      return refund;
    } catch (error: any) {
      console.error('Refund initiation failed:', error);
      throw new Error(`Failed to initiate refund: ${error.message}`);
    }
  }

  /**
   * Check if Razorpay is configured
   * @returns True if API keys are configured
   */
  static isConfigured(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  /**
   * Get Razorpay key ID for frontend
   * @returns Razorpay key ID
   */
  static getKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || '';
  }
}

export default RazorpayService;
