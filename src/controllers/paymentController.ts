import { Response } from 'express';
import { TableStatus } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendPaymentReceipt } from '../services/emailService';

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, method } = req.body as {
      orderId: string;
      method: 'CASH' | 'CARD' | 'CONTACTLESS';
    };

    const { role, branchId: userBranchId } = req.user!;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        branch: { select: { name: true } },
        waiter: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (role !== 'ADMIN' && role !== 'HQ_MANAGER' && order.branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    if (order.payment) {
      res.status(409).json({ message: 'Order already has a payment' });
      return;
    }

    if (order.status === 'CANCELLED') {
      res.status(400).json({ message: 'Cannot process payment for a cancelled order' });
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        method,
        status: 'COMPLETED',
      },
    });

    await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' as const } });

    if (order.tableId) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: TableStatus.AVAILABLE },
      });
    }

    if (order.waiter) {
      sendPaymentReceipt(order.waiter.email, order.waiter.firstName, {
        orderId: order.id,
        amount: Number(order.total),
        method,
        branchName: order.branch.name,
      }).catch(console.error);
    }

    res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error('[PAYMENT] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    let branchFilter: string | undefined;

    if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      branchFilter = queryBranchId;
    } else {
      branchFilter = userBranchId ?? undefined;
    }

    const payments = await prisma.payment.findMany({
      where: branchFilter
        ? { order: { branchId: branchFilter } }
        : {},
      include: {
        order: {
          include: {
            branch: { select: { id: true, name: true } },
            table: { select: { id: true, tableNumber: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('[PAYMENT] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getPaymentReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    let branchFilter: string | undefined;

    if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      branchFilter = queryBranchId;
    } else {
      branchFilter = userBranchId ?? undefined;
    }

    const dateFilter =
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {};

    const payments = await prisma.payment.findMany({
      where: {
        ...(branchFilter ? { order: { branchId: branchFilter } } : {}),
        ...dateFilter,
        status: 'COMPLETED',
      },
      include: {
        order: {
          include: {
            branch: { select: { id: true, name: true } },
          },
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod = payments.reduce(
      (acc, p) => {
        acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    const byBranch = payments.reduce(
      (acc, p) => {
        const name = p.order.branch.name;
        acc[name] = (acc[name] ?? 0) + Number(p.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    res.json({
      success: true,
      report: {
        totalRevenue,
        totalTransactions: payments.length,
        byMethod,
        byBranch,
      },
    });
  } catch (error) {
    console.error('[PAYMENT] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
