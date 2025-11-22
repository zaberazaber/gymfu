import { pgPool } from '../config/database';
import bcrypt from 'bcrypt';

export interface Location {
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface User {
  id: number;
  phoneNumber?: string;
  email?: string;
  name: string;
  password: string;
  age?: number;
  gender?: string;
  location?: Location;
  fitnessGoals?: string[];
  profileImage?: string;
  isPartner?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  phoneNumber?: string;
  email?: string;
  name: string;
  password: string;
  isPartner?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  age?: number;
  gender?: string;
  location?: Location;
  fitnessGoals?: string[];
  profileImage?: string;
}

export class UserModel {
  // Create a new user
  static async create(userData: CreateUserData): Promise<User> {
    const { phoneNumber, email, name, password, isPartner } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (phone_number, email, name, password, is_partner, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, phone_number as "phoneNumber", email, name, is_partner as "isPartner", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const values = [phoneNumber || null, email || null, name, hashedPassword, isPartner || false];

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
      SELECT id, phone_number as "phoneNumber", email, name, password, is_partner as "isPartner", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE phone_number = $1
    `;

    const result = await pgPool.query(query, [phoneNumber]);
    return result.rows[0] || null;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, phone_number as "phoneNumber", email, name, password, is_partner as "isPartner", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;

    const result = await pgPool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT 
        id, 
        phone_number as "phoneNumber", 
        email, 
        name, 
        password, 
        age,
        gender,
        location,
        fitness_goals as "fitnessGoals",
        profile_image as "profileImage",
        is_partner as "isPartner",
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get user profile (without password)
  static async getProfile(id: number): Promise<Omit<User, 'password'> | null> {
    const query = `
      SELECT 
        id, 
        phone_number as "phoneNumber", 
        email, 
        name, 
        age,
        gender,
        location,
        fitness_goals as "fitnessGoals",
        profile_image as "profileImage",
        is_partner as "isPartner",
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Update user profile
  static async updateProfile(id: number, profileData: UpdateProfileData): Promise<Omit<User, 'password'> | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (profileData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(profileData.name);
    }

    if (profileData.age !== undefined) {
      fields.push(`age = $${paramCount++}`);
      values.push(profileData.age);
    }

    if (profileData.gender !== undefined) {
      fields.push(`gender = $${paramCount++}`);
      values.push(profileData.gender);
    }

    if (profileData.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(JSON.stringify(profileData.location));
    }

    if (profileData.fitnessGoals !== undefined) {
      fields.push(`fitness_goals = $${paramCount++}`);
      values.push(profileData.fitnessGoals);
    }

    if (profileData.profileImage !== undefined) {
      fields.push(`profile_image = $${paramCount++}`);
      values.push(profileData.profileImage);
    }

    if (fields.length === 0) {
      return this.getProfile(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, 
        phone_number as "phoneNumber", 
        email, 
        name, 
        age,
        gender,
        location,
        fitness_goals as "fitnessGoals",
        profile_image as "profileImage",
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, values);
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
