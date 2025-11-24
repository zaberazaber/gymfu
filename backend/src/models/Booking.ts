import { pgPool } from '../config/database';

export interface Booking {
  id: number;
  userId: number;
  gymId: number;
  sessionDate: Date;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'completed';
  qrCode: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateBookingData {
  userId: number;
  gymId: number;
  sessionDate: Date;
  price: number;
}

class BookingModel {
  async create(data: CreateBookingData): Promise<Booking> {
    const query = `
      INSERT INTO bookings (user_id, gym_id, session_date, price, status, created_at)
      VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
      RETURNING 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode", 
        created_at as "createdAt"
    `;

    const result = await pgPool.query(query, [
      data.userId,
      data.gymId,
      data.sessionDate,
      data.price,
    ]);

    return result.rows[0];
  }

  async findById(id: number): Promise<Booking | null> {
    const query = `
      SELECT 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode", 
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bookings
      WHERE id = $1
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: number, limit: number = 10, offset: number = 0): Promise<Booking[]> {
    const query = `
      SELECT 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode", 
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bookings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pgPool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  async updateStatus(id: number, status: Booking['status']): Promise<Booking | null> {
    const query = `
      UPDATE bookings
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode", 
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  async updateQrCode(id: number, qrCode: string): Promise<Booking | null> {
    const query = `
      UPDATE bookings
      SET qr_code = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode", 
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [qrCode, id]);
    return result.rows[0] || null;
  }
}

export default new BookingModel();
