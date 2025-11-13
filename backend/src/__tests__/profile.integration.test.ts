import request from 'supertest';
import app from '../index';
import { UserModel } from '../models/User';

// Mock the database and services
jest.mock('../config/database');
jest.mock('../models/User');

describe('Profile Integration Tests', () => {
  const mockUser = {
    id: 1,
    phoneNumber: '9876543210',
    email: null,
    name: 'Test User',
    age: 25,
    gender: 'male',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001' },
    fitnessGoals: ['weight_loss', 'muscle_gain'],
    profileImage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let token: string;

  beforeAll(() => {
    // Generate a valid token for testing
    const { JWTService } = require('../services/jwtService');
    token = JWTService.generateToken(mockUser);
  });

  describe('GET /api/v1/users/profile', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should return user profile when authenticated', async () => {
      (UserModel.getProfile as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockUser.id);
      expect(response.body.data.name).toBe(mockUser.name);
      expect(response.body.data.age).toBe(mockUser.age);
      expect(response.body.data.gender).toBe(mockUser.gender);
      expect(response.body.data.location).toEqual(mockUser.location);
      expect(response.body.data.fitnessGoals).toEqual(mockUser.fitnessGoals);
    });

    it('should return 404 when profile not found', async () => {
      (UserModel.getProfile as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROFILE_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .send({ age: 30 })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, age: 30, gender: 'female' };
      (UserModel.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ age: 30, gender: 'female' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.age).toBe(30);
      expect(response.body.data.gender).toBe('female');
      expect(UserModel.updateProfile).toHaveBeenCalledWith(mockUser.id, { age: 30, gender: 'female' });
    });

    it('should update location successfully', async () => {
      const location = {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110001',
      };
      const updatedUser = { ...mockUser, location };
      (UserModel.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ location })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toEqual(location);
    });

    it('should update fitness goals successfully', async () => {
      const fitnessGoals = ['strength', 'endurance', 'flexibility'];
      const updatedUser = { ...mockUser, fitnessGoals };
      (UserModel.updateProfile as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ fitnessGoals })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fitnessGoals).toEqual(fitnessGoals);
    });

    it('should reject invalid age', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ age: 150 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should reject invalid gender', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ gender: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should reject invalid pincode', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ location: { pincode: '12345' } })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should reject invalid fitness goal', async () => {
      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ fitnessGoals: ['invalid_goal'] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });
  });
});
