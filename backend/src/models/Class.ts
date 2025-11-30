import { Pool } from 'pg';
import { pgPool as pool } from '../config/database';

export interface Class {
  id: number;
  gymId: number;
  instructorId: number;
  name: string;
  type: 'yoga' | 'zumba' | 'dance' | 'pilates' | 'spinning' | 'crossfit' | 'boxing';
  schedule: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  }[];
  capacity: number;
  price: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassWithDetails extends Class {
  gymName: string;
  instructorName: string;
  instructorRating: number;
  instructorSpecialization: string;
}

export interface CreateClassDTO {
  gymId: number;
  instructorId: number;
  name: string;
  type: 'yoga' | 'zumba' | 'dance' | 'pilates' | 'spinning' | 'crossfit' | 'boxing';
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  capacity: number;
  price: number;
  description?: string;
}

export class ClassModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async create(data: CreateClassDTO): Promise<Class> {
    const query = `
      INSERT INTO classes (gym_id, instructor_id, name, type, schedule, capacity, price, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, gym_id as "gymId", instructor_id as "instructorId", name, type, schedule, 
                capacity, price, description, created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      data.gymId,
      data.instructorId,
      data.name,
      data.type,
      JSON.stringify(data.schedule), // JSONB requires string input
      data.capacity,
      data.price,
      data.description || null,
    ];

    const result = await this.pool.query(query, values);
    const row = result.rows[0];
    // Schedule is already parsed by pg when using JSONB
    if (typeof row.schedule === 'string') {
      row.schedule = JSON.parse(row.schedule);
    }
    return row;
  }

  async findById(id: number): Promise<Class | null> {
    const query = `
      SELECT id, gym_id as "gymId", instructor_id as "instructorId", name, type, schedule,
             capacity, price, description, created_at as "createdAt", updated_at as "updatedAt"
      FROM classes
      WHERE id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    // Schedule is already parsed by pg when using JSONB
    if (typeof row.schedule === 'string') {
      row.schedule = JSON.parse(row.schedule);
    }
    return row;
  }

  async findByIdWithDetails(id: number): Promise<ClassWithDetails | null> {
    const query = `
      SELECT c.id, c.gym_id as "gymId", c.instructor_id as "instructorId", c.name, c.type, 
             c.schedule, c.capacity, c.price, c.description,
             c.created_at as "createdAt", c.updated_at as "updatedAt",
             g.name as "gymName",
             i.name as "instructorName", i.rating as "instructorRating", 
             i.specialization as "instructorSpecialization"
      FROM classes c
      JOIN gyms g ON c.gym_id = g.id
      JOIN instructors i ON c.instructor_id = i.id
      WHERE c.id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    // Schedule is already parsed by pg when using JSONB
    if (typeof row.schedule === 'string') {
      row.schedule = JSON.parse(row.schedule);
    }
    return row;
  }

  async findAll(filters?: { type?: string; gymId?: number }): Promise<ClassWithDetails[]> {
    let query = `
      SELECT c.id, c.gym_id as "gymId", c.instructor_id as "instructorId", c.name, c.type,
             c.schedule, c.capacity, c.price, c.description,
             c.created_at as "createdAt", c.updated_at as "updatedAt",
             g.name as "gymName",
             i.name as "instructorName", i.rating as "instructorRating",
             i.specialization as "instructorSpecialization"
      FROM classes c
      JOIN gyms g ON c.gym_id = g.id
      JOIN instructors i ON c.instructor_id = i.id
      WHERE 1=1
    `;
    
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.type) {
      query += ` AND c.type = $${paramCount++}`;
      values.push(filters.type);
    }

    if (filters?.gymId) {
      query += ` AND c.gym_id = $${paramCount++}`;
      values.push(filters.gymId);
    }

    query += ` ORDER BY c.name ASC`;

    const result = await this.pool.query(query, values);
    return result.rows.map(row => {
      // Schedule is already parsed by pg when using JSONB
      if (typeof row.schedule === 'string') {
        row.schedule = JSON.parse(row.schedule);
      }
      return row;
    });
  }

  async findByGymId(gymId: number): Promise<ClassWithDetails[]> {
    return this.findAll({ gymId });
  }

  async update(id: number, data: Partial<CreateClassDTO>): Promise<Class | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.gymId !== undefined) {
      fields.push(`gym_id = $${paramCount++}`);
      values.push(data.gymId);
    }
    if (data.instructorId !== undefined) {
      fields.push(`instructor_id = $${paramCount++}`);
      values.push(data.instructorId);
    }
    if (data.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.type !== undefined) {
      fields.push(`type = $${paramCount++}`);
      values.push(data.type);
    }
    if (data.schedule !== undefined) {
      fields.push(`schedule = $${paramCount++}`);
      values.push(JSON.stringify(data.schedule));
    }
    if (data.capacity !== undefined) {
      fields.push(`capacity = $${paramCount++}`);
      values.push(data.capacity);
    }
    if (data.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(data.price);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE classes
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, gym_id as "gymId", instructor_id as "instructorId", name, type, schedule,
                capacity, price, description, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await this.pool.query(query, values);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    // Schedule is already parsed by pg when using JSONB
    if (typeof row.schedule === 'string') {
      row.schedule = JSON.parse(row.schedule);
    }
    return row;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM classes WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }
}

export default new ClassModel();
