

import { Router } from 'express';
import {
  getRevenueReport,
  getOrdersReport,
  getReservationsReport,
  getInventoryReport,
} from '../controllers/reportController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();


router.get(
  '/revenue',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getRevenueReport
);


router.get(
  '/orders',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getOrdersReport
);


router.get(
  '/reservations',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReservationsReport
);

router.get(
  '/inventory',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getInventoryReport
);

export default router;
