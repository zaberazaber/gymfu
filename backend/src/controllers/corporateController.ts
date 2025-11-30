import { Request, Response } from 'express';
import CorporateAccount from '../models/CorporateAccount';
import EmployeeAccess from '../models/EmployeeAccess';

export class CorporateController {
  /**
   * Register a new corporate account
   * POST /api/v1/corporate/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyName,
        contactEmail,
        contactPhone,
        contactPerson,
        packageType,
        totalSessions,
        pricePerSession,
        durationMonths = 12
      } = req.body;

      // Validate required fields
      if (!companyName || !contactEmail || !contactPhone || !contactPerson || !packageType || !totalSessions) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
        return;
      }

      // Check if email already exists
      const existing = await CorporateAccount.findByEmail(contactEmail);
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Corporate account with this email already exists'
        });
        return;
      }

      // Calculate dates
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

      // Determine price per session based on package
      let calculatedPrice = pricePerSession;
      if (!calculatedPrice) {
        switch (packageType) {
          case 'basic':
            calculatedPrice = 150; // ₹150 per session
            break;
          case 'standard':
            calculatedPrice = 120; // ₹120 per session (20% discount)
            break;
          case 'premium':
            calculatedPrice = 100; // ₹100 per session (33% discount)
            break;
          default:
            calculatedPrice = 150;
        }
      }

      // Create corporate account
      const account = await CorporateAccount.create({
        companyName,
        contactEmail,
        contactPhone,
        contactPerson,
        packageType,
        totalSessions,
        pricePerSession: calculatedPrice,
        startDate,
        expiryDate
      });

      res.status(201).json({
        success: true,
        data: account,
        message: 'Corporate account created successfully'
      });
    } catch (error) {
      console.error('Error registering corporate account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register corporate account'
      });
    }
  }

  /**
   * Get corporate account details
   * GET /api/v1/corporate/:id
   */
  static async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const account = await CorporateAccount.findById(parseInt(id));
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Corporate account not found'
        });
        return;
      }

      const stats = await CorporateAccount.getStats(account.id);

      res.json({
        success: true,
        data: {
          ...account,
          stats
        }
      });
    } catch (error) {
      console.error('Error getting corporate account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get corporate account'
      });
    }
  }

  /**
   * Add employees to corporate account
   * POST /api/v1/corporate/:id/employees
   */
  static async addEmployees(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { employees } = req.body;

      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Employees array is required'
        });
        return;
      }

      // Verify corporate account exists
      const account = await CorporateAccount.findById(parseInt(id));
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Corporate account not found'
        });
        return;
      }

      // Create employee access records
      const employeeData = employees.map((emp: any) => ({
        corporateAccountId: parseInt(id),
        employeeEmail: emp.email,
        employeeName: emp.name
      }));

      const createdEmployees = await EmployeeAccess.createBulk(employeeData);

      res.status(201).json({
        success: true,
        data: createdEmployees,
        message: `${createdEmployees.length} employees added successfully`
      });
    } catch (error) {
      console.error('Error adding employees:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add employees'
      });
    }
  }

  /**
   * Get employees for corporate account
   * GET /api/v1/corporate/:id/employees
   */
  static async getEmployees(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const employees = await EmployeeAccess.findByCorporateAccount(parseInt(id));

      res.json({
        success: true,
        data: employees
      });
    } catch (error) {
      console.error('Error getting employees:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get employees'
      });
    }
  }

  /**
   * Revoke employee access
   * PUT /api/v1/corporate/employees/:employeeId/revoke
   */
  static async revokeEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;

      await EmployeeAccess.revokeAccess(parseInt(employeeId));

      res.json({
        success: true,
        message: 'Employee access revoked successfully'
      });
    } catch (error) {
      console.error('Error revoking employee access:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke employee access'
      });
    }
  }

  /**
   * Validate access code
   * POST /api/v1/corporate/validate-code
   */
  static async validateAccessCode(req: Request, res: Response): Promise<void> {
    try {
      const { accessCode } = req.body;

      if (!accessCode) {
        res.status(400).json({
          success: false,
          message: 'Access code is required'
        });
        return;
      }

      const validation = await EmployeeAccess.validateAccessCode(accessCode);

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.message
        });
        return;
      }

      res.json({
        success: true,
        data: {
          employee: validation.employee,
          corporateAccount: validation.corporateAccount
        },
        message: 'Access code is valid'
      });
    } catch (error) {
      console.error('Error validating access code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate access code'
      });
    }
  }

  /**
   * Get all corporate accounts (admin)
   * GET /api/v1/corporate
   */
  static async getAllAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      const accounts = await CorporateAccount.findAll({
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      console.error('Error getting corporate accounts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get corporate accounts'
      });
    }
  }
}

export default CorporateController;
