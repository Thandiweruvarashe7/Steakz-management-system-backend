// ──────────────────────────────────────────────────────────────────────────────
// routes/reports.ts
//
// Routes for downloading business reports.
// All four endpoints support ?format=csv to download as a spreadsheet,
// or ?format=json (default) to get the raw data.
// Optional filters: ?branchId= ?startDate= ?endDate=
//
// Only managers and admins can access reports — not frontline staff or customers.
//
// All routes here are under /api/reports (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import {
  getRevenueReport,
  getOrdersReport,
  getReservationsReport,
  getInventoryReport,
} from '../controllers/reportController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// ── GET /api/reports/revenue ──────────────────────────────────────────────────
// Returns a revenue report — total income, broken down by branch and date range.
// Can be exported as CSV for finance/accounting.
router.get(
  '/revenue',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getRevenueReport
);

// ── GET /api/reports/orders ───────────────────────────────────────────────────
// Returns an orders report — counts and totals of orders in a given period.
router.get(
  '/orders',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getOrdersReport
);

// ── GET /api/reports/reservations ────────────────────────────────────────────
// Returns a reservations report — how many bookings were made, confirmed, cancelled.
router.get(
  '/reservations',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReservationsReport
);

// ── GET /api/reports/inventory ────────────────────────────────────────────────
// Returns an inventory report — current stock levels, low stock alerts, usage trends.
router.get(
  '/inventory',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getInventoryReport
);

export default router;
