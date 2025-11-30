import { pgPool } from '../config/database';

export interface AdminDashboardStats {
  totalUsers: number;
  totalGyms: number;
  totalBookings: number;
  totalRevenue: number;
  pendingGyms: number;
  activeUsers: number;
  todayBookings: number;
  todayRevenue: number;
}

export interface PendingGym {
  id: number;
  name: string;
  ownerName: string;
  ownerEmail: string;
  address: string;
  city: string;
  basePrice: number;
  createdAt: Date;
}

export interface AdminActivityLog {
  id: number;
  adminId: number;
  action: string;
  entityType: string;
  entityId?: number;
  details: any;
  ipAddress?: string;
  createdAt: Date;
}

export interface UserListItem {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  role: string;
  isPartner: boolean;
  createdAt: Date;
  totalBookings: number;
}

export interface GymListItem {
  id: number;
  name: string;
  ownerName: string;
  address: string;
  city: string;
  isVerified: boolean;
  basePrice: number;
  rating: number;
  totalBookings: number;
  createdAt: Date;
}

class AdminModel {
  // Get dashboard statistics
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const client = await pgPool.connect();
    
    try {
      // Total users
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      const totalUsers = parseInt(usersResult.rows[0].count);
      
      // Total gyms
      const gymsResult = await client.query('SELECT COUNT(*) as count FROM gyms');
      const totalGyms = parseInt(gymsResult.rows[0].count);
      
      // Total bookings
      const bookingsResult = await client.query('SELECT COUNT(*) as count FROM bookings');
      const totalBookings = parseInt(bookingsResult.rows[0].count);
      
      // Total revenue
      const revenueResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'`
      );
      const totalRevenue = parseFloat(revenueResult.rows[0].total);
      
      // Pending gyms (not verified)
      const pendingGymsResult = await client.query(
        `SELECT COUNT(*) as count FROM gyms WHERE is_verified = false`
      );
      const pendingGyms = parseInt(pendingGymsResult.rows[0].count);
      
      // Active users (users who booked in last 30 days)
      const activeUsersResult = await client.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM bookings 
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);
      const activeUsers = parseInt(activeUsersResult.rows[0].count);
      
      // Today's bookings
      const todayBookingsResult = await client.query(`
        SELECT COUNT(*) as count FROM bookings 
        WHERE DATE(created_at) = CURRENT_DATE
      `);
      const todayBookings = parseInt(todayBookingsResult.rows[0].count);
      
      // Today's revenue
      const todayRevenueResult = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total FROM payments 
        WHERE status = 'success' AND DATE(created_at) = CURRENT_DATE
      `);
      const todayRevenue = parseFloat(todayRevenueResult.rows[0].total);
      
      return {
        totalUsers,
        totalGyms,
        totalBookings,
        totalRevenue,
        pendingGyms,
        activeUsers,
        todayBookings,
        todayRevenue
      };
    } finally {
      client.release();
    }
  }
  
  // Get pending gyms for approval
  async getPendingGyms(): Promise<PendingGym[]> {
    const query = `
      SELECT 
        g.id, g.name, g.address, g.city, g.base_price as "basePrice", g.created_at as "createdAt",
        u.name as "ownerName", u.email as "ownerEmail"
      FROM gyms g
      LEFT JOIN users u ON g.owner_id = u.id
      WHERE g.is_verified = false
      ORDER BY g.created_at DESC
    `;
    
    const result = await pgPool.query(query);
    return result.rows;
  }
  
  // Approve gym
  async approveGym(gymId: number, adminId: number): Promise<boolean> {
    const client = await pgPool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update gym verification status
      const updateResult = await client.query(
        `UPDATE gyms SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING id`,
        [gymId]
      );
      
      if (updateResult.rowCount === 0) {
        throw new Error('Gym not found');
      }
      
      // Log admin activity
      await client.query(`
        INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details)
        VALUES ($1, 'approve_gym', 'gym', $2, '{"action": "approved"}')
      `, [adminId, gymId]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Reject gym
  async rejectGym(gymId: number, adminId: number, reason: string): Promise<boolean> {
    const client = await pgPool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete gym (or mark as rejected)
      const deleteResult = await client.query(
        `DELETE FROM gyms WHERE id = $1 AND is_verified = false RETURNING id`,
        [gymId]
      );
      
      if (deleteResult.rowCount === 0) {
        throw new Error('Gym not found or already verified');
      }
      
      // Log admin activity
      await client.query(`
        INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details)
        VALUES ($1, 'reject_gym', 'gym', $2, $3)
      `, [adminId, gymId, JSON.stringify({ action: 'rejected', reason })]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Get all users with pagination
  async getUsers(page: number = 1, limit: number = 20, search?: string): Promise<{ users: UserListItem[], total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params: any[] = [];
    
    if (search) {
      whereClause = `WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR u.phone_number ILIKE $1`;
      params.push(`%${search}%`);
    }
    
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const countResult = await pgPool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    const query = `
      SELECT 
        u.id, u.name, u.email, u.phone_number as "phoneNumber",
        COALESCE(u.is_admin, false) as "isAdmin", 
        COALESCE(u.role, 'user') as role,
        COALESCE(u.is_partner, false) as "isPartner",
        u.created_at as "createdAt",
        COUNT(b.id) as "totalBookings"
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const result = await pgPool.query(query, params);
    
    return { users: result.rows, total };
  }
  
  // Get all gyms with pagination
  async getGyms(page: number = 1, limit: number = 20, verified?: boolean): Promise<{ gyms: GymListItem[], total: number }> {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params: any[] = [];
    
    if (verified !== undefined) {
      whereClause = `WHERE g.is_verified = $1`;
      params.push(verified);
    }
    
    const countQuery = `SELECT COUNT(*) as total FROM gyms g ${whereClause}`;
    const countResult = await pgPool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    const query = `
      SELECT 
        g.id, g.name, g.address, g.city, 
        COALESCE(g.is_verified, false) as "isVerified",
        g.base_price as "basePrice", 
        COALESCE(g.rating, 0) as rating,
        g.created_at as "createdAt",
        u.name as "ownerName",
        COUNT(b.id) as "totalBookings"
      FROM gyms g
      LEFT JOIN users u ON g.owner_id = u.id
      LEFT JOIN bookings b ON b.gym_id = g.id
      ${whereClause}
      GROUP BY g.id, u.name
      ORDER BY g.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const result = await pgPool.query(query, params);
    
    return { gyms: result.rows, total };
  }
  
  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    const query = `
      (SELECT 'new_user' as type, u.name as title, u.created_at as "createdAt"
       FROM users u ORDER BY u.created_at DESC LIMIT $1)
      UNION ALL
      (SELECT 'new_booking' as type, CONCAT('Booking at ', g.name) as title, b.created_at as "createdAt"
       FROM bookings b JOIN gyms g ON b.gym_id = g.id ORDER BY b.created_at DESC LIMIT $1)
      UNION ALL
      (SELECT 'new_gym' as type, g.name as title, g.created_at as "createdAt"
       FROM gyms g ORDER BY g.created_at DESC LIMIT $1)
      ORDER BY "createdAt" DESC
      LIMIT $1
    `;
    
    const result = await pgPool.query(query, [limit]);
    return result.rows;
  }
  
  // Log admin activity
  async logActivity(adminId: number, action: string, entityType: string, entityId?: number, details?: any, ipAddress?: string): Promise<void> {
    await pgPool.query(`
      INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [adminId, action, entityType, entityId || null, JSON.stringify(details || {}), ipAddress || null]);
  }
  
  // Get admin activity logs
  async getActivityLogs(page: number = 1, limit: number = 50): Promise<{ logs: AdminActivityLog[], total: number }> {
    const offset = (page - 1) * limit;
    
    const countResult = await pgPool.query('SELECT COUNT(*) as total FROM admin_activity_logs');
    const total = parseInt(countResult.rows[0].total);
    
    const query = `
      SELECT 
        l.id, l.admin_id as "adminId", l.action, l.entity_type as "entityType",
        l.entity_id as "entityId", l.details, l.ip_address as "ipAddress",
        l.created_at as "createdAt", u.name as "adminName"
      FROM admin_activity_logs l
      JOIN users u ON l.admin_id = u.id
      ORDER BY l.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pgPool.query(query, [limit, offset]);
    return { logs: result.rows, total };
  }
  
  // Check if user is admin
  async isAdmin(userId: number): Promise<boolean> {
    const result = await pgPool.query(
      `SELECT is_admin FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0]?.is_admin === true;
  }
  
  // Update user role
  async updateUserRole(userId: number, role: string, isAdmin: boolean, adminId: number): Promise<boolean> {
    const client = await pgPool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(
        `UPDATE users SET role = $1, is_admin = $2, updated_at = NOW() WHERE id = $3`,
        [role, isAdmin, userId]
      );
      
      await client.query(`
        INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details)
        VALUES ($1, 'update_user_role', 'user', $2, $3)
      `, [adminId, userId, JSON.stringify({ role, isAdmin })]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new AdminModel();
