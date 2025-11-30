import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';
import AdminController from '../controllers/adminController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Gym Management
router.get('/gyms', AdminController.getGyms);
router.get('/gyms/pending', AdminController.getPendingGyms);
router.put('/gyms/:gymId/approve', AdminController.approveGym);
router.put('/gyms/:gymId/reject', AdminController.rejectGym);

// User Management
router.get('/users', AdminController.getUsers);
router.put('/users/:userId/role', AdminController.updateUserRole);

// Activity Logs
router.get('/activity-logs', AdminController.getActivityLogs);

export default router;
