import { pgPool } from '../config/database';

export interface Gym {
  id: number;
  name: string;
  ownerId: number;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  pincode: string;
  amenities: string[];
  basePrice: number;
  capacity: number;
  rating: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateGymData {
  name: string;
  ownerId: number;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  pincode: string;
  amenities?: string[];
  basePrice: number;
  capacity: number;
}

export class GymModel {
  // Create a new gym
  static async create(gymData: CreateGymData): Promise<Gym> {
    const query = `
      INSERT INTO gyms (
        name, owner_id, address, latitude, longitude, city, pincode,
        amenities, base_price, capacity
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, name, owner_id as "ownerId", address, latitude, longitude,
        city, pincode, amenities, base_price as "basePrice", capacity,
        rating, is_verified as "isVerified", created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      gymData.name,
      gymData.ownerId,
      gymData.address,
      gymData.latitude,
      gymData.longitude,
      gymData.city,
      gymData.pincode,
      gymData.amenities || [],
      gymData.basePrice,
      gymData.capacity,
    ];

    const result = await pgPool.query(query, values);
    return result.rows[0];
  }

  // Find gym by ID
  static async findById(id: number): Promise<Gym | null> {
    const query = `
      SELECT 
        id, name, owner_id as "ownerId", address, latitude, longitude,
        city, pincode, amenities, base_price as "basePrice", capacity,
        rating, is_verified as "isVerified", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM gyms
      WHERE id = $1
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find gyms by owner ID
  static async findByOwnerId(ownerId: number): Promise<Gym[]> {
    const query = `
      SELECT 
        id, name, owner_id as "ownerId", address, latitude, longitude,
        city, pincode, amenities, base_price as "basePrice", capacity,
        rating, is_verified as "isVerified", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM gyms
      WHERE owner_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pgPool.query(query, [ownerId]);
    return result.rows;
  }

  // Find all gyms with pagination
  static async findAll(limit: number = 10, offset: number = 0): Promise<Gym[]> {
    const query = `
      SELECT 
        id, name, owner_id as "ownerId", address, latitude, longitude,
        city, pincode, amenities, base_price as "basePrice", capacity,
        rating, is_verified as "isVerified", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM gyms
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pgPool.query(query, [limit, offset]);
    return result.rows;
  }

  // Update gym
  static async update(id: number, gymData: Partial<CreateGymData>): Promise<Gym | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (gymData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(gymData.name);
    }
    if (gymData.address !== undefined) {
      fields.push(`address = $${paramCount++}`);
      values.push(gymData.address);
    }
    if (gymData.latitude !== undefined) {
      fields.push(`latitude = $${paramCount++}`);
      values.push(gymData.latitude);
    }
    if (gymData.longitude !== undefined) {
      fields.push(`longitude = $${paramCount++}`);
      values.push(gymData.longitude);
    }
    if (gymData.city !== undefined) {
      fields.push(`city = $${paramCount++}`);
      values.push(gymData.city);
    }
    if (gymData.pincode !== undefined) {
      fields.push(`pincode = $${paramCount++}`);
      values.push(gymData.pincode);
    }
    if (gymData.amenities !== undefined) {
      fields.push(`amenities = $${paramCount++}`);
      values.push(gymData.amenities);
    }
    if (gymData.basePrice !== undefined) {
      fields.push(`base_price = $${paramCount++}`);
      values.push(gymData.basePrice);
    }
    if (gymData.capacity !== undefined) {
      fields.push(`capacity = $${paramCount++}`);
      values.push(gymData.capacity);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE gyms
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id, name, owner_id as "ownerId", address, latitude, longitude,
        city, pincode, amenities, base_price as "basePrice", capacity,
        rating, is_verified as "isVerified", created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, values);
    return result.rows[0] || null;
  }

  // Delete gym
  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM gyms WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  // Update verification status (admin only)
  static async updateVerificationStatus(id: number, isVerified: boolean): Promise<Gym | null> {
    const query = `
      UPDATE gyms
      SET is_verified = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id, name, owner_id as "ownerId", address, latitude, longitude,
        city, pincode, amenities, base_price as "basePrice", capacity,
        rating, is_verified as "isVerified", created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [isVerified, id]);
    return result.rows[0] || null;
  }

  // Count total gyms
  static async count(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM gyms';
    const result = await pgPool.query(query);
    return parseInt(result.rows[0].count);
  }
}
