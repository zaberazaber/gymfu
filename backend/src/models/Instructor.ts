import { Pool } from 'pg';
import { pgPool as pool } from '../config/database';

export interface Instructor {
  id: number;
  name: string;
  bio: string;
  specialization: string;
  rating: number;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstructorDTO {
  name: string;
  bio: string;
  specialization: string;
  rating?: number;
  profileImage?: string;
}

export class InstructorModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async create(data: CreateInstructorDTO): Promise<Instructor> {
    const query = `
      INSERT INTO instructors (name, bio, specialization, rating, profile_image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, bio, specialization, rating, profile_image as "profileImage", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      data.name,
      data.bio,
      data.specialization,
      data.rating || 0,
      data.profileImage || null,
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<Instructor | null> {
    const query = `
      SELECT id, name, bio, specialization, rating, profile_image as "profileImage", 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM instructors
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<Instructor[]> {
    const query = `
      SELECT id, name, bio, specialization, rating, profile_image as "profileImage",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM instructors
      ORDER BY rating DESC, name ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async update(id: number, data: Partial<CreateInstructorDTO>): Promise<Instructor | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${paramCount++}`);
      values.push(data.bio);
    }
    if (data.specialization !== undefined) {
      fields.push(`specialization = $${paramCount++}`);
      values.push(data.specialization);
    }
    if (data.rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(data.rating);
    }
    if (data.profileImage !== undefined) {
      fields.push(`profile_image = $${paramCount++}`);
      values.push(data.profileImage);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE instructors
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, bio, specialization, rating, profile_image as "profileImage",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM instructors WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }
}

export default new InstructorModel();
