
import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBasket,
  getBasket,
  addItem,
  updateItem,
  removeItem,
  clearBasket,
  abandonBasket,
  checkout,
  getLowStockAlerts,
} from '../controllers/basketController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();


router.post(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'ADMIN'),
  [body('branchId').notEmpty().withMessage('Branch ID is required')],
  validate,
  createBasket
);


router.get('/', verifyToken, requireRole('CUSTOMER', 'ADMIN'), getBasket);


router.post(
  '/items',
  verifyToken,
  requireRole('CUSTOMER', 'ADMIN'),
  [
    body('menuItemId').notEmpty().withMessage('Menu item ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  addItem
);


router.put(
  '/items/:id',
  verifyToken,
  requireRole('CUSTOMER', 'ADMIN'),
  [body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or more')],
  validate,
  updateItem
);

router.delete('/items/:id', verifyToken, requireRole('CUSTOMER', 'ADMIN'), removeItem);

router.delete('/clear', verifyToken, requireRole('CUSTOMER', 'ADMIN'), clearBasket);


router.post(
  '/checkout',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER'),
  [
    // paymentMethod is optional — if not provided, payment is recorded later.
    body('paymentMethod')
      .optional()
      .isIn(['CASH', 'CARD', 'CONTACTLESS'])
      .withMessage('Payment method must be CASH, CARD, or CONTACTLESS'),
  ],
  validate,
  checkout
);


router.delete('/abandon', verifyToken, requireRole('CUSTOMER', 'ADMIN'), abandonBasket);


router.get(
  '/low-stock',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getLowStockAlerts
);

export default router;
