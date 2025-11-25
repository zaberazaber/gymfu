import RazorpayService from '../services/razorpayService';
import crypto from 'crypto';

describe('RazorpayService', () => {
  describe('verifyPaymentSignature', () => {
    it('should verify valid payment signature', () => {
      // Set up test environment
      const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
      process.env.RAZORPAY_KEY_SECRET = 'test_secret_key';

      const orderId = 'order_test123';
      const paymentId = 'pay_test456';

      // Generate valid signature
      const generatedSignature = crypto
        .createHmac('sha256', 'test_secret_key')
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Verify signature
      const isValid = RazorpayService.verifyPaymentSignature(
        orderId,
        paymentId,
        generatedSignature
      );

      expect(isValid).toBe(true);

      // Restore original key
      process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    });

    it('should reject invalid payment signature', () => {
      // Set up test environment
      const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
      process.env.RAZORPAY_KEY_SECRET = 'test_secret_key';

      const orderId = 'order_test123';
      const paymentId = 'pay_test456';
      const invalidSignature = 'invalid_signature_string';

      // Verify signature
      const isValid = RazorpayService.verifyPaymentSignature(
        orderId,
        paymentId,
        invalidSignature
      );

      expect(isValid).toBe(false);

      // Restore original key
      process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    });

    it('should reject signature with tampered order ID', () => {
      // Set up test environment
      const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;
      process.env.RAZORPAY_KEY_SECRET = 'test_secret_key';

      const orderId = 'order_test123';
      const paymentId = 'pay_test456';
      const tamperedOrderId = 'order_tampered';

      // Generate signature with original order ID
      const signature = crypto
        .createHmac('sha256', 'test_secret_key')
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Try to verify with tampered order ID
      const isValid = RazorpayService.verifyPaymentSignature(
        tamperedOrderId,
        paymentId,
        signature
      );

      expect(isValid).toBe(false);

      // Restore original key
      process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    });
  });

  describe('isConfigured', () => {
    it('should return true when API keys are configured', () => {
      const originalKeyId = process.env.RAZORPAY_KEY_ID;
      const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

      process.env.RAZORPAY_KEY_ID = 'test_key_id';
      process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';

      const isConfigured = RazorpayService.isConfigured();
      expect(isConfigured).toBe(true);

      process.env.RAZORPAY_KEY_ID = originalKeyId;
      process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    });

    it('should return false when API keys are missing', () => {
      const originalKeyId = process.env.RAZORPAY_KEY_ID;
      const originalKeySecret = process.env.RAZORPAY_KEY_SECRET;

      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;

      const isConfigured = RazorpayService.isConfigured();
      expect(isConfigured).toBe(false);

      process.env.RAZORPAY_KEY_ID = originalKeyId;
      process.env.RAZORPAY_KEY_SECRET = originalKeySecret;
    });
  });
});
