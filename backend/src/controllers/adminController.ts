import { Request, Response } from 'express';
import AdminModel from '../models/Admin';
import logger from '../config/logger';

class AdminController {
  // Get dashboard statistics
  async getDashboard(req: Request, res: Response) {
    try {
      const stats = await AdminModel.getDashboardStats();
      const recentActivity = await AdminModel.getRecentActivity(10);
      
      res.json({
        success: true,
        data: {
          stats,
          recentActivity
        }
      });
    } catch (error) {
      logger.error('Error fetching admin dashboard:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
  }
  
  // Get pending gyms for approval
  async getPendingGyms(req: Request, res: Response) {
    try {
      const pendingGyms = await AdminModel.getPendingGyms();
      
      res.json({
        success: true,
        data: pendingGyms
      });
    } catch (error) {
      logger.error('Error fetching pending gyms:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch pending gyms' });
    }
  }
  
  // Approve gym
  async approveGym(req: Request, res: Response) {
    try {
      const { gymId } = req.params;
      const adminId = req.user?.userId;
      
      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      await AdminModel.approveGym(parseInt(gymId), adminId);
      
      res.json({
        success: true,
        message: 'Gym approved successfully'
      });
    } catch (error) {
      logger.error('Error approving gym:', error);
      res.status(500).json({ success: false, error: 'Failed to approve gym' });
    }
  }
  
  // Reject gym
  async rejectGym(req: Request, res: Response) {
    try {
      const { gymId } = req.params;
      const { reason } = req.body;
      const adminId = req.user?.userId;
      
      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      await AdminModel.rejectGym(parseInt(gymId), adminId, reason || 'No reason provided');
      
      res.json({
        success: true,
        message: 'Gym rejected successfully'
      });
    } catch (error) {
      logger.error('Error rejecting gym:', error);
      res.status(500).json({ success: false, error: 'Failed to reject gym' });
    }
  }
  
  // Get all users
  async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      
      const result = await AdminModel.getUsers(
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      
      res.json({
        success: true,
        data: result.users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  }
  
  // Get all gyms
  async getGyms(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, verified } = req.query;
      
      const verifiedFilter = verified === 'true' ? true : verified === 'false' ? false : undefined;
      
      const result = await AdminModel.getGyms(
        parseInt(page as string),
        parseInt(limit as string),
        verifiedFilter
      );
      
      res.json({
        success: true,
        data: result.gyms,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger.error('Error fetching gyms:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch gyms' });
    }
  }
  
  // Update user role
  async updateUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role, isAdmin } = req.body;
      const adminId = req.user?.userId;
      
      if (!adminId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      
      await AdminModel.updateUserRole(parseInt(userId), role, isAdmin, adminId);
      
      res.json({
        success: true,
        message: 'User role updated successfully'
      });
    } catch (error) {
      logger.error('Error updating user role:', error);
      res.status(500).json({ success: false, error: 'Failed to update user role' });
    }
  }
  
  // Get activity logs
  async getActivityLogs(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      const result = await AdminModel.getActivityLogs(
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        data: result.logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      logger.error('Error fetching activity logs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
    }
  }
}

export default new AdminController();
