import { Request, Response } from 'express';
import { TableStatus } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../types';

// Public endpoint — no auth required — for the reservations page to check availability
export const getTableAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.query.branchId as string | undefined;

    if (!branchId) {
      res.status(400).json({ success: false, message: 'branchId query param is required' });
      return;
    }

    const tables = await prisma.table.findMany({
      where: { branchId },
      select: { id: true, tableNumber: true, capacity: true, status: true },
      orderBy: { tableNumber: 'asc' },
    });

    const available = tables.filter((t) => t.status === 'AVAILABLE');
    console.log('[TABLES] getTableAvailability — branchId:', branchId, 'total:', tables.length, 'available:', available.length);
    res.json({ success: true, tables, availableCount: available.length });
  } catch (error) {
    console.error('[TABLES] getTableAvailability ERROR:', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

export const getTables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    let filterBranchId: string | undefined;

    if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      filterBranchId = queryBranchId;
    } else {
      filterBranchId = userBranchId ?? undefined;
    }

    const tables = await prisma.table.findMany({
      where: filterBranchId ? { branchId: filterBranchId } : {},
      include: { branch: { select: { id: true, name: true } } },
      orderBy: [{ branchId: 'asc' }, { tableNumber: 'asc' }],
    });

    res.json({ success: true, tables });
  } catch (error) {
    console.error('[TABLES] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { branchId, tableNumber, capacity } = req.body as {
      branchId: string;
      tableNumber: number;
      capacity: number;
    };

    const { role, branchId: userBranchId } = req.user!;

    if (role === 'BRANCH_MANAGER' && branchId !== userBranchId) {
      res.status(403).json({ message: 'You can only create tables for your branch' });
      return;
    }

    const existing = await prisma.table.findFirst({ where: { branchId, tableNumber } });
    if (existing) {
      res.status(409).json({ message: 'Table number already exists in this branch' });
      return;
    }

    const table = await prisma.table.create({
      data: { branchId, tableNumber, capacity },
      include: { branch: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, table });
  } catch (error) {
    console.error('[TABLES] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const resetTableAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    const branchFilter =
      role === 'ADMIN' || role === 'HQ_MANAGER'
        ? queryBranchId
        : userBranchId ?? undefined;

    // Tables that are NOT genuinely OCCUPIED (i.e. have an active order)
    const activeOrderTableIds = (
      await prisma.order.findMany({
        where: {
          status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] },
          tableId: { not: null },
          ...(branchFilter ? { branchId: branchFilter } : {}),
        },
        select: { tableId: true },
      })
    )
      .map((o) => o.tableId)
      .filter(Boolean) as string[];

    // Tables that have an upcoming active reservation (PENDING or CONFIRMED, future date)
    const activeReservationTableIds = (
      await prisma.reservation.findMany({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          reservationDate: { gte: new Date() },
          ...(branchFilter ? { branchId: branchFilter } : {}),
        },
        select: { tableId: true },
      })
    ).map((r) => r.tableId);

    const busyTableIds = [...new Set([...activeOrderTableIds, ...activeReservationTableIds])];

    const result = await prisma.table.updateMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        id: { notIn: busyTableIds },
        status: { not: 'AVAILABLE' },
      },
      data: { status: TableStatus.AVAILABLE },
    });

    console.log(`[TABLES] reset-availability: freed ${result.count} tables (${busyTableIds.length} kept busy)`);

    res.json({
      success: true,
      message: `Reset ${result.count} tables to AVAILABLE`,
      freedCount: result.count,
      keptBusyCount: busyTableIds.length,
    });
  } catch (error) {
    console.error('[TABLES] reset-availability error:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;

    const existing = await prisma.table.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Table not found' });
      return;
    }

    if (
      role !== 'ADMIN' &&
      role !== 'HQ_MANAGER' &&
      existing.branchId !== userBranchId
    ) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    const table = await prisma.table.update({
      where: { id: req.params.id },
      data: req.body as { capacity?: number; status?: TableStatus; tableNumber?: number },
      include: { branch: { select: { id: true, name: true } } },
    });

    res.json({ success: true, table });
  } catch (error) {
    console.error('[TABLES] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
