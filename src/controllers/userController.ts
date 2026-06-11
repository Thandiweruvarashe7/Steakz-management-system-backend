import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendRoleChangedNotification } from '../services/emailService';
import { logAudit } from '../utils/auditLogger';

export const getUserMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        branchId: true,
        employeeId: true,
        salary: true,
        shift: true,
        employeeStatus: true,
        dateJoined: true,
        teamAssignment: true,
        createdAt: true,
        branch: { select: { id: true, name: true, location: true } },
      } as any,
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('[USER] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    let where: Record<string, unknown> = {};

    if (role === 'ADMIN') {
      if (queryBranchId) where = { branchId: queryBranchId };
    } else if (role === 'HQ_MANAGER') {
      where = queryBranchId ? { branchId: queryBranchId } : {};
    } else if (role === 'BRANCH_MANAGER') {
      where = { branchId: userBranchId! };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        branchId: true,
        employeeId: true,
        salary: true,
        shift: true,
        employeeStatus: true,
        dateJoined: true,
        teamAssignment: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
      } as any,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error('[USER] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role, branchId } = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      branchId?: string;
    };

    console.log('[USER] Creating user:', { email, role, branchId });

    if (!firstName || !lastName || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'All fields required: firstName, lastName, email, password, role' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const staffRoles = ['WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER'];
    if (staffRoles.includes(role) && !branchId) {
      res.status(400).json({ success: false, message: 'Branch ID is required for staff roles' });
      return;
    }

    // Resolve static frontend branchIds ('b1'-'b5') to real DB UUIDs
    let resolvedBranchId = branchId ?? null;
    if (branchId) {
      let branch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch) {
        const slugMap: Record<string, string> = {
          b1: 'london', b2: 'manchester', b3: 'leeds', b4: 'birmingham', b5: 'liverpool',
        };
        const slug = slugMap[branchId];
        if (slug) {
          branch = await prisma.branch.findFirst({ where: { name: { contains: slug, mode: 'insensitive' } } });
        }
      }
      if (!branch) {
        res.status(400).json({ success: false, message: `Branch not found: ${branchId}` });
        return;
      }
      resolvedBranchId = branch.id;
      console.log('[USER] Resolved branchId:', branchId, '→', resolvedBranchId, '(', branch.name, ')');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, role: role as Role, branchId: resolvedBranchId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        branchId: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
      },
    });

    console.log('[USER] Created user:', user.id, user.email, user.role);
    logAudit('USER_CREATED', 'User', req.user!.userId, `Created ${email} with role ${role}`, user.id).catch(() => {});

    res.status(201).json({ success: true, user: { id: user.id, email: user.email, role: user.role, branchId: user.branchId } });
  } catch (error) {
    console.error('[USER] Create error:', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role: requesterRole, userId: requesterId } = req.user!;
    const targetId = req.params.id;

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isOwnProfile = requesterId === targetId;
    const isAdmin = requesterRole === 'ADMIN';

    if (!isOwnProfile && !isAdmin) {
      res.status(403).json({ message: 'You can only update your own profile' });
      return;
    }

    const { firstName, lastName, password, role: newRole, branchId } = req.body as {
      firstName?: string;
      lastName?: string;
      password?: string;
      role?: string;
      branchId?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    if (isAdmin) {
      if (newRole) updateData.role = newRole as Role;
      if (branchId !== undefined) updateData.branchId = branchId || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
      },
    });

    if (isAdmin && newRole && newRole !== target.role) {
      const branchName = updatedUser.branch?.name;
      sendRoleChangedNotification(target.email, target.firstName, newRole, branchName).catch(
        console.error
      );
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[USER] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId: requesterId } = req.user!;
    const targetId = req.params.id;

    if (targetId === requesterId) {
      res.status(400).json({ message: 'You cannot delete your own account' });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('[USER] Deleting user:', targetId, target.email);

    // 1. Session tokens
    try { await prisma.refreshToken.deleteMany({ where: { userId: targetId } }); }
    catch (e) { console.warn('[USER] refreshToken delete skipped:', e); }

    // 2. Notifications
    try { await (prisma.notification as any).deleteMany({ where: { userId: targetId } }); }
    catch (e) { console.warn('[USER] notification delete skipped:', e); }

    // 3. Audit logs (userId is optional String? — safe to delete)
    try { await (prisma.auditLog as any).deleteMany({ where: { userId: targetId } }); }
    catch (e) { console.warn('[USER] auditLog delete skipped:', e); }

    // 4. Nullify nullable FK on orders (customerId String?, waiterId String?)
    try {
      await (prisma.order as any).updateMany({ where: { customerId: targetId }, data: { customerId: null } });
      console.log('[USER] Nullified order.customerId for:', targetId);
    } catch (e) { console.warn('[USER] order customerId nullify skipped:', e); }

    try {
      await (prisma.order as any).updateMany({ where: { waiterId: targetId }, data: { waiterId: null } });
      console.log('[USER] Nullified order.waiterId for:', targetId);
    } catch (e) { console.warn('[USER] order waiterId nullify skipped:', e); }

    // 5. Reservations — customerId is NOT NULL, must delete (not nullify)
    try {
      await (prisma.reservation as any).deleteMany({ where: { customerId: targetId } });
      console.log('[USER] Deleted reservations for:', targetId);
    } catch (e) { console.warn('[USER] reservation delete skipped:', e); }

    // 6. Baskets — customerId is NOT NULL, must delete (BasketItems cascade automatically)
    try {
      await (prisma.basket as any).deleteMany({ where: { customerId: targetId } });
      console.log('[USER] Deleted baskets for:', targetId);
    } catch (e) { console.warn('[USER] basket delete skipped:', e); }

    // 7. Finally delete the user
    await prisma.user.delete({ where: { id: targetId } });

    console.log('[USER] Successfully deleted:', targetId, target.email);
    logAudit('USER_DELETED', 'User', requesterId, `Deleted ${target.email}`, targetId).catch(() => {});
    res.json({ success: true, message: 'User deleted successfully', deletedEmail: target.email, deletedId: targetId });
  } catch (error: any) {
    console.error('[USER] DELETE ERROR:', error?.message, error);
    if (error?.code === 'P2003') {
      console.error('[USER] FK constraint on field:', error?.meta?.field_name);
      res.status(500).json({
        message: `Cannot delete: user has related ${error?.meta?.field_name ?? 'records'}. Contact support.`,
      });
    } else {
      res.status(500).json({ message: error?.message ?? 'Server error' });
    }
  }
};
