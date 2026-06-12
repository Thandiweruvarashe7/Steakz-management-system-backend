
import { Router } from 'express';
import { body } from 'express-validator';
import { getTables, createTable, updateTable, resetTableAvailability, getTableAvailability } from '../controllers/tableController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/availability', getTableAvailability);


router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER', 'CUSTOMER'),
  getTables
);

router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'BRANCH_MANAGER'),
  [
    body('branchId').notEmpty().withMessage('Branch ID is required'),
    body('tableNumber').isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  ],
  validate,
  createTable
);

router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER'),
  updateTable
);

router.post(
  '/reset-availability',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  resetTableAvailability
);

export default router;
