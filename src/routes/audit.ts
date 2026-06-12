
import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  getAuditLogs
);

export default router;
