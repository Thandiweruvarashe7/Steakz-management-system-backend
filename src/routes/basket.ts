// ──────────────────────────────────────────────────────────────────────────────
// routes/basket.ts
//
// Routes for the customer shopping basket — the digital equivalent of a tray
// at a buffet where you collect items before paying.
//
// Flow:
//   1. Customer creates a basket (POST /)
//   2. Adds items to it (POST /items)
//   3. Can update quantities (PUT /items/:id) or remove items (DELETE /items/:id)
//   4. Checks out — converts the basket into a real order (POST /checkout)
//
// Also includes a route for managers to see low-stock alerts.
//
// All routes here are under /api/basket (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

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

// ── POST /api/basket ──────────────────────────────────────────────────────────
// Creates a new empty basket for the customer at a specific branch.
// You must tell it which branch you're ordering from (branchId).
router.post(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'ADMIN'),
  [body('branchId').notEmpty().withMessage('Branch ID is required')],
  validate,
  createBasket
);

// ── GET /api/basket ───────────────────────────────────────────────────────────
// Returns the customer's current active basket and its items.
router.get('/', verifyToken, requireRole('CUSTOMER', 'ADMIN'), getBasket);

// ── POST /api/basket/items ────────────────────────────────────────────────────
// Adds a menu item to the basket. You provide the item's ID and how many you want.
// Also checks that the item isn't out of stock before adding.
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

// ── PUT /api/basket/items/:id ─────────────────────────────────────────────────
// Changes the quantity of an item already in the basket.
// Setting quantity to 0 removes the item from the basket entirely.
router.put(
  '/items/:id',
  verifyToken,
  requireRole('CUSTOMER', 'ADMIN'),
  [body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or more')],
  validate,
  updateItem
);

// ── DELETE /api/basket/items/:id ──────────────────────────────────────────────
// Removes one specific item from the basket (by its basket item ID).
router.delete('/items/:id', verifyToken, requireRole('CUSTOMER', 'ADMIN'), removeItem);

// ── DELETE /api/basket/clear ──────────────────────────────────────────────────
// Removes ALL items from the basket at once (but keeps the basket itself open).
router.delete('/clear', verifyToken, requireRole('CUSTOMER', 'ADMIN'), clearBasket);

// ── POST /api/basket/checkout ─────────────────────────────────────────────────
// The most important basket route — converts the basket into a real order.
// Checks for out-of-stock items, creates the order in the database, applies
// 20% VAT to the total, and optionally records a payment method.
// WAITER_CASHIER can also use this to process a basket-based checkout for customers.
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

// ── DELETE /api/basket/abandon ────────────────────────────────────────────────
// Marks the basket as ABANDONED — used if the customer leaves without ordering.
// The basket is kept in the database for auditing but is no longer active.
router.delete('/abandon', verifyToken, requireRole('CUSTOMER', 'ADMIN'), abandonBasket);

// ── GET /api/basket/low-stock ─────────────────────────────────────────────────
// Returns a list of inventory items that are running low (below minimum stock level).
// Only managers and admins can see this — it's for internal use, not customers.
router.get(
  '/low-stock',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getLowStockAlerts
);

export default router;
