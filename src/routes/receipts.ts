
import { Router } from 'express';
import {
  uploadReceipt,
  getReceipts,
  downloadReceipt,
  deleteReceipt,
} from '../controllers/receiptController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReceipts
);

router.post(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  uploadReceipt
);

router.get(
  '/:id/download',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  downloadReceipt
);


router.delete(
  '/:id',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  deleteReceipt
);

export default router;
