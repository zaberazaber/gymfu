import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || '7d';

export interface JWTPayload {
  userId: number;
  phoneNumber?: string;
  email?: string;
  name: string;
}

export class JWTService {
  // Generate JWT token
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      name: user.name,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY as jwt.SignOptions['expiresIn'],
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Decode token without verification (for debugging)
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
