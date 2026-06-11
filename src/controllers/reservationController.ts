import { Response } from 'express';
import { TableStatus } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import {
  sendReservationConfirmation,
  sendReservationCancellation,
} from '../services/emailService';
import { createNotification } from '../utils/notificationHelper';
import { logAudit } from '../utils/auditLogger';

async function getEffectiveBranchId(userId: string, jwtBranchId: string | null | undefined): Promise<string | null> {
  if (jwtBranchId) return jwtBranchId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { branchId: true } });
  const resolved = user?.branchId ?? null;
  console.log('[BRANCH] getEffectiveBranchId — jwtBranchId was null, DB resolved:', resolved, '| userId:', userId);
  return resolved;
}

export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('[RESERVATION] Creating — userId:', req.user?.userId, 'body:', req.body);

    const { branchId, tableId: requestedTableId, reservationDate, partySize } = req.body as {
      branchId: string;
      tableId?: string;
      reservationDate: string;
      partySize: number;
    };

    const customerId = req.user!.userId;
    const requestedDate = new Date(reservationDate);

    console.log('[RESERVATION] Parsed date:', requestedDate, 'valid:', !isNaN(requestedDate.getTime()));

    if (isNaN(requestedDate.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid reservationDate — must be a valid ISO date string' });
      return;
    }

    // Resolve branch — frontend may send static ID 'b1'–'b5' or real UUID
    let resolvedBranchId = branchId;
    let branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      const slugMap: Record<string, string> = { b1: 'london', b2: 'manchester', b3: 'leeds', b4: 'birmingham', b5: 'liverpool' };
      const slug = slugMap[branchId];
      if (slug) {
        branch = await prisma.branch.findFirst({ where: { name: { contains: slug, mode: 'insensitive' } } });
      }
      if (branch) resolvedBranchId = branch.id;
    }
    if (!branch) {
      console.log('[RESERVATION] Branch not found:', branchId);
      res.status(404).json({ success: false, message: `Branch not found: ${branchId}` });
      return;
    }
    console.log('[RESERVATION] Resolved branch:', branchId, '→', resolvedBranchId, '(', branch.name, ')');

    let tableId = requestedTableId;

    if (tableId) {
      // Caller specified a table — verify it exists and belongs to this branch
      const specified = await prisma.table.findFirst({ where: { id: tableId, branchId: resolvedBranchId } });
      if (!specified) {
        res.status(404).json({ success: false, message: 'Table not found in the specified branch' });
        return;
      }
      if (specified.capacity < partySize) {
        res.status(400).json({
          success: false,
          message: `Table capacity (${specified.capacity}) is less than party size (${partySize})`,
        });
        return;
      }
    } else {
      // BUG 3 FIX — auto-assign: find first AVAILABLE table that fits the party
      const available = await prisma.table.findFirst({
        where: {
          branchId: resolvedBranchId,
          status: TableStatus.AVAILABLE,
          capacity: { gte: partySize },
        },
        orderBy: { tableNumber: 'asc' },
      });

      if (!available) {
        console.log(`[RESERVATION] No available table at branch ${resolvedBranchId} for party of ${partySize}`);
        res.status(409).json({
          success: false,
          message: 'No tables available at this branch for the selected time',
        });
        return;
      }

      tableId = available.id;
      console.log(`[RESERVATION] Auto-assigned table ${available.tableNumber} (id: ${available.id})`);
    }

    // Check for time conflict on the assigned table
    const conflict = await prisma.reservation.findFirst({
      where: {
        tableId,
        reservationDate: requestedDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (conflict) {
      res.status(409).json({ success: false, message: 'Table is already reserved at this time' });
      return;
    }

    // Create the reservation and mark the table as RESERVED in a transaction
    const [reservation] = await prisma.$transaction([
      prisma.reservation.create({
        data: { customerId, branchId: resolvedBranchId, tableId, reservationDate: requestedDate, partySize },
        include: {
          branch: { select: { id: true, name: true, location: true } },
          table: { select: { id: true, tableNumber: true, capacity: true } },
          customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.table.update({
        where: { id: tableId },
        data: { status: TableStatus.RESERVED },
      }),
    ]);

    const customer = await prisma.user.findUnique({ where: { id: customerId } });
    if (customer) {
      const d = new Date(reservationDate);
      sendReservationConfirmation(customer.email, customer.firstName, {
        branchName: reservation.branch.name,
        date: d.toLocaleDateString('en-GB'),
        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        partySize,
        tableNumber: reservation.table.tableNumber,
      }).catch(console.error);
    }

    console.log('[RESERVATION] Created reservation:', reservation.id, 'table:', reservation.table.tableNumber, 'customer:', customerId);

    // Notify customer: reservation confirmed
    createNotification({
      userId: customerId,
      type: 'RESERVATION_UPDATE',
      title: 'Reservation Confirmed',
      message: `Your reservation at ${reservation.branch.name} on ${requestedDate.toLocaleDateString('en-GB')} for ${partySize} has been confirmed (table ${reservation.table.tableNumber}).`,
    }).catch(console.error);
    console.log('[RESERVATION] Customer notified:', customerId);

    // Notify branch manager: new reservation
    const branchManager = await prisma.user.findFirst({
      where: { branchId, role: 'BRANCH_MANAGER' },
      select: { id: true },
    });
    if (branchManager) {
      createNotification({
        userId: branchManager.id,
        type: 'RESERVATION_UPDATE',
        title: 'New Reservation',
        message: `New reservation at ${reservation.branch.name} — party of ${partySize} on ${requestedDate.toLocaleDateString('en-GB')} (table ${reservation.table.tableNumber}).`,
      }).catch(console.error);
      console.log('[RESERVATION] Branch manager notified:', branchManager.id);
    }

    // Notify chef: upcoming reservation to prepare for
    const chef = await prisma.user.findFirst({
      where: { branchId, role: 'CHEF' },
      select: { id: true },
    });
    if (chef) {
      createNotification({
        userId: chef.id,
        type: 'RESERVATION_UPDATE',
        title: 'New Reservation',
        message: `New reservation: ${partySize} guests on ${requestedDate.toLocaleDateString('en-GB')} at ${requestedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — Table ${reservation.table.tableNumber}`,
      }).catch(console.error);
      console.log('[RESERVATION] Chef notified:', chef.id);
    }

    logAudit('RESERVATION_CREATED', 'Reservation', customerId, `Party of ${partySize} at ${reservation.branch.name} on ${requestedDate.toISOString()}`, reservation.id).catch(() => {});

    res.status(201).json({
      success: true,
      reservation: {
        ...reservation,
        tableNumber: reservation.table.tableNumber,
      },
    });
  } catch (error) {
    console.error('[RESERVATION] CREATE ERROR:', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

export const getReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    console.log('[BRANCH ISOLATION] Role:', role, '| UserBranch:', userBranchId, '| Query:', req.query);

    let where: Record<string, unknown> = {};

    if (role === 'CUSTOMER') {
      where = { customerId: userId };
    } else if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      if (queryBranchId) where = { branchId: queryBranchId };
    } else {
      const effectiveBranchId = await getEffectiveBranchId(userId, userBranchId);
      console.log('[BRANCH ISOLATION] getReservations — effectiveBranchId:', effectiveBranchId, '| role:', role);
      if (!effectiveBranchId) {
        res.status(400).json({ message: 'No branch assigned to this account' });
        return;
      }
      where = { branchId: effectiveBranchId };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        branch: { select: { id: true, name: true, location: true } },
        table: { select: { id: true, tableNumber: true, capacity: true } },
      },
      orderBy: { reservationDate: 'asc' },
    });

    console.log('[RESERVATION] getReservations — returning', reservations.length, 'records for role:', role);
    res.json({ success: true, reservations });
  } catch (error) {
    console.error('[RESERVATION] GET ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getReservationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId, branchId: userBranchId } = req.user!;

    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        branch: { select: { id: true, name: true } },
        table: { select: { id: true, tableNumber: true, capacity: true } },
      },
    });

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    if (role === 'CUSTOMER' && reservation.customerId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (role === 'WAITER_CASHIER' || role === 'BRANCH_MANAGER') {
      const effectiveBranchId = await getEffectiveBranchId(userId, userBranchId);
      console.log('[RESERVATION] getById effectiveBranchId:', effectiveBranchId, '| resBranchId:', reservation.branchId);
      if (effectiveBranchId && reservation.branchId !== effectiveBranchId) {
        res.status(403).json({ message: 'Access denied: not your branch' });
        return;
      }
    }

    res.json({ success: true, reservation });
  } catch (error) {
    console.error('[RESERVATION] GET BY ID ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId, branchId: userBranchId } = req.user!;
    const { status, reservationDate, partySize } = req.body as {
      status?: string;
      reservationDate?: string;
      partySize?: number;
    };

    const existing = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        branch: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!existing) {
      res.status(404).json({ message: 'Reservation not found' });
      return;
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'SEATED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    if (role === 'CUSTOMER') {
      if (existing.customerId !== userId) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      if (status && status !== 'CANCELLED') {
        res.status(403).json({ message: 'Customers can only cancel reservations' });
        return;
      }
    }

    console.log('[RESERVATION] updateReservation BRANCH CHECK:', {
      role,
      userBranchId,
      existingBranchId: existing.branchId,
      reservationId: req.params.id,
      status,
    });
    if (role === 'WAITER_CASHIER' || role === 'BRANCH_MANAGER') {
      const effectiveBranchId = await getEffectiveBranchId(userId, userBranchId);
      console.log('[RESERVATION] effectiveBranchId:', effectiveBranchId,
        '| existingBranchId:', existing.branchId,
        '| match:', effectiveBranchId === existing.branchId);
      if (effectiveBranchId && existing.branchId !== effectiveBranchId) {
        res.status(403).json({ message: 'Access denied: not your branch' });
        return;
      }
      if (!effectiveBranchId) {
        console.warn('[RESERVATION] Branch manager has no branchId — allowing update but logging');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (reservationDate) updateData.reservationDate = new Date(reservationDate);
    if (partySize) updateData.partySize = partySize;

    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        branch: { select: { id: true, name: true, location: true } },
        table: { select: { id: true, tableNumber: true, capacity: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // SEATED/CHECKED_IN → OCCUPIED
    if ((status === 'SEATED' || status === 'CHECKED_IN') && existing.tableId) {
      try {
        await prisma.table.update({
          where: { id: existing.tableId },
          data: { status: TableStatus.OCCUPIED },
        });
        console.log('[RESERVATION] Table', existing.tableId, '→ OCCUPIED');
      } catch (tableErr) {
        console.error('[RESERVATION] Table update OCCUPIED failed (non-fatal):', tableErr);
      }
    }

    // CANCELLED/COMPLETED/NO_SHOW → AVAILABLE
    if ((status === 'CANCELLED' || status === 'COMPLETED' || status === 'NO_SHOW') && existing.tableId) {
      try {
        await prisma.table.update({
          where: { id: existing.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
        console.log('[RESERVATION] Table', existing.tableId, '→ AVAILABLE');
      } catch (tableErr) {
        console.error('[RESERVATION] Table update AVAILABLE failed (non-fatal):', tableErr);
      }
    }

    if (status === 'CANCELLED' && existing.customer?.email) {
      sendReservationCancellation(
        existing.customer.email,
        existing.customer.firstName,
        {
          branchName: existing.branch?.name ?? 'STEAKZ UK',
          date: existing.reservationDate.toLocaleDateString('en-GB'),
        }
      ).catch(console.error);
    }

    res.json({ success: true, reservation });
  } catch (error) {
    console.error('[RESERVATION] UPDATE ERROR:', (error as any)?.message, (error as any)?.code);
    res.status(500).json({
      success: false,
      message: (error as any)?.message ?? 'Server error updating reservation',
    });
  }
};

export const deleteReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId, branchId: userBranchId } = req.user!;
    console.log('[RESERVATION] Cancel — id:', req.params.id, 'by role:', role, 'userId:', userId);

    const existing = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { branch: { select: { id: true, name: true } }, customer: { select: { firstName: true, email: true } } },
    });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Reservation not found' });
      return;
    }

    if (existing.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Reservation is already cancelled' });
      return;
    }

    // Ownership checks
    if (role === 'CUSTOMER' && existing.customerId !== userId) {
      console.log('[RESERVATION] Cancel DENIED — customer does not own reservation');
      res.status(403).json({ success: false, message: 'You can only cancel your own reservations' });
      return;
    }
    if (role === 'BRANCH_MANAGER') {
      const effectiveBranchId = await getEffectiveBranchId(userId, userBranchId);
      console.log('[RESERVATION] Cancel — effectiveBranchId:', effectiveBranchId, '| resBranchId:', existing.branchId);
      if (effectiveBranchId && existing.branchId !== effectiveBranchId) {
        console.log('[RESERVATION] Cancel DENIED — branch manager wrong branch');
        res.status(403).json({ success: false, message: 'You can only cancel reservations at your branch' });
        return;
      }
    }

    // Soft-cancel: set status to CANCELLED, release the table
    const cancelled = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' as any },
    });

    if (existing.tableId) {
      try {
        await prisma.table.update({
          where: { id: existing.tableId },
          data: { status: TableStatus.AVAILABLE },
        });
        console.log('[RESERVATION] Table', existing.tableId, '→ AVAILABLE (reservation cancelled)');
      } catch (tableErr) {
        console.error('[RESERVATION] deleteReservation table update failed (non-fatal):', tableErr);
      }
    }

    console.log('[RESERVATION] Cancelled (soft) — id:', req.params.id);

    if (existing.customer?.email) {
      sendReservationCancellation(
        existing.customer.email,
        existing.customer.firstName,
        { branchName: existing.branch?.name ?? 'STEAKZ', date: existing.reservationDate.toLocaleDateString('en-GB') }
      ).catch(console.error);
    }

    logAudit('RESERVATION_CANCELLED', 'Reservation', userId, `Reservation cancelled at ${existing.branch?.name ?? 'STEAKZ'}`, req.params.id).catch(() => {});

    res.json({ success: true, message: 'Reservation cancelled successfully', reservation: cancelled });
  } catch (error) {
    console.error('[RESERVATION] CANCEL ERROR full:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
