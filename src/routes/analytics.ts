
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

router.get(
  '/branch-dashboard',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getBranchDashboard
);


router.get(
  '/hq-dashboard',
  verifyToken,
  requireRole('HQ_MANAGER', 'ADMIN'),
  getHQDashboard
);


router.get(
  '/stats',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getStats
);

router.get(
  '/sales',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getSales
);


router.get(
  '/revenue',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getRevenueSeries
);

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
