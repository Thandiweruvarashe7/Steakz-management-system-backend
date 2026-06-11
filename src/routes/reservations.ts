// ──────────────────────────────────────────────────────────────────────────────
// routes/reservations.ts
//
// Routes for table reservations — customers booking a table in advance.
//
// Customers can make, view, and cancel their own reservations.
// Staff and managers can view and update reservations for their branch.
//
// All routes here are under /api/reservations (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} from '../controllers/reservationController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ── POST /api/reservations ────────────────────────────────────────────────────
// Creates a new table reservation. Only customers and admins can book.
// tableId is optional — if not provided, the server automatically picks
// the first available table that fits the party size.
router.post(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'ADMIN'),
  [
    body('branchId').notEmpty().withMessage('Branch ID is required'),
    // tableId is optional — if omitted the server auto-assigns the first available table
    body('tableId').optional().isString(),
    body('reservationDate').isISO8601().withMessage('Valid date is required'), // ISO8601 = standard date format e.g. "2025-12-25T19:00:00"
    body('partySize').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
  ],
  validate,
  createReservation
);

// ── GET /api/reservations ─────────────────────────────────────────────────────
// Returns reservations. What you see depends on your role:
//   - CUSTOMER sees only their own reservations
//   - WAITER/BRANCH_MANAGER sees reservations for their branch
//   - HQ_MANAGER/ADMIN sees all reservations
router.get(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReservations
);

// ── GET /api/reservations/:id ─────────────────────────────────────────────────
// Returns the details of one specific reservation (by its ID).
router.get(
  '/:id',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReservationById
);

// ── PUT /api/reservations/:id ─────────────────────────────────────────────────
// Updates a reservation (e.g. change date, party size, or status).
// The same updateReservation function handles both PUT and PATCH.
router.put(
  '/:id',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  updateReservation
);

// ── PATCH /api/reservations/:id ───────────────────────────────────────────────
// Same as PUT above but uses PATCH (partial update).
// The frontend uses PATCH for status changes like CONFIRMED or CANCELLED.
// Both PUT and PATCH are kept so neither the old nor new frontend code breaks.
router.patch(
  '/:id',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  updateReservation
);

// ── DELETE /api/reservations/:id ──────────────────────────────────────────────
// Cancels/deletes a reservation. Customers can cancel their own bookings.
// Managers and admins can cancel any reservation.
router.delete('/:id', verifyToken, requireRole('CUSTOMER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'), deleteReservation);

export default router;
