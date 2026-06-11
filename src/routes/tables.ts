import { Router } from 'express';
import { body } from 'express-validator';
import { getTables, createTable, updateTable, resetTableAvailability, getTableAvailability } from '../controllers/tableController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public — no auth — used by reservation page to check available tables for a branch
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

// POST /api/tables/reset-availability
// Finds all tables with no active order/reservation and resets them to AVAILABLE
router.post(
  '/reset-availability',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  resetTableAvailability
);

export default router;
