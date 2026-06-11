import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

type Format = 'json' | 'csv';

function getFormat(req: AuthRequest): Format {
  return (req.query.format as string) === 'csv' ? 'csv' : 'json';
}

function toBranchFilter(role: string, userBranchId: string | null | undefined, queryBranchId?: string): string | undefined {
  if (role === 'ADMIN' || role === 'HQ_MANAGER') return queryBranchId ?? undefined;
  return userBranchId ?? undefined;
}

function sendCsv(res: Response, filename: string, rows: string[][]): void {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

// ── Revenue Report ────────────────────────────────────────────────────────────

export const getRevenueReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const format = getFormat(req);

    const branchFilter = toBranchFilter(role, userBranchId, queryBranchId);

    const dateFilter = startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {};

    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        ...(branchFilter ? { order: { branchId: branchFilter } } : {}),
        ...dateFilter,
      },
      include: {
        order: {
          include: { branch: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);
    const byBranch: Record<string, number> = {};
    const byMethod: Record<string, number> = {};

    for (const p of payments) {
      const bn = p.order.branch.name;
      byBranch[bn] = (byBranch[bn] ?? 0) + Number(p.amount);
      byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amount);
    }

    if (format === 'csv') {
      const rows: string[][] = [
        ['Payment ID', 'Order ID', 'Branch', 'Amount (£)', 'Method', 'Date'],
        ...payments.map((p) => [
          p.id,
          p.orderId,
          p.order.branch.name,
          Number(p.amount).toFixed(2),
          p.method,
          p.createdAt.toISOString(),
        ]),
        [],
        ['Total Revenue', totalRevenue.toFixed(2)],
      ];
      sendCsv(res, 'revenue-report.csv', rows);
      return;
    }

    // Branch-level summary for print-friendly views
    const branchSummary = Object.entries(byBranch).map(([name, revenue]) => ({
      name,
      revenue: Number(revenue.toFixed(2)),
      orders: payments.filter((p) => p.order.branch.name === name).length,
      reservations: 0, // populated separately if needed
    }));

    console.log('[REPORTS] Revenue report generated — total:', totalRevenue.toFixed(2), 'transactions:', payments.length);

    res.json({
      success: true,
      // Flat shape (for print/summary views)
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'all-time',
      branches: branchSummary,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: payments.length,
      generatedAt: new Date().toISOString(),
      // Detailed shape (for charts/tables)
      report: {
        totalRevenue,
        totalTransactions: payments.length,
        byBranch,
        byMethod,
        payments: payments.map((p) => ({
          id: p.id,
          orderId: p.orderId,
          branch: p.order.branch.name,
          amount: Number(p.amount),
          method: p.method,
          date: p.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('[REPORTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Orders Report ─────────────────────────────────────────────────────────────

export const getOrdersReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const format = getFormat(req);

    const branchFilter = toBranchFilter(role, userBranchId, queryBranchId);

    const orders = await prisma.order.findMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
      include: {
        branch: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const byStatus: Record<string, number> = {};
    const byBranch: Record<string, number> = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
      byBranch[o.branch.name] = (byBranch[o.branch.name] ?? 0) + 1;
    }

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

    if (format === 'csv') {
      const rows: string[][] = [
        ['Order ID', 'Branch', 'Status', 'Total (£)', 'Items', 'Date'],
        ...orders.map((o) => [
          o.id,
          o.branch.name,
          o.status,
          Number(o.total).toFixed(2),
          String(o.items.length),
          o.createdAt.toISOString(),
        ]),
        [],
        ['Total Orders', String(orders.length), 'Total Revenue', totalRevenue.toFixed(2)],
      ];
      sendCsv(res, 'orders-report.csv', rows);
      return;
    }

    res.json({
      success: true,
      report: {
        totalOrders: orders.length,
        totalRevenue,
        byStatus,
        byBranch,
      },
    });
  } catch (error) {
    console.error('[REPORTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Reservations Report ───────────────────────────────────────────────────────

export const getReservationsReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const format = getFormat(req);

    const branchFilter = toBranchFilter(role, userBranchId, queryBranchId);

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        ...(startDate || endDate
          ? {
              reservationDate: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
      include: {
        branch: { select: { id: true, name: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
        table: { select: { tableNumber: true } },
      },
      orderBy: { reservationDate: 'asc' },
    });

    const byStatus: Record<string, number> = {};
    const byBranch: Record<string, number> = {};
    for (const r of reservations) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byBranch[r.branch.name] = (byBranch[r.branch.name] ?? 0) + 1;
    }

    if (format === 'csv') {
      const rows: string[][] = [
        ['Reservation ID', 'Branch', 'Customer', 'Email', 'Table', 'Date', 'Party Size', 'Status'],
        ...reservations.map((r) => [
          r.id,
          r.branch.name,
          `${r.customer.firstName} ${r.customer.lastName}`,
          r.customer.email,
          String(r.table.tableNumber),
          r.reservationDate.toISOString(),
          String(r.partySize),
          r.status,
        ]),
      ];
      sendCsv(res, 'reservations-report.csv', rows);
      return;
    }

    res.json({
      success: true,
      report: {
        totalReservations: reservations.length,
        byStatus,
        byBranch,
        reservations,
      },
    });
  } catch (error) {
    console.error('[REPORTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Inventory Report ──────────────────────────────────────────────────────────

export const getInventoryReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const format = getFormat(req);

    const branchFilter = toBranchFilter(role, userBranchId, queryBranchId);

    const inventory = await prisma.inventory.findMany({
      where: branchFilter ? { branchId: branchFilter } : {},
      include: { branch: { select: { id: true, name: true } } },
      orderBy: [{ branchId: 'asc' }, { name: 'asc' }],
    });

    const lowStock = inventory.filter((i) => i.quantity <= i.minimumStock);

    if (format === 'csv') {
      const rows: string[][] = [
        ['Item ID', 'Branch', 'Name', 'Quantity', 'Minimum Stock', 'Status'],
        ...inventory.map((i) => [
          i.id,
          i.branch.name,
          i.name,
          String(i.quantity),
          String(i.minimumStock),
          i.quantity <= i.minimumStock ? 'LOW STOCK' : 'OK',
        ]),
      ];
      sendCsv(res, 'inventory-report.csv', rows);
      return;
    }

    res.json({
      success: true,
      report: {
        totalItems: inventory.length,
        lowStockCount: lowStock.length,
        lowStock,
        inventory,
      },
    });
  } catch (error) {
    console.error('[REPORTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
