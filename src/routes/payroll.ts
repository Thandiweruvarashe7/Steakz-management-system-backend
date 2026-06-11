import { Router } from 'express';
import { getPayroll, updateEmployeePayroll } from '../controllers/payrollController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/payroll               — full payroll list (supports ?branchId= and ?format=csv)
// GET /api/payroll?branchId=xxx  — filtered by branch
router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getPayroll
);

// PATCH /api/payroll/:id  — update salary/shift/status for one employee
router.patch(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  updateEmployeePayroll
);

export default router;
