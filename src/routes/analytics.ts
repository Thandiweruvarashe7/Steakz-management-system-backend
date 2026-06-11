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

router.get(
  '/',
  verifyToken,
  requireRole('HQ_MANAGER', 'BRANCH_MANAGER', 'ADMIN'),
  getAnalytics
);

// Branch manager real-time dashboard
router.get(
  '/branch-dashboard',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getBranchDashboard
);

// HQ all-branches overview with salary totals
router.get(
  '/hq-dashboard',
  verifyToken,
  requireRole('HQ_MANAGER', 'ADMIN'),
  getHQDashboard
);

// Aggregated stats for admin/manager dashboards — total revenue, active orders, etc.
router.get(
  '/stats',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getStats
);

// Sales by category with date range — ?startDate=&endDate=&branchId=
router.get(
  '/sales',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getSales
);

// Revenue time-series for charts — ?days=30&branchId=...
router.get(
  '/revenue',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getRevenueSeries
);

// Live polling endpoint — safe for 10-second refresh
router.get(
  '/live',
  verifyToken,
  requireRole('WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getLiveDashboard
);

router.get(
  '/receipt/:orderId',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReceiptByOrderId
);

console.log('[Analytics] Routes registered: GET /analytics/hq-dashboard, /branch-dashboard, /stats, /sales, /revenue, /live');

export default router;
