// ──────────────────────────────────────────────────────────────────────────────
// routes/tables.ts
//
// Routes for managing physical tables inside each branch.
// Tables have statuses: AVAILABLE, OCCUPIED, RESERVED, PAYMENT_PENDING, MAINTENANCE.
//
// Customers can check which tables are available before booking.
// Managers can create new tables and reset their statuses.
//
// All routes here are under /api/tables (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { body } from 'express-validator';
import { getTables, createTable, updateTable, resetTableAvailability, getTableAvailability } from '../controllers/tableController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ── GET /api/tables/availability ─────────────────────────────────────────────
// Returns available tables for a branch — used on the reservation/booking page.
// PUBLIC — no login required so customers can check availability before signing up.
// Accepts ?branchId= and ?date= query params to filter results.
router.get('/availability', getTableAvailability);

// ── GET /api/tables ───────────────────────────────────────────────────────────
// Returns all tables. Branch staff see only their branch's tables.
// Accepts optional ?branchId= query param for admins to filter by branch.
router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER', 'CUSTOMER'),
  getTables
);

// ── POST /api/tables ──────────────────────────────────────────────────────────
// Adds a new physical table to a branch (e.g. "Table 12, seats 4").
// Only managers and admins can add tables — they manage the physical layout.
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

// ── PUT /api/tables/:id ───────────────────────────────────────────────────────
// Updates a table's status or details. Waiters can change status (e.g. OCCUPIED).
// Managers and admins can change any property.
router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER'),
  updateTable
);

// ── POST /api/tables/reset-availability ───────────────────────────────────────
// Scans all tables and resets any that have no active order or reservation
// back to AVAILABLE. Useful at the start of a shift to fix any stuck statuses.
// Only managers and admins can trigger this — it's a bulk operation.
router.post(
  '/reset-availability',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  resetTableAvailability
);

export default router;
