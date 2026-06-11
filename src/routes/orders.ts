// ──────────────────────────────────────────────────────────────────────────────
// routes/orders.ts
//
// Routes for managing orders placed in the restaurant.
// There are two ways orders can be created:
//   1. A WAITER uses POST / to manually enter a table order with specific items
//   2. A CUSTOMER uses POST /customer to place an order themselves (self-service)
//
// All routes here are under /api/orders (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

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

// ── POST /api/orders/customer ─────────────────────────────────────────────────
// A customer places their own order (e.g. from their phone or table screen).
// Only CUSTOMER role can use this endpoint — it doesn't need a waiter.
router.post('/customer', verifyToken, requireRole('CUSTOMER'), createCustomerOrder);

// ── POST /api/orders ──────────────────────────────────────────────────────────
// A waiter manually creates an order for a table.
// Only WAITER_CASHIER can use this. ADMIN was removed — only customers and
// waiters are allowed to create orders.
// Validates that tableId and at least one item are provided.
router.post(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER'),
  [
    body('tableId').notEmpty().withMessage('Table ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
    // The * means "for every item in the array, check this field"
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  createOrder
);

// ── GET /api/orders ───────────────────────────────────────────────────────────
// Returns orders from the database.
// What you see depends on your role:
//   - CUSTOMER sees only their own orders
//   - WAITER/CHEF/BRANCH_MANAGER sees orders for their branch
//   - HQ_MANAGER/ADMIN sees all orders across all branches
router.get(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getOrders
);

// ── GET /api/orders/live ──────────────────────────────────────────────────────
// Returns only active orders (PENDING, PREPARING, READY, ON_TABLE).
// Used by the kitchen display screen — polled every few seconds.
// The rate limiter skips this endpoint because it's called so frequently.
router.get(
  '/live',
  verifyToken,
  requireRole('WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getLiveOrders
);

// ── GET /api/orders/awaiting-payment ─────────────────────────────────────────
// Returns orders that have been served but not yet paid (status: SERVED or ON_TABLE).
// Used by the cashier screen to know who to charge.
router.get(
  '/awaiting-payment',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'ADMIN', 'HQ_MANAGER'),
  getAwaitingPaymentOrders
);

// ── PATCH /api/orders/:id/status ──────────────────────────────────────────────
// Updates the status of an order (e.g. PENDING → PREPARING → READY → SERVED).
// Kitchen staff, waiters, and managers can all change order status.
// Changing to COMPLETED triggers automatic inventory deduction.
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('WAITER_CASHIER', 'CHEF', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  updateOrderStatus
);

export default router;
