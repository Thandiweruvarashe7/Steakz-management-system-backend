// ──────────────────────────────────────────────────────────────────────────────
// routes/branches.ts
//
// Routes for managing restaurant branches (London, Manchester, etc.).
// Reading branch info is public — anyone can see where the restaurants are.
// Creating, editing, and deleting branches is restricted to ADMIN only.
//
// All routes here are under /api/branches (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ── GET /api/branches ─────────────────────────────────────────────────────────
// Returns a list of all Steakz branches.
// PUBLIC — no login required (used by the booking page and branch selector).
router.get('/', getAllBranches);

// ── GET /api/branches/:id ─────────────────────────────────────────────────────
// Returns the details of one specific branch (by its ID).
// PUBLIC — no login required.
router.get('/:id', getBranchById);

// ── POST /api/branches ────────────────────────────────────────────────────────
// Creates a new branch. Only ADMIN can do this.
// Validates that all required fields are present before saving.
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Branch name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  validate,    // stop here if any field is missing or invalid
  createBranch
);

// ── PUT /api/branches/:id ─────────────────────────────────────────────────────
// Updates an existing branch's details. Only ADMIN can do this.
router.put('/:id', verifyToken, requireRole('ADMIN'), updateBranch);

// ── DELETE /api/branches/:id ──────────────────────────────────────────────────
// Permanently deletes a branch. Only ADMIN can do this.
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteBranch);

export default router;
