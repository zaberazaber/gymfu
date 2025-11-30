import { pgPool } from '../config/database';

export interface Booking {
  id: number;
  userId: number;
  gymId: number;
  sessionDate: Date;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'completed';
  qrCode: string | null;
  qrCodeExpiry: Date | null;
  checkInTime: Date | null;
  sessionType: 'gym' | 'class';
  classId?: number | null;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateBookingData {
  userId: number;
  gymId: number;
  sessionDate: Date;
  price: number;
  sessionType?: 'gym' | 'class';
  classId?: number;
}

class BookingModel {
  async create(data: CreateBookingData): Promise<Booking> {
    const query = `
      INSERT INTO bookings (user_id, gym_id, session_date, price, status, session_type, class_id, created_at)
      VALUES ($1, $2, $3, $4, 'pending', $5, $6, CURRENT_TIMESTAMP)
      RETURNING 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode",
        qr_code_expiry as "qrCodeExpiry",
        check_in_time as "checkInTime",
        session_type as "sessionType",
        class_id as "classId",
        created_at as "createdAt"
    `;

    const result = await pgPool.query(query, [
      data.userId,
      data.gymId,
      data.sessionDate,
      data.price,
      data.sessionType || 'gym',
      data.classId || null,
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
        qr_code_expiry as "qrCodeExpiry",
        check_in_time as "checkInTime",
        session_type as "sessionType",
        class_id as "classId",
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
        qr_code_expiry as "qrCodeExpiry",
        check_in_time as "checkInTime",
        session_type as "sessionType",
        class_id as "classId",
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
        qr_code_expiry as "qrCodeExpiry",
        check_in_time as "checkInTime",
        session_type as "sessionType",
        class_id as "classId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  async updateQrCode(id: number, qrCode: string, qrCodeExpiry: Date): Promise<Booking | null> {
    const query = `
      UPDATE bookings
      SET qr_code = $1, qr_code_expiry = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode",
        qr_code_expiry as "qrCodeExpiry",
        check_in_time as "checkInTime",
        session_type as "sessionType",
        class_id as "classId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [qrCode, qrCodeExpiry, id]);
    return result.rows[0] || null;
  }

  async checkIn(id: number): Promise<Booking | null> {
    const query = `
      UPDATE bookings
      SET status = 'checked_in', check_in_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id, 
        user_id as "userId", 
        gym_id as "gymId", 
        session_date as "sessionDate", 
        price, 
        status, 
        qr_code as "qrCode",
        qr_code_expiry as "qrCodeExpiry",
        check_in_time as "checkInTime",
        session_type as "sessionType",
        class_id as "classId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await pgPool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByUserIdWithGymDetails(userId: number, limit: number = 10, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT 
        b.id, 
        b.user_id as "userId", 
        b.gym_id as "gymId", 
        b.session_date as "sessionDate", 
        b.price, 
        b.status, 
        b.qr_code as "qrCode",
        b.qr_code_expiry as "qrCodeExpiry",
        b.check_in_time as "checkInTime",
        b.session_type as "sessionType",
        b.class_id as "classId",
        b.created_at as "createdAt",
        b.updated_at as "updatedAt",
        g.name as "gymName",
        g.address as "gymAddress",
        g.city as "gymCity",
        g.pincode as "gymPincode",
        g.latitude as "gymLatitude",
        g.longitude as "gymLongitude",
        g.amenities as "gymAmenities",
        g.images as "gymImages",
        g.rating as "gymRating",
        g.is_verified as "gymIsVerified",
        c.name as "className",
        c.type as "classType",
        i.name as "instructorName"
      FROM bookings b
      INNER JOIN gyms g ON b.gym_id = g.id
      LEFT JOIN classes c ON b.class_id = c.id
      LEFT JOIN instructors i ON c.instructor_id = i.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pgPool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  async countByUserId(userId: number): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM bookings WHERE user_id = $1';
    const result = await pgPool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}

export default new BookingModel();
