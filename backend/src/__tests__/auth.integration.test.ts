import request from 'supertest';
import app from '../index';
import { UserModel } from '../models/User';
import { redisClient } from '../config/database';

// Mock the database and services
jest.mock('../config/database');
jest.mock('../models/User');
jest.mock('../services/otpService');
jest.mock('../services/notificationService');

describe('Authentication Integration Tests', () => {
  describe('GET /api/v1/users/me', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should return 401 when invalid token format', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN_FORMAT');
    });

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      // Token could be expired or invalid depending on the token format
      expect(['INVALID_TOKEN', 'TOKEN_EXPIRED']).toContain(response.body.error.code);
    });

    it('should return user data when valid token is provided', async () => {
      // Create a valid token for testing
      const { JWTService } = require('../services/jwtService');
      const mockUser = {
        id: 1,
        phoneNumber: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = JWTService.generateToken(mockUser);

      // Mock UserModel.findById to return the user
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockUser.id);
      expect(response.body.data.name).toBe(mockUser.name);
      expect(response.body.data.phoneNumber).toBe(mockUser.phoneNumber);
      expect(response.body.data.email).toBe(mockUser.email);
      expect(response.body.data.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 404 when user not found', async () => {
      const { JWTService } = require('../services/jwtService');
      const mockUser = {
        id: 999,
        phoneNumber: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
      };

      const token = JWTService.generateToken(mockUser);

      // Mock UserModel.findById to return null
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });
});
