// ──────────────────────────────────────────────────────────────────────────────
// routes/analytics.ts
//
// Routes for the various dashboards and data charts in the management system.
// These endpoints return numbers and statistics — revenue, orders, live activity.
//
// There are different dashboards for different roles:
//   - Branch managers see their own branch dashboard (today's data)
//   - HQ managers see all branches combined (or filter to one branch)
//   - All managers can see charts like revenue over time and sales by category
//
// All routes here are under /api/analytics (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import {
  getAnalytics,
  getBranchDashboard,
  getHQDashboard,
  getLiveDashboard,
  getRevenueSeries,
  getSales,
  getStats,
  getReceiptByOrderId,
} from '../controllers/analyticsController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// ── GET /api/analytics ────────────────────────────────────────────────────────
// Returns detailed analytics: most ordered meals, revenue per branch, basket stats.
// Used by the advanced analytics pages for managers and HQ.
router.get(
  '/',
  verifyToken,
  requireRole('HQ_MANAGER', 'BRANCH_MANAGER', 'ADMIN'),
  getAnalytics
);

// ── GET /api/analytics/branch-dashboard ───────────────────────────────────────
// Returns a real-time snapshot of a single branch for today:
//   active orders, today's reservations, revenue today, tables occupied, staff on shift.
// Branch managers automatically see their own branch; HQ/Admin can pass ?branchId=.
router.get(
  '/branch-dashboard',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getBranchDashboard
);

// ── GET /api/analytics/hq-dashboard ──────────────────────────────────────────
// Returns the all-branches overview: total revenue, orders, reservations, staff.
// Also returns per-branch stats in a "branches" array and "allBranches" array.
// Supports ?branchId= to filter top-level stats to a single branch.
// Only HQ_MANAGER and ADMIN can see this (branch managers don't need network-wide data).
router.get(
  '/hq-dashboard',
  verifyToken,
  requireRole('HQ_MANAGER', 'ADMIN'),
  getHQDashboard
);

// ── GET /api/analytics/stats ──────────────────────────────────────────────────
// Returns high-level totals: total revenue, active orders, upcoming reservations, etc.
// Used by the admin dashboard cards at the top of the page.
router.get(
  '/stats',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getStats
);

// ── GET /api/analytics/sales ──────────────────────────────────────────────────
// Returns sales broken down by menu category (e.g. Steaks: £5,200, Sides: £1,100).
// Supports date range filters: ?startDate=&endDate=&branchId=
router.get(
  '/sales',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getSales
);

// ── GET /api/analytics/revenue ────────────────────────────────────────────────
// Returns a day-by-day revenue time series for line/bar charts.
// Supports ?days=30 (default) up to 90 days, and optional ?branchId=.
// Branch managers automatically see their own branch's data.
router.get(
  '/revenue',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getRevenueSeries
);

// ── GET /api/analytics/live ───────────────────────────────────────────────────
// Returns currently active orders (PENDING, PREPARING, READY) for live monitoring.
// Safe to poll every 10 seconds — it's excluded from the rate limiter.
// Used by the kitchen display and manager live board.
router.get(
  '/live',
  verifyToken,
  requireRole('WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getLiveDashboard
);

// ── GET /api/analytics/receipt/:orderId ───────────────────────────────────────
// Returns receipt data for a specific order — branch info, items, totals, payment.
// Customers can only see receipts for their own orders.
// Staff can see receipts for orders in their branch.
router.get(
  '/receipt/:orderId',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReceiptByOrderId
);

// This log message fires once when the server starts, confirming these routes loaded.
console.log('[Analytics] Routes registered: GET /analytics/hq-dashboard, /branch-dashboard, /stats, /sales, /revenue, /live');

export default router;
