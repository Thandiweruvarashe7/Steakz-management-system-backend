import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const branchFilter =
      role === 'ADMIN' || role === 'HQ_MANAGER'
        ? queryBranchId
        : userBranchId ?? undefined;

    const dateFilter =
      startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {};

    const orderWhere = {
      ...(branchFilter ? { branchId: branchFilter } : {}),
      ...dateFilter,
    };

    const [
      mostOrderedMeals,
      highestRevenueMeals,
      basketStats,
      salesPerBranch,
      ordersPerBranch,
      recentOrders,
    ] = await Promise.all([
      getMostOrderedMeals(orderWhere),
      getHighestRevenueMeals(orderWhere),
      getBasketStats(branchFilter, dateFilter),
      getSalesPerBranch(branchFilter, dateFilter),
      getOrdersPerBranch(branchFilter, dateFilter),
      prisma.order.count({ where: orderWhere }),
    ]);

    res.json({
      success: true,
      analytics: {
        mostOrderedMeals,
        highestRevenueMeals,
        basketStats,
        salesPerBranch,
        ordersPerBranch,
        totalOrders: recentOrders,
      },
    });
  } catch (error) {
    console.error('[ANALYTICS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

async function getMostOrderedMeals(orderWhere: Record<string, unknown>) {
  const items = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: { order: orderWhere },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  });

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, price: true, category: { select: { name: true } } },
  });

  const itemMap = new Map(menuItems.map((m) => [m.id, m]));

  return items.map((i) => ({
    menuItem: itemMap.get(i.menuItemId),
    totalQuantityOrdered: i._sum.quantity ?? 0,
  }));
}

async function getHighestRevenueMeals(orderWhere: Record<string, unknown>) {
  const items = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: { order: orderWhere },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  });

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true, price: true, category: { select: { name: true } } },
  });

  const itemMap = new Map(menuItems.map((m) => [m.id, m]));

  return items
    .map((i) => {
      const item = itemMap.get(i.menuItemId);
      const revenue = item ? Number(item.price) * (i._sum.quantity ?? 0) : 0;
      return { menuItem: item, revenue: Number(revenue.toFixed(2)) };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

async function getBasketStats(
  branchFilter: string | undefined,
  dateFilter: Record<string, unknown>
) {
  const basketWhere = {
    ...(branchFilter ? { branchId: branchFilter } : {}),
    ...(Object.keys(dateFilter).length ? dateFilter : {}),
  };

  const [total, active, checkedOut, abandoned] = await Promise.all([
    prisma.basket.count({ where: basketWhere }),
    prisma.basket.count({ where: { ...basketWhere, status: 'ACTIVE' } }),
    prisma.basket.count({ where: { ...basketWhere, status: 'CHECKED_OUT' } }),
    prisma.basket.count({ where: { ...basketWhere, status: 'ABANDONED' } }),
  ]);

  const abandonmentRate = total > 0 ? Number(((abandoned / total) * 100).toFixed(1)) : 0;

  const checkedOutBaskets = await prisma.basket.findMany({
    where: { ...basketWhere, status: 'CHECKED_OUT' },
    include: { items: { select: { subtotal: true } } },
  });

  const avgBasketValue =
    checkedOutBaskets.length > 0
      ? Number(
          (
            checkedOutBaskets.reduce(
              (sum, b) => sum + b.items.reduce((s, i) => s + Number(i.subtotal), 0),
              0
            ) / checkedOutBaskets.length
          ).toFixed(2)
        )
      : 0;

  return {
    total,
    active,
    checkedOut,
    abandoned,
    abandonmentRate: `${abandonmentRate}%`,
    avgBasketValue: `£${avgBasketValue}`,
  };
}

async function getSalesPerBranch(
  branchFilter: string | undefined,
  dateFilter: Record<string, unknown>
) {
  const payments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      order: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        ...(Object.keys(dateFilter).length ? dateFilter : {}),
      },
    },
    include: {
      order: { include: { branch: { select: { id: true, name: true } } } },
    },
  });

  const byBranch: Record<string, { branchId: string; branchName: string; totalRevenue: number; transactionCount: number }> =
    {};

  for (const p of payments) {
    const branchId = p.order.branch.id;
    const branchName = p.order.branch.name;
    if (!byBranch[branchId]) {
      byBranch[branchId] = { branchId, branchName, totalRevenue: 0, transactionCount: 0 };
    }
    byBranch[branchId].totalRevenue += Number(p.amount);
    byBranch[branchId].transactionCount += 1;
  }

  return Object.values(byBranch)
    .map((b) => ({ ...b, totalRevenue: Number(b.totalRevenue.toFixed(2)) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

async function getOrdersPerBranch(
  branchFilter: string | undefined,
  dateFilter: Record<string, unknown>
) {
  const orders = await prisma.order.groupBy({
    by: ['branchId'],
    where: {
      ...(branchFilter ? { branchId: branchFilter } : {}),
      ...(Object.keys(dateFilter).length ? dateFilter : {}),
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const branchIds = orders.map((o) => o.branchId);
  const branches = await prisma.branch.findMany({
    where: { id: { in: branchIds } },
    select: { id: true, name: true },
  });

  const branchMap = new Map(branches.map((b) => [b.id, b.name]));

  return orders.map((o) => ({
    branchId: o.branchId,
    branchName: branchMap.get(o.branchId) ?? 'Unknown',
    totalOrders: o._count.id,
  }));
}

// ── Branch Manager dashboard (per-branch, today-focused) ─────────────────────
export const getBranchDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const branchId = role === 'ADMIN' || role === 'HQ_MANAGER'
      ? (req.query.branchId as string | undefined) ?? userBranchId
      : userBranchId;

    if (!branchId) {
      res.status(400).json({ success: false, message: 'No branch specified' });
      return;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [activeOrders, todayReservations, revenueToday, tables, staffCount, liveOrders] =
      await Promise.all([
        prisma.order.count({
          where: { branchId, status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] } },
        }),
        prisma.reservation.count({
          where: {
            branchId,
            reservationDate: { gte: startOfToday, lt: endOfToday },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        }),
        prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            order: { branchId, createdAt: { gte: startOfToday, lt: endOfToday } },
          },
          _sum: { amount: true },
        }),
        prisma.table.findMany({ where: { branchId }, select: { status: true } }),
        // `as any` — CHEF/KITCHEN_ASSISTANT and employeeStatus added by migration
        (prisma.user as any).count({
          where: {
            branchId,
            role: { in: ['WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER'] },
            employeeStatus: 'ACTIVE',
          },
        }) as Promise<number>,
        prisma.order.findMany({
          where: { branchId, status: { in: ['PENDING', 'PREPARING', 'READY'] } },
          include: {
            items: { include: { menuItem: { select: { id: true, name: true } } } },
            table: { select: { id: true, tableNumber: true } },
          },
          orderBy: { createdAt: 'asc' },
          take: 20,
        }),
      ]);

    res.json({
      success: true,
      dashboard: {
        activeOrders,
        todayReservations,
        revenueToday: `£${Number(revenueToday._sum.amount ?? 0).toFixed(2)}`,
        tablesOccupied: tables.filter((t) => t.status === 'OCCUPIED').length,
        tablesAvailable: tables.filter((t) => t.status === 'AVAILABLE').length,
        tablesReserved: tables.filter((t) => t.status === 'RESERVED').length,
        totalTables: tables.length,
        staffOnShift: staffCount,
        liveOrders,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('[analytics getBranchDashboard]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

// ── HQ dashboard (all-branches overview) ─────────────────────────────────────
export const getHQDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queryBranchId = req.query.branchId as string | undefined;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Always fetch ALL branches — needed so allBranches always contains the full set
    // for frontend performance % calculations (max-revenue baseline must be network-wide)
    const allBranchesRaw = await prisma.branch.findMany({
      select: { id: true, name: true, location: true },
    });

    const [
      totalRevenue,
      monthRevenue,
      totalOrders,
      activeOrders,
      upcomingReservations,
      totalStaff,
      salarySummary,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: queryBranchId
          ? { status: 'COMPLETED', order: { branchId: queryBranchId } }
          : { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: queryBranchId
          ? { status: 'COMPLETED', createdAt: { gte: startOfMonth }, order: { branchId: queryBranchId } }
          : { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: queryBranchId ? { branchId: queryBranchId } : {},
      }),
      prisma.order.count({
        where: queryBranchId
          ? { branchId: queryBranchId, status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] } }
          : { status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] } },
      }),
      prisma.reservation.count({
        where: queryBranchId
          ? { branchId: queryBranchId, status: { in: ['PENDING', 'CONFIRMED'] } }
          : { status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
      prisma.user.count({
        where: queryBranchId
          ? { branchId: queryBranchId, role: { not: 'CUSTOMER' } }
          : { role: { not: 'CUSTOMER' } },
      }),
      // salary field added by migration — cast until prisma generate re-run
      (prisma.user as any).aggregate({
        where: queryBranchId
          ? { branchId: queryBranchId, salary: { not: null }, role: { not: 'CUSTOMER' } }
          : { salary: { not: null }, role: { not: 'CUSTOMER' } },
        _sum: { salary: true },
      }) as Promise<{ _sum: { salary: number | null } }>,
    ]);

    const annualSalaryBudget = Number(salarySummary._sum.salary ?? 0);

    // Compute stats for every branch (payment-based revenue = only COMPLETED transactions)
    const allBranchStats = await Promise.all(
      allBranchesRaw.map(async (branch) => {
        const [revenueAgg, branchTotalOrders, totalReservations, staffCount, branchSalary] = await Promise.all([
          prisma.payment.aggregate({
            where: { status: 'COMPLETED', order: { branchId: branch.id } },
            _sum: { amount: true },
          }),
          prisma.order.count({
            where: { branchId: branch.id, status: { notIn: ['CANCELLED'] } },
          }),
          prisma.reservation.count({
            where: { branchId: branch.id, status: { notIn: ['CANCELLED'] } },
          }),
          prisma.user.count({
            where: { branchId: branch.id, role: { notIn: ['CUSTOMER', 'ADMIN', 'HQ_MANAGER'] } },
          }),
          (prisma.user as any).aggregate({
            where: { branchId: branch.id, salary: { not: null } },
            _sum: { salary: true },
          }) as Promise<{ _sum: { salary: number | null } }>,
        ]);

        const revenue = Number(revenueAgg._sum.amount ?? 0);
        const branchAnnual = Number(branchSalary._sum.salary ?? 0);

        const coversResult = await prisma.reservation.aggregate({
          where: { branchId: branch.id, status: { notIn: ['CANCELLED'] } },
          _sum: { partySize: true },
        });
        const covers = coversResult._sum.partySize ?? 0;

        console.log('[ANALYTICS] branchStats:', branch.name, '| revenue:', revenue, '| orders:', branchTotalOrders, '| covers:', covers);

        return {
          branchId: branch.id,
          name: branch.name,
          location: (branch as any).location ?? null,
          revenue: Number(revenue.toFixed(2)),
          totalRevenue: Number(revenue.toFixed(2)),
          orders: branchTotalOrders,
          totalOrders: branchTotalOrders,
          reservations: totalReservations,
          upcomingReservations: totalReservations,
          covers,
          avgCheck: branchTotalOrders > 0 ? Number((revenue / branchTotalOrders).toFixed(2)) : 0,
          staff: staffCount,
          staffCount,
          annualSalaryBudget: branchAnnual,
          monthlySalaryBudget: Number((branchAnnual / 12).toFixed(2)),
        };
      })
    );

    // branches = filtered to queryBranchId when provided; allBranches = always the full set
    const filteredBranchStats = queryBranchId
      ? allBranchStats.filter((b) => b.branchId === queryBranchId)
      : allBranchStats;

    const dashboardData = {
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      monthRevenue: Number(monthRevenue._sum.amount ?? 0),
      totalOrders,
      activeOrders,
      upcomingReservations,
      totalStaff,
      annualSalaryBudget,
      monthlySalaryBudget: Number((annualSalaryBudget / 12).toFixed(2)),
      branches: filteredBranchStats,
      allBranches: allBranchStats,
      timestamp: now.toISOString(),
    };

    console.log('[ANALYTICS] getHQDashboard:', {
      totalRevenue: dashboardData.totalRevenue,
      totalOrders,
      activeOrders,
      branchCount: filteredBranchStats.length,
      allBranchCount: allBranchStats.length,
    });

    // Return both flattened (for analytics.service.ts reading data.totalRevenue)
    // and nested under dashboard (for backward-compat)
    res.json({
      success: true,
      coversDefinition: 'Total guests served based on reservation party sizes',
      ...dashboardData,
      dashboard: dashboardData,
    });
  } catch (error) {
    console.error('[analytics getHQDashboard]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Live polling endpoint (10-second refresh safe) ────────────────────────────
export const getLiveDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const branchId =
      role === 'ADMIN' || role === 'HQ_MANAGER'
        ? (req.query.branchId as string | undefined)
        : userBranchId ?? undefined;

    const orders = await prisma.order.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
        status: { in: ['PENDING', 'PREPARING', 'READY'] },
      },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true } } } },
        table: { select: { id: true, tableNumber: true } },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      activeOrders: orders,
      count: orders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[analytics getLiveDashboard]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Generic stats endpoint — used by admin/manager dashboards ─────────────────
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    const branchFilter =
      role === 'ADMIN' || role === 'HQ_MANAGER'
        ? queryBranchId
        : userBranchId ?? undefined;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalRevenue,
      todayRevenue,
      activeOrders,
      totalOrders,
      upcomingReservations,
      todayReservations,
      totalCustomers,
      totalStaff,
      branchCount,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          ...(branchFilter ? { order: { branchId: branchFilter } } : {}),
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfToday },
          ...(branchFilter ? { order: { branchId: branchFilter } } : {}),
        },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] },
          ...(branchFilter ? { branchId: branchFilter } : {}),
        },
      }),
      prisma.order.count({
        where: branchFilter ? { branchId: branchFilter } : {},
      }),
      prisma.reservation.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          reservationDate: { gte: now },
          ...(branchFilter ? { branchId: branchFilter } : {}),
        },
      }),
      prisma.reservation.count({
        where: {
          reservationDate: { gte: startOfToday },
          status: { in: ['PENDING', 'CONFIRMED'] },
          ...(branchFilter ? { branchId: branchFilter } : {}),
        },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: { not: 'CUSTOMER' } } }),
      prisma.branch.count(),
    ]);

    // All values coerced to numbers with 0 fallback — frontend receives no null/undefined
    const stats = {
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      todayRevenue: Number(todayRevenue._sum.amount ?? 0),
      activeOrders: activeOrders ?? 0,
      totalOrders: totalOrders ?? 0,
      upcomingReservations: upcomingReservations ?? 0,
      todayReservations: todayReservations ?? 0,
      totalCustomers: totalCustomers ?? 0,
      totalStaff: totalStaff ?? 0,
      branchCount: branchCount ?? 0,
      timestamp: now.toISOString(),
    };

    console.log('[ANALYTICS] getStats ADMIN STATS QUERY RESULT:', stats);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('[analytics getStats]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Sales by date range + category — used by sales page ──────────────────────
export const getSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const branchFilter =
      role === 'ADMIN' || role === 'HQ_MANAGER'
        ? queryBranchId
        : userBranchId ?? undefined;

    const start = startDate ? new Date(startDate) : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        createdAt: { gte: start, lte: end },
        status: { in: ['COMPLETED', 'PAID', 'SERVED'] },
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: { category: { select: { name: true } } },
            },
          },
        },
      },
    });

    const byCategory: Record<string, { items: number; revenue: number }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.menuItem.category?.name ?? 'Other';
        if (!byCategory[cat]) byCategory[cat] = { items: 0, revenue: 0 };
        byCategory[cat].items += item.quantity;
        byCategory[cat].revenue = Number(
          (byCategory[cat].revenue + Number(item.unitPrice) * item.quantity).toFixed(2)
        );
      }
    }

    const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

    // Convert object → array so frontend can call .reduce() / .map()
    const categories = Object.entries(byCategory).map(([category, data]) => ({
      category,
      items: data.items,
      revenue: Number(data.revenue.toFixed(2)),
    }));

    console.log('[Analytics] getSales — orders:', orders.length, 'categories:', categories.length, 'totalRevenue:', totalRevenue.toFixed(2), 'branchFilter:', branchFilter ?? 'all');

    res.json({
      success: true,
      categories,
      totalOrders: orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCovers: orders.length,
      period: { start: start.toISOString(), end: end.toISOString() },
    });
  } catch (error) {
    console.error('[analytics getSales]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Revenue time-series — used by dashboard charts ────────────────────────────
export const getRevenueSeries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const days = Math.min(Number(req.query.days ?? 30), 90); // default 30, max 90

    const branchFilter =
      role === 'ADMIN' || role === 'HQ_MANAGER'
        ? queryBranchId
        : userBranchId ?? undefined;

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: since },
        ...(branchFilter ? { order: { branchId: branchFilter } } : {}),
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: since },
        ...(branchFilter ? { branchId: branchFilter } : {}),
      },
      select: { createdAt: true },
    });

    // Build a map of date → { revenue, orders }
    const byDay = new Map<string, { revenue: number; orders: number }>();

    // Pre-fill every day in the range with zeros so chart never renders blank
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { revenue: 0, orders: 0 });
    }

    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 10);
      const slot = byDay.get(key) ?? { revenue: 0, orders: 0 };
      slot.revenue = Number((slot.revenue + Number(p.amount)).toFixed(2));
      byDay.set(key, slot);
    }

    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const slot = byDay.get(key) ?? { revenue: 0, orders: 0 };
      slot.orders += 1;
      byDay.set(key, slot);
    }

    const series = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    console.log('[Analytics] getRevenueSeries — branchFilter:', branchFilter ?? 'all', '| payments found:', payments.length, '| orders found:', orders.length, '| series points:', series.length);

    res.json({ success: true, series, days, branchFilter: branchFilter ?? null });
  } catch (error) {
    console.error('[analytics getRevenueSeries]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

export const getReceiptByOrderId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId, userId } = req.user!;
    const orderId = req.params.orderId;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { menuItem: { select: { id: true, name: true, price: true } } },
        },
        branch: { select: { id: true, name: true, location: true, phone: true } },
        table: { select: { id: true, tableNumber: true } },
        waiter: { select: { id: true, firstName: true, lastName: true } },
        payment: true,
        basket: {
          include: { customer: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (role === 'CUSTOMER') {
      const isOwner = order.basket?.customer.id === userId;
      if (!isOwner) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
    } else if (role === 'WAITER_CASHIER' || role === 'BRANCH_MANAGER') {
      if (order.branchId !== userBranchId) {
        res.status(403).json({ message: 'Access denied: not your branch' });
        return;
      }
    }

    const receipt = {
      receiptNumber: `RCP-${order.id.slice(-8).toUpperCase()}`,
      branch: order.branch,
      table: order.table,
      waiter: order.waiter,
      customer: order.basket?.customer ?? null,
      items: order.items.map((i) => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        lineTotal: Number(i.unitPrice) * i.quantity,
      })),
      subtotal: Number(order.total),
      total: Number(order.total),
      payment: order.payment
        ? {
            method: order.payment.method,
            status: order.payment.status,
            amount: Number(order.payment.amount),
            paidAt: order.payment.createdAt,
          }
        : null,
      status: order.status,
      createdAt: order.createdAt,
    };

    res.json({ success: true, receipt });
  } catch (error) {
    console.error('[ANALYTICS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
