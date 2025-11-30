import { pgPool as pool } from '../config/database';
import crypto from 'crypto';

export interface EmployeeAccess {
  id: number;
  corporateAccountId: number;
  employeeEmail: string;
  employeeName: string;
  accessCode: string;
  sessionsUsed: number;
  status: 'active' | 'inactive' | 'revoked';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeAccessData {
  corporateAccountId: number;
  employeeEmail: string;
  employeeName: string;
}

class EmployeeAccessModel {
  static generateAccessCode(): string {
    // Generate a unique 12-character alphanumeric code
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  static async create(data: CreateEmployeeAccessData): Promise<EmployeeAccess> {
    const accessCode = this.generateAccessCode();
    
    const query = `
      INSERT INTO employee_access (
        corporate_account_id, employee_email, employee_name, access_code
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      data.corporateAccountId,
      data.employeeEmail,
      data.employeeName,
      accessCode
    ];
    
    const result = await pool.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  static async createBulk(employees: CreateEmployeeAccessData[]): Promise<EmployeeAccess[]> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const createdEmployees: EmployeeAccess[] = [];
      
      for (const employee of employees) {
        const accessCode = this.generateAccessCode();
        const query = `
          INSERT INTO employee_access (
            corporate_account_id, employee_email, employee_name, access_code
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (corporate_account_id, employee_email) 
          DO UPDATE SET 
            employee_name = EXCLUDED.employee_name,
            status = 'active'
          RETURNING *
        `;
        
        const result = await client.query(query, [
          employee.corporateAccountId,
          employee.employeeEmail,
          employee.employeeName,
          accessCode
        ]);
        
        createdEmployees.push(this.mapRow(result.rows[0]));
      }
      
      await client.query('COMMIT');
      return createdEmployees;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: number): Promise<EmployeeAccess | null> {
    const query = 'SELECT * FROM employee_access WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async findByAccessCode(accessCode: string): Promise<EmployeeAccess | null> {
    const query = 'SELECT * FROM employee_access WHERE access_code = $1';
    const result = await pool.query(query, [accessCode]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async findByCorporateAccount(corporateAccountId: number): Promise<EmployeeAccess[]> {
    const query = `
      SELECT * FROM employee_access 
      WHERE corporate_account_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [corporateAccountId]);
    return result.rows.map(row => this.mapRow(row));
  }

  static async findByEmail(corporateAccountId: number, email: string): Promise<EmployeeAccess | null> {
    const query = `
      SELECT * FROM employee_access 
      WHERE corporate_account_id = $1 AND employee_email = $2
    `;
    const result = await pool.query(query, [corporateAccountId, email]);
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  static async incrementSessionsUsed(id: number): Promise<void> {
    const query = `
      UPDATE employee_access 
      SET sessions_used = sessions_used + 1
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }

  static async updateStatus(
    id: number, 
    status: 'active' | 'inactive' | 'revoked'
  ): Promise<void> {
    const query = `
      UPDATE employee_access 
      SET status = $1
      WHERE id = $2
    `;
    await pool.query(query, [status, id]);
  }

  static async revokeAccess(id: number): Promise<void> {
    await this.updateStatus(id, 'revoked');
  }

  static async validateAccessCode(accessCode: string): Promise<{
    valid: boolean;
    employee?: EmployeeAccess;
    corporateAccount?: any;
    message?: string;
  }> {
    const employee = await this.findByAccessCode(accessCode);
    
    if (!employee) {
      return { valid: false, message: 'Invalid access code' };
    }

    if (employee.status !== 'active') {
      return { valid: false, message: 'Access code is not active' };
    }

    // Get corporate account details
    const accountQuery = 'SELECT * FROM corporate_accounts WHERE id = $1';
    const accountResult = await pool.query(accountQuery, [employee.corporateAccountId]);
    const corporateAccount = accountResult.rows[0];

    if (!corporateAccount) {
      return { valid: false, message: 'Corporate account not found' };
    }

    if (corporateAccount.status !== 'active') {
      return { valid: false, message: 'Corporate account is not active' };
    }

    if (new Date(corporateAccount.expiry_date) < new Date()) {
      return { valid: false, message: 'Corporate account has expired' };
    }

    if (corporateAccount.used_sessions >= corporateAccount.total_sessions) {
      return { valid: false, message: 'No sessions remaining in corporate account' };
    }

    return {
      valid: true,
      employee,
      corporateAccount: {
        id: corporateAccount.id,
        companyName: corporateAccount.company_name,
        remainingSessions: corporateAccount.total_sessions - corporateAccount.used_sessions
      }
    };
  }

  private static mapRow(row: any): EmployeeAccess {
    return {
      id: row.id,
      corporateAccountId: row.corporate_account_id,
      employeeEmail: row.employee_email,
      employeeName: row.employee_name,
      accessCode: row.access_code,
      sessionsUsed: row.sessions_used,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static query = pool.query.bind(pool);
}

export default EmployeeAccessModel;
