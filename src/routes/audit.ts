// ──────────────────────────────────────────────────────────────────────────────
// routes/audit.ts
//
// Routes for the audit log — a tamper-proof record of important actions
// taken in the system (e.g. "Admin deleted user X", "Manager changed salary").
//
// Think of it like a CCTV system for data changes: everything important is logged
// and only senior roles can view it.
//
// All routes here are under /api/audit-logs (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// ── GET /api/audit-logs ───────────────────────────────────────────────────────
// Returns the list of audit log entries — who did what and when.
// Only ADMIN and HQ_MANAGER can view this — it contains sensitive operational data.
// Supports pagination and filtering (by user, action type, date range, etc.).
router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  getAuditLogs
);

export default router;
