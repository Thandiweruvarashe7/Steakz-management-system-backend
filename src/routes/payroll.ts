
import { Router } from 'express';
import { getPayroll, updateEmployeePayroll } from '../controllers/payrollController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();


router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getPayroll
);

router.patch(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  updateEmployeePayroll
);

export default router;
