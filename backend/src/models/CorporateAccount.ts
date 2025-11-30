import { pgPool as pool } from '../config/database';

export interface CorporateAccount {
  id: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  packageType: 'basic' | 'standard' | 'premium';
  totalSessions: number;
  usedSessions: number;
  pricePerSession: number;
  totalAmount: number;
  status: 'active' | 'expired' | 'suspended';
  startDate: Date;
  expiryDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCorporateAccountData {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  packageType: 'basic' | 'standard' | 'premium';
  totalSessions: number;
  pricePerSession: number;
  startDate: Date;
  expiryDate: Date;
}

class CorporateAccountModel {
  static async create(data: CreateCorporateAccountData): Promise<CorporateAccount> {
    const totalAmount = data.totalSessions * data.pricePerSession;
    
    const query = `
      INSERT INTO corporate_accounts (
        company_name, contact_email, contact_phone, contact_person,
        package_type, total_sessions, price_per_session, total_amount,
        start_date, expiry_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      data.companyName,
      data.contactEmail,
      data.contactPhone,
      data.contactPerson,
      data.packageType,
      data.totalSessions,
      data.pricePerSession,
      totalAmount,
      data.startDate,
      data.expiryDate
    ];
    
    const result = await pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  static async findById(id: number): Promise<CorporateAccount | null> {
    const query = 'SELECT * FROM corporate_accounts WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async findByEmail(email: string): Promise<CorporateAccount | null> {
    const query = 'SELECT * FROM corporate_accounts WHERE contact_email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async findAll(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<CorporateAccount[]> {
    let query = 'SELECT * FROM corporate_accounts';
    const values: any[] = [];
    const conditions: string[] = [];

    if (filters?.status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(filters.limit);
    }

    if (filters?.offset) {
      query += ` OFFSET $${values.length + 1}`;
      values.push(filters.offset);
    }

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRow(row));
  }

  static async incrementUsedSessions(id: number): Promise<void> {
    const query = `
      UPDATE corporate_accounts 
      SET used_sessions = used_sessions + 1
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }

  static async updateStatus(id: number, status: 'active' | 'expired' | 'suspended'): Promise<void> {
    const query = `
      UPDATE corporate_accounts 
      SET status = $1
      WHERE id = $2
    `;
    await pool.query(query, [status, id]);
  }

  static async getStats(id: number): Promise<{
    totalSessions: number;
    usedSessions: number;
    remainingSessions: number;
    utilizationRate: number;
  }> {
    const account = await this.findById(id);
    if (!account) {
      throw new Error('Corporate account not found');
    }

    const remainingSessions = account.totalSessions - account.usedSessions;
    const utilizationRate = (account.usedSessions / account.totalSessions) * 100;

    return {
      totalSessions: account.totalSessions,
      usedSessions: account.usedSessions,
      remainingSessions,
      utilizationRate: Math.round(utilizationRate * 100) / 100
    };
  }

  static async checkExpiredAccounts(): Promise<void> {
    const query = `
      UPDATE corporate_accounts 
      SET status = 'expired'
      WHERE expiry_date < CURRENT_DATE AND status = 'active'
    `;
    await pool.query(query);
  }

  private static mapRow(row: any): CorporateAccount {
    return {
      id: row.id,
      companyName: row.company_name,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      contactPerson: row.contact_person,
      packageType: row.package_type,
      totalSessions: row.total_sessions,
      usedSessions: row.used_sessions,
      pricePerSession: parseFloat(row.price_per_session),
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      startDate: row.start_date,
      expiryDate: row.expiry_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static query = pool.query.bind(pool);
}

export default CorporateAccountModel;
