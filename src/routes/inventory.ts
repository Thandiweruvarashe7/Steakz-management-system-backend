
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventoryController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get(
  '/',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getInventory
);

router.post(
  '/',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'ADMIN'),
  [
    body('branchId').notEmpty().withMessage('Branch ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('minimumStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  ],
  validate,
  createInventoryItem
);


router.put(
  '/:id',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'ADMIN'),
  updateInventoryItem
);


router.patch(
  '/:id',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'ADMIN'),
  updateInventoryItem
);


router.delete(
  '/:id',
  verifyToken,
  requireRole('ADMIN'),
  deleteInventoryItem
);

export default router;
