// ──────────────────────────────────────────────────────────────────────────────
// routes/payments.ts
//
// Routes for handling payments when a customer pays their bill.
//
// When a waiter processes a payment, it creates a Payment record in the
// database linked to the order, and marks the order as PAID.
//
// All routes here are under /api/payments (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { body } from 'express-validator';
import {
  processPayment,
  getPayments,
  getPaymentReports,
} from '../controllers/paymentController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ── POST /api/payments ────────────────────────────────────────────────────────
// Processes a payment for an order. The waiter selects the order and payment method.
// Only WAITER_CASHIER and ADMIN can take payments (not kitchen staff or managers).
router.post(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'ADMIN'),
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    // method must be one of the three accepted payment types
    body('method')
      .isIn(['CASH', 'CARD', 'CONTACTLESS'])
      .withMessage('Method must be CASH, CARD, or CONTACTLESS'),
  ],
  validate,
  processPayment
);

// ── GET /api/payments ─────────────────────────────────────────────────────────
// Returns a list of payments. Managers see their branch; admins see all.
// Used by the cashier and manager dashboards.
router.get(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getPayments
);

// ── GET /api/payments/reports ─────────────────────────────────────────────────
// Returns payment totals and summaries for reporting.
// Only managers and admins can access this — not frontline waiters.
router.get(
  '/reports',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getPaymentReports
);

export default router;
