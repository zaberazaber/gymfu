import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';
import { JWTService } from '../services/jwtService';
import { AppError } from '../middleware/errorHandler';

// Mock the JWTService
jest.mock('../services/jwtService');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const mockPayload = {
        userId: 1,
        phoneNumber: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (JWTService.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(JWTService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail when no authorization header', () => {
      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('NO_TOKEN');
    });

    it('should fail when authorization format is invalid', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('INVALID_TOKEN_FORMAT');
    });

    it('should fail when token is empty', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('EMPTY_TOKEN');
    });

    it('should handle expired token', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      (JWTService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('TOKEN_EXPIRED');
    });

    it('should handle invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (JWTService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token invalid');
      });

      authenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('optionalAuthenticate', () => {
    it('should authenticate valid token', () => {
      const mockPayload = {
        userId: 1,
        phoneNumber: '9876543210',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (JWTService.verifyToken as jest.Mock).mockReturnValue(mockPayload);

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(JWTService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user when no token', () => {
      optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (JWTService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuthenticate(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
