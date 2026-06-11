import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  createCustomerOrder,
  getOrders,
  getLiveOrders,
  updateOrderStatus,
  getAwaitingPaymentOrders,
} from '../controllers/orderController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Customer self-service order (no waiter/table required)
router.post('/customer', verifyToken, requireRole('CUSTOMER'), createCustomerOrder);

router.post(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER'),
  [
    body('tableId').notEmpty().withMessage('Table ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  createOrder
);

router.get(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getOrders
);

router.get(
  '/live',
  verifyToken,
  requireRole('WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getLiveOrders
);

router.get(
  '/awaiting-payment',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'ADMIN', 'HQ_MANAGER'),
  getAwaitingPaymentOrders
);

router.patch(
  '/:id/status',
  verifyToken,
  requireRole('WAITER_CASHIER', 'CHEF', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  updateOrderStatus
);

export default router;
