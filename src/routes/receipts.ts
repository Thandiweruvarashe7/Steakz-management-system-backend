// ──────────────────────────────────────────────────────────────────────────────
// routes/receipts.ts
//
// Routes for uploading and downloading physical receipt files (e.g. PDF scans
// or images of supplier invoices attached to orders).
//
// Receipts are stored in the database as base64-encoded file data.
// Customers don't have access — this is for internal staff use.
//
// All routes here are under /api/receipts (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import {
  uploadReceipt,
  getReceipts,
  downloadReceipt,
  deleteReceipt,
} from '../controllers/receiptController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// ── GET /api/receipts ─────────────────────────────────────────────────────────
// Returns a list of receipt records (metadata only, not the file content).
// Accepts optional ?orderId= to find receipts attached to a specific order.
// Branch staff see only receipts for their branch.
router.get(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReceipts
);

// ── POST /api/receipts ────────────────────────────────────────────────────────
// Uploads a receipt file. The file should be sent as a base64 string in the JSON body.
// The server stores it in the database along with the order ID and branch ID.
router.post(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  uploadReceipt
);

// ── GET /api/receipts/:id/download ────────────────────────────────────────────
// Streams the actual file content back to the caller so they can open/save it.
// Think of it like clicking "Download" on a file link.
router.get(
  '/:id/download',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  downloadReceipt
);

// ── DELETE /api/receipts/:id ──────────────────────────────────────────────────
// Permanently deletes a receipt file from the database.
// Waiters cannot delete — only managers and admins can remove records.
router.delete(
  '/:id',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  deleteReceipt
);

export default router;
