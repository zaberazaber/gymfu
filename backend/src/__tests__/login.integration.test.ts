import request from 'supertest';
import app from '../index';
import { UserModel } from '../models/User';
import { OTPService } from '../services/otpService';

// Mock the database and services
jest.mock('../config/database');
jest.mock('../models/User');
jest.mock('../services/otpService');
jest.mock('../services/notificationService');

describe('Login Integration Tests', () => {
  describe('POST /api/v1/auth/login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should send OTP for existing user with phone number', async () => {
      const mockUser = {
        id: 1,
        phoneNumber: '9876543210',
        email: null,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (UserModel.findByPhone as jest.Mock).mockResolvedValue(mockUser);
      (OTPService.generateOTP as jest.Mock).mockReturnValue('123456');
      (OTPService.storeOTP as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '9876543210' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent successfully');
      expect(response.body.data.identifier).toBe('phone');
      expect(response.body.data.maskedValue).toBe('******3210');
      expect(UserModel.findByPhone).toHaveBeenCalledWith('9876543210');
      expect(OTPService.generateOTP).toHaveBeenCalled();
      expect(OTPService.storeOTP).toHaveBeenCalledWith('9876543210', '123456');
    });

    it('should send OTP for existing user with email', async () => {
      const mockUser = {
        id: 2,
        phoneNumber: null,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (OTPService.generateOTP as jest.Mock).mockReturnValue('654321');
      (OTPService.storeOTP as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent successfully');
      expect(response.body.data.identifier).toBe('email');
      expect(response.body.data.maskedValue).toBe('te***@example.com');
      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(OTPService.generateOTP).toHaveBeenCalled();
      expect(OTPService.storeOTP).toHaveBeenCalledWith('test@example.com', '654321');
    });

    it('should return 404 when user does not exist', async () => {
      (UserModel.findByPhone as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '9999999999' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
      expect(response.body.error.message).toContain('not found');
    });

    it('should return 400 when no phone or email provided', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should return 400 when invalid phone number format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should return 400 when invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('Complete Login Flow', () => {
    it('should complete login flow with OTP verification', async () => {
      const mockUser = {
        id: 1,
        phoneNumber: '9876543210',
        email: null,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Step 1: Login - send OTP
      (UserModel.findByPhone as jest.Mock).mockResolvedValue(mockUser);
      (OTPService.generateOTP as jest.Mock).mockReturnValue('123456');
      (OTPService.storeOTP as jest.Mock).mockResolvedValue(undefined);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '9876543210' })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.message).toContain('OTP sent successfully');

      // Step 2: Verify OTP - get token
      (OTPService.verifyOTP as jest.Mock).mockResolvedValue(true);
      (UserModel.findByPhone as jest.Mock).mockResolvedValue(mockUser);

      const verifyResponse = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phoneNumber: '9876543210', otp: '123456' })
        .expect(200);

      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.data.token).toBeDefined();
      expect(verifyResponse.body.data.user.id).toBe(mockUser.id);
      expect(verifyResponse.body.message).toContain('OTP verified successfully');
    });
  });
});
