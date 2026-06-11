// ──────────────────────────────────────────────────────────────────────────────
// routes/users.ts
//
// Routes for managing user accounts (staff and customers).
// Most routes here are restricted to managers and admins.
// All routes here are under /api/users (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { getUsers, getUserMe, createUser, updateUser, deleteUser } from '../controllers/userController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import prisma from '../config/database';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../types';

const router = Router();

// ── GET /api/users/public/customers ──────────────────────────────────────────
// PUBLIC — no login required.
// Returns the 8 most recently registered customer accounts.
// Used by the login page to show a quick-select list of demo customers.
router.get('/public/customers', async (req: Request, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },              // only fetch customers, not staff
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },           // newest first
      take: 8,                                  // maximum 8 results
    });
    console.log('[PUBLIC] /users/public/customers — returning', customers.length, 'customers');
    res.json({ success: true, users: customers });
  } catch (error) {
    console.error('[PUBLIC] customers error:', error);
    res.status(500).json({ success: false, users: [] });
  }
});

// ── GET /api/users/me ─────────────────────────────────────────────────────────
// Returns the profile of the currently logged-in user.
// verifyToken confirms the user is logged in before getUserMe runs.
router.get('/me', verifyToken, getUserMe);

// ── GET /api/users ────────────────────────────────────────────────────────────
// Returns a list of all users. Restricted to managers and admins.
// Branch managers see only their branch's staff; admins see everyone.
router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getUsers
);

// ── POST /api/users ───────────────────────────────────────────────────────────
// Creates a new user account. Only ADMIN can do this.
// Validates all required fields before calling createUser.
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN'),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    // Role must be one of the valid system roles — prevents typos or invalid values.
    body('role')
      .isIn(['CUSTOMER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'])
      .withMessage('Invalid role'),
  ],
  validate,
  createUser
);

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
// Updates a user's profile details (name, email, etc.).
// Any authenticated user can update their own profile; managers can update others.
// :id is a URL parameter — e.g. /api/users/abc123 updates user with id "abc123".
router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'CUSTOMER'),
  updateUser
);

// ── PATCH /api/users/:id/status ───────────────────────────────────────────────
// Updates an employee's status (ACTIVE, ON_LEAVE, or TERMINATED).
// Managers can only change status for staff in their own branch.
// The logic is written inline here (not in a separate controller).
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { employeeStatus } = req.body as { employeeStatus?: string };
      const targetId = req.params.id; // the ID of the user being updated (from the URL)
      const { role: requesterRole, branchId: requesterBranchId, userId: requesterId } = req.user!;

      console.log('[USER] PATCH status — targetId:', targetId, 'status:', employeeStatus, 'by:', requesterRole);

      // Only these three values are valid statuses — reject anything else.
      const validStatuses = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'];
      if (!employeeStatus || !validStatuses.includes(employeeStatus)) {
        res.status(400).json({ success: false, message: `employeeStatus must be one of: ${validStatuses.join(', ')}` });
        return;
      }

      // Make sure the user being updated actually exists in the database.
      const target = await prisma.user.findUnique({ where: { id: targetId } });
      if (!target) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // A BRANCH_MANAGER can only change the status of staff in their own branch.
      // If the target user belongs to a different branch, block the request.
      if (requesterRole === 'BRANCH_MANAGER' && target.branchId !== requesterBranchId) {
        res.status(403).json({ success: false, message: 'You can only update status for staff in your branch' });
        return;
      }

      // All checks passed — update the employee's status in the database.
      // Cast to `any` because employeeStatus was added by a migration and isn't
      // yet reflected in the auto-generated Prisma TypeScript types.
      const updated = await (prisma.user as any).update({
        where: { id: targetId },
        data: { employeeStatus },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, employeeStatus: true, branchId: true },
      });

      console.log('[USER] Status updated:', targetId, 'to', employeeStatus);

      // Write an audit log entry so there's a permanent record of who changed what.
      logAudit('STAFF_STATUS_UPDATED', 'User', requesterId, `Status changed to ${employeeStatus} for ${target.email}`, targetId).catch(() => {});

      res.json({ success: true, user: updated });
    } catch (error) {
      console.error('[USER] PATCH status error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
// Permanently deletes a user account. Only ADMIN can do this.
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteUser);

export default router;
