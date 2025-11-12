import { pgPool } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  phoneNumber?: string;
  email?: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  phoneNumber?: string;
  email?: string;
  name: string;
  password: string;
}

export class UserModel {
  // Create a new user
  static async create(userData: CreateUserData): Promise<User> {
    const { phoneNumber, email, name, password } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (phone_number, email, name, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, phone_number as "phoneNumber", email, name, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [phoneNumber || null, email || null, name, hashedPassword];

    try {
      const result = await pgPool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.constraint === 'users_phone_number_key') {
          throw new Error('Phone number already exists');
        }
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
      }
      throw error;
    }
  }

  // Find user by phone number
  static async findByPhone(phoneNumber: string): Promise<User | null> {
    const query = `
      SELECT id, phone_number as "phoneNumber", email, name, password, created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE phone_number = $1
    `;

    const result = await pgPool.query(query, [phoneNumber]);
    return result.rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, phone_number as "phoneNumber", email, name, password, created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;

    const result = await pgPool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, phone_number as "phoneNumber", email, name, password, created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Verify password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id: number, updates: Partial<CreateUserData>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }

    if (updates.phoneNumber !== undefined) {
      fields.push(`phone_number = $${paramCount++}`);
      values.push(updates.phoneNumber);
    }

    if (updates.password !== undefined) {
      const hashedPassword = await bcrypt.hash(updates.password, 10);
      fields.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, phone_number as "phoneNumber", email, name, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete user
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
