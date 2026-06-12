
import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { getUsers, getUserMe, createUser, updateUser, deleteUser } from '../controllers/userController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import prisma from '../config/database';
import { logAudit } from '../utils/auditLogger';
import { AuthRequest } from '../types';

const router = Router();

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

router.get('/me', verifyToken, getUserMe);


router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getUsers
);

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

router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER', 'WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'CUSTOMER'),
  updateUser
);

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

      const validStatuses = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'];
      if (!employeeStatus || !validStatuses.includes(employeeStatus)) {
        res.status(400).json({ success: false, message: `employeeStatus must be one of: ${validStatuses.join(', ')}` });
        return;
      }

      const target = await prisma.user.findUnique({ where: { id: targetId } });
      if (!target) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      if (requesterRole === 'BRANCH_MANAGER' && target.branchId !== requesterBranchId) {
        res.status(403).json({ success: false, message: 'You can only update status for staff in your branch' });
        return;
      }

      const updated = await (prisma.user as any).update({
        where: { id: targetId },
        data: { employeeStatus },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, employeeStatus: true, branchId: true },
      });

      console.log('[USER] Status updated:', targetId, 'to', employeeStatus);

      logAudit('STAFF_STATUS_UPDATED', 'User', requesterId, `Status changed to ${employeeStatus} for ${target.email}`, targetId).catch(() => {});

      res.json({ success: true, user: updated });
    } catch (error) {
      console.error('[USER] PATCH status error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteUser);

export default router;
