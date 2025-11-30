import express from 'express';
import CorporateController from '../controllers/corporateController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/validate-code', CorporateController.validateAccessCode);

// Protected routes (require authentication)
router.post('/register', authenticate, CorporateController.register);
router.get('/:id', authenticate, CorporateController.getAccount);
router.post('/:id/employees', authenticate, CorporateController.addEmployees);
router.get('/:id/employees', authenticate, CorporateController.getEmployees);
router.put('/employees/:employeeId/revoke', authenticate, CorporateController.revokeEmployee);
router.get('/', authenticate, CorporateController.getAllAccounts);

export default router;
