import QRCode from 'qrcode';
import crypto from 'crypto';

class QRCodeService {
  /**
   * Generate a unique QR code string for a booking
   * Format: BOOKING-{bookingId}-{timestamp}-{hash}
   */
  generateQRCodeString(bookingId: number): string {
    const timestamp = Date.now();
    const hash = crypto
      .createHash('sha256')
      .update(`${bookingId}-${timestamp}-${process.env.JWT_SECRET || 'secret'}`)
      .digest('hex')
      .substring(0, 8);

    return `BOOKING-${bookingId}-${timestamp}-${hash}`;
  }

  /**
   * Generate QR code as base64 image
   */
  async generateQRCodeImage(qrCodeString: string): Promise<string> {
    try {
      // Generate QR code as data URL (base64)
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code image:', error);
      throw new Error('Failed to generate QR code image');
    }
  }

  /**
   * Verify QR code string format
   */
  verifyQRCodeFormat(qrCodeString: string): boolean {
    const pattern = /^BOOKING-\d+-\d+-[a-f0-9]{8}$/;
    return pattern.test(qrCodeString);
  }

  /**
   * Extract booking ID from QR code string
   */
  extractBookingId(qrCodeString: string): number | null {
    if (!this.verifyQRCodeFormat(qrCodeString)) {
      return null;
    }

    const parts = qrCodeString.split('-');
    return parseInt(parts[1]);
  }
}

export default new QRCodeService();
