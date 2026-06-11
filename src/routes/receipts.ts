import { Router } from 'express';
import {
  uploadReceipt,
  getReceipts,
  downloadReceipt,
  deleteReceipt,
} from '../controllers/receiptController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// GET  /api/receipts              — list receipt metadata for accessible branches
// GET  /api/receipts?orderId=xxx  — receipts for a specific order
router.get(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReceipts
);

// POST /api/receipts              — upload a receipt (base64 in JSON body)
router.post(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  uploadReceipt
);

// GET /api/receipts/:id/download  — stream file back to client
router.get(
  '/:id/download',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  downloadReceipt
);

// DELETE /api/receipts/:id
router.delete(
  '/:id',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  deleteReceipt
);

export default router;
