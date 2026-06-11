// ──────────────────────────────────────────────────────────────────────────────
// routes/payroll.ts
//
// Routes for managing employee salaries and payroll.
//
// Managers can view the payroll list for their branch.
// Only ADMIN and HQ_MANAGER can change an employee's salary or shift.
//
// All routes here are under /api/payroll (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { getPayroll, updateEmployeePayroll } from '../controllers/payrollController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// ── GET /api/payroll ──────────────────────────────────────────────────────────
// Returns the payroll list — all employees and their salary information.
// Supports ?branchId= to filter by branch, and ?format=csv to download as a spreadsheet.
// Branch managers see only their own branch's payroll.
router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getPayroll
);

// ── PATCH /api/payroll/:id ────────────────────────────────────────────────────
// Updates a single employee's salary, shift pattern, or employment status.
// Only ADMIN and HQ_MANAGER can change pay — branch managers can view but not edit.
router.patch(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  updateEmployeePayroll
);

export default router;
