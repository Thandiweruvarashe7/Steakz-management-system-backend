// ──────────────────────────────────────────────────────────────────────────────
// routes/inventory.ts
//
// Routes for managing stock in the kitchen — ingredients, drinks, sides, etc.
// Branch managers can view and update their branch's inventory.
// Only ADMIN can delete inventory items (dangerous operation).
//
// All routes here are under /api/inventory (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../controllers/inventoryController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ── GET /api/inventory ────────────────────────────────────────────────────────
// Returns all inventory items for the user's branch.
// Branch managers automatically see only their branch.
// HQ and admins can pass ?branchId= to see a specific branch.
router.get(
  '/',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getInventory
);

// ── POST /api/inventory ───────────────────────────────────────────────────────
// Adds a new inventory item to a branch (e.g. "Ribeye Steak — 500 servings").
// Also creates the first stock-in transaction automatically.
router.post(
  '/',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'ADMIN'),
  [
    body('branchId').notEmpty().withMessage('Branch ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('minimumStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer'),
  ],
  validate,
  createInventoryItem
);

// ── PUT /api/inventory/:id ────────────────────────────────────────────────────
// Updates an inventory item — used to restock (IN), record usage (OUT),
// or manually adjust the quantity (ADJUSTMENT).
// Branch managers can only update items in their own branch.
router.put(
  '/:id',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'ADMIN'),
  updateInventoryItem
);

// ── PATCH /api/inventory/:id ──────────────────────────────────────────────────
// Same as PUT above — the frontend uses PATCH for partial updates.
// Both are handled by the same controller function (updateInventoryItem).
router.patch(
  '/:id',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'ADMIN'),
  updateInventoryItem
);

// ── DELETE /api/inventory/:id ─────────────────────────────────────────────────
// Permanently removes an inventory item and all its transaction history.
// Restricted to ADMIN only — this is a destructive operation.
router.delete(
  '/:id',
  verifyToken,
  requireRole('ADMIN'),
  deleteInventoryItem
);

export default router;
