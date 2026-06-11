import { Response } from 'express';
import { OrderStatus, TableStatus } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { deductInventoryForOrder } from '../utils/inventoryDeduction';
import { createNotification } from '../utils/notificationHelper';
import { logAudit } from '../utils/auditLogger';

async function getEffectiveBranchId(userId: string, jwtBranchId: string | null | undefined): Promise<string | null> {
  if (jwtBranchId) return jwtBranchId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { branchId: true } });
  const resolved = user?.branchId ?? null;
  console.log('[BRANCH] getEffectiveBranchId — jwtBranchId was null, DB resolved:', resolved, '| userId:', userId);
  return resolved;
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('[ORDER] ORDER CREATE:', req.body);
    const { tableId, items } = req.body as {
      tableId: string;
      items: Array<{ menuItemId: string; quantity: number }>;
    };

    const waiterId = req.user!.userId;
    const { role } = req.user!;
    if (role !== 'CUSTOMER' && role !== 'WAITER_CASHIER') {
      res.status(403).json({ message: 'Orders can only be placed by customers or waiters. If you need to place an order please log in with a customer account or ask a member of staff for assistance.' });
      return;
    }
    const branchId = req.user!.branchId;

    if (!branchId) {
      res.status(400).json({ message: 'Waiter has no assigned branch' });
      return;
    }

    const table = await prisma.table.findFirst({ where: { id: tableId, branchId } });
    if (!table) {
      res.status(404).json({ message: 'Table not found in your branch' });
      return;
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      res.status(400).json({ message: 'One or more menu items are invalid or unavailable' });
      return;
    }

    const priceMap = new Map(menuItems.map((m) => [m.id, Number(m.price)]));
    const subtotal = items.reduce(
      (sum, item) => sum + (priceMap.get(item.menuItemId) ?? 0) * item.quantity,
      0
    );
    const total = Number((subtotal * 1.20).toFixed(2));

    const order = await prisma.order.create({
      data: {
        branchId,
        tableId,
        waiterId,
        total,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: priceMap.get(item.menuItemId) ?? 0,
          })),
        },
      },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        table: { select: { id: true, tableNumber: true } },
        waiter: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (tableId) {
      await prisma.table.update({ where: { id: tableId }, data: { status: TableStatus.OCCUPIED } });
    }

    console.log('[ORDER] Created order:', order.id, 'branch:', branchId, 'total:', total);

    // Notify the chef at this branch of the new order
    const chef = await prisma.user.findFirst({
      where: { branchId, role: 'CHEF' },
      select: { id: true },
    });
    if (chef) {
      createNotification({
        userId: chef.id,
        type: 'ORDER_UPDATE',
        title: 'New Order Received',
        message: `New order #${order.id.slice(-6).toUpperCase()} — ${items.length} item(s) to prepare (table ${order.table?.tableNumber ?? 'N/A'})`,
      }).catch(console.error);
      console.log('[ORDER] Chef notified:', chef.id);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('[ORDER] CREATE ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createCustomerOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('[ORDER] CUSTOMER ORDER CREATE:', req.body);
    const customerId = req.user!.userId;
    const { branchId, tableId, items } = req.body as {
      branchId: string;
      tableId?: string;
      items: Array<{ menuItemId: string; quantity: number }>;
    };

    if (!branchId) {
      res.status(400).json({ success: false, message: 'Branch ID is required' });
      return;
    }
    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: 'At least one item is required' });
      return;
    }

    // Resolve branch — frontend may send static 'b1'–'b5' or a real UUID
    let resolvedBranchId = branchId;
    let branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      const slugMap: Record<string, string> = { b1: 'london', b2: 'manchester', b3: 'leeds', b4: 'birmingham', b5: 'liverpool' };
      const slug = slugMap[branchId];
      if (slug) branch = await prisma.branch.findFirst({ where: { name: { contains: slug, mode: 'insensitive' } } });
      if (branch) resolvedBranchId = branch.id;
    }
    if (!branch) {
      res.status(400).json({ success: false, message: `Branch not found: ${branchId}` });
      return;
    }
    console.log('[ORDER] Resolved branch:', branchId, '→', resolvedBranchId, '(', branch.name, ')');

    const menuItemIds = items.map((i) => i.menuItemId);
    console.log('[ORDER] Looking up menu items by ID:', menuItemIds);

    // First try exact ID match (works for real cuid() IDs from DB)
    let resolvedMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isAvailable: true },
      include: { category: { select: { name: true } } },
    });

    // Fallback: frontend sent static IDs like 's1','st1','m1','d1','dr1' from STATIC_MENU_ITEMS
    if (resolvedMenuItems.length !== menuItemIds.length) {
      console.log('[ORDER] ID lookup incomplete — resolving static IDs via category matching:', menuItemIds);

      const allItems = await prisma.menuItem.findMany({
        where: { isAvailable: true },
        include: { category: { select: { name: true } } },
      });

      // Map static ID prefix → DB category name
      const categoryMap: Record<string, string> = {
        dr: 'drinks',
        st: 'steaks',
        si: 'sides',
        s:  'starters',
        m:  'burgers',
        d:  'desserts',
      };

      const resolvedArr: typeof allItems = [];

      for (const item of items) {
        // Check if it's already a real DB ID
        const byId = allItems.find((m) => m.id === item.menuItemId);
        if (byId) { resolvedArr.push(byId); continue; }

        // Extract prefix (letters only) and 0-based index from static ID
        // Order matters: check longer prefixes first (dr, st, si before s, d)
        let prefix = '';
        for (const key of ['dr', 'st', 'si', 's', 'm', 'd']) {
          if (item.menuItemId.startsWith(key)) { prefix = key; break; }
        }
        const idx = parseInt(item.menuItemId.replace(/[^0-9]/g, ''), 10) - 1;
        const targetCategory = categoryMap[prefix];

        if (targetCategory) {
          const categoryItems = allItems.filter(
            (m) => m.category?.name?.toLowerCase() === targetCategory
          );
          const picked = categoryItems[idx >= 0 ? idx : 0] ?? categoryItems[0];
          if (picked) {
            resolvedArr.push(picked);
            console.log('[ORDER] Resolved static ID', item.menuItemId, '→', picked.name, '(', picked.id, ')');
          }
        }
      }

      if (resolvedArr.length > 0) {
        resolvedMenuItems = resolvedArr;
        console.log('[ORDER] Resolved', resolvedArr.length, 'item(s) via category fallback');
      }
    }

    if (resolvedMenuItems.length === 0) {
      console.error('[ORDER] Could not resolve any menu items for IDs:', menuItemIds);
      res.status(400).json({
        success: false,
        message: 'Menu items not found. Please refresh the menu and try again.',
      });
      return;
    }

    // Build price map: original requested ID → { real DB id, price }
    const priceMap = new Map<string, { price: number; id: string }>();
    resolvedMenuItems.forEach((m, index) => {
      const originalId = menuItemIds[index] ?? m.id;
      priceMap.set(originalId, { price: Number(m.price), id: m.id });
      priceMap.set(m.id, { price: Number(m.price), id: m.id });
    });

    const subtotal = items.reduce(
      (sum, item) => sum + (priceMap.get(item.menuItemId)?.price ?? 0) * item.quantity,
      0
    );
    const total = Number((subtotal * 1.20).toFixed(2));

    // Use real DB IDs in order items
    const orderItemsData = items.map((item) => ({
      menuItemId: priceMap.get(item.menuItemId)?.id ?? item.menuItemId,
      quantity: item.quantity,
      unitPrice: priceMap.get(item.menuItemId)?.price ?? 0,
    }));

    const order = await prisma.order.create({
      data: {
        branchId: resolvedBranchId,
        tableId: tableId ?? null,
        waiterId: null,
        customerId,
        total,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        table: { select: { id: true, tableNumber: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    console.log('[ORDER] Customer order created:', order.id, 'branch:', resolvedBranchId, 'customer:', customerId, 'total:', total);

    // Deduct inventory for each ordered item at this branch (non-fatal)
    try {
      console.log('[INVENTORY] Deducting for order:', order.id, '| branch:', resolvedBranchId);
      console.log('[INVENTORY] Items to deduct:', orderItemsData.map(i => ({ id: i.menuItemId, qty: i.quantity })));
      for (const orderItem of orderItemsData) {
        const menuItemRecord = await prisma.menuItem.findUnique({
          where: { id: orderItem.menuItemId },
          select: { name: true },
        });
        const firstName = menuItemRecord?.name?.split(' ')[0] ?? '';

        const inventoryItem = await (prisma.inventory as any).findFirst({
          where: {
            branchId: resolvedBranchId,
            name: { contains: firstName, mode: 'insensitive' },
          },
        });

        if (inventoryItem) {
          const newQty = Math.max(0, inventoryItem.quantity - orderItem.quantity);
          await (prisma.inventory as any).update({
            where: { id: inventoryItem.id },
            data: { quantity: newQty },
          });
          console.log('[INVENTORY] Deducted', orderItem.quantity, 'from', inventoryItem.name, 'at branch', resolvedBranchId, '| new qty:', newQty);

          if (newQty <= (inventoryItem.minimumStock ?? 50)) {
            const mgr = await prisma.user.findFirst({
              where: { branchId: resolvedBranchId, role: 'BRANCH_MANAGER' },
              select: { id: true },
            });
            if (mgr) {
              await (prisma.notification as any).create({
                data: {
                  userId: mgr.id,
                  type: 'SYSTEM',
                  title: 'Low Stock Alert',
                  message: `${inventoryItem.name} is running low — only ${newQty} ${inventoryItem.unit ?? 'servings'} remaining`,
                  isRead: false,
                },
              });
              console.log('[INVENTORY] Low stock alert sent to manager for:', inventoryItem.name);
            }
          }
        }
      }
    } catch (invErr) {
      console.error('[INVENTORY] Deduction error (non-fatal):', invErr);
    }

    // Notify branch manager of new customer order
    const branchManager = await prisma.user.findFirst({
      where: { branchId: resolvedBranchId, role: 'BRANCH_MANAGER' },
      select: { id: true },
    });
    if (branchManager) {
      createNotification({
        userId: branchManager.id,
        type: 'ORDER_UPDATE',
        title: 'New Customer Order',
        message: `New online order placed by customer. Order #${order.id.slice(-6).toUpperCase()} — £${total.toFixed(2)}`,
      }).catch(console.error);
      console.log('[ORDER] Branch manager notified:', branchManager.id);
    }

    // Notify chef of new order to prepare
    const chef = await prisma.user.findFirst({
      where: { branchId: resolvedBranchId, role: 'CHEF' },
      select: { id: true },
    });
    if (chef) {
      createNotification({
        userId: chef.id,
        type: 'ORDER_UPDATE',
        title: 'New Order Received',
        message: `New customer order #${order.id.slice(-6).toUpperCase()} — ${items.length} item(s) to prepare`,
      }).catch(console.error);
      console.log('[ORDER] Chef notified:', chef.id);
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('[ORDER] CUSTOMER ORDER CREATE ERROR:', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, userId, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    console.log('[BRANCH ISOLATION] Role:', role, '| UserBranch:', userBranchId, '| Query:', req.query);
    // Optional comma-separated status filter, e.g. ?status=SERVED,COMPLETED,PAID
    const statusFilter = req.query.status as string | undefined;

    let where: Record<string, unknown> = {};

    if (role === 'CUSTOMER') {
      where = { customerId: userId };
      console.log('[ORDER] getOrders CUSTOMER — userId:', userId);
    } else if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      if (queryBranchId) where = { branchId: queryBranchId };
    } else {
      const effectiveBranchId = await getEffectiveBranchId(userId, userBranchId);
      console.log('[ORDER] getOrders — effectiveBranchId:', effectiveBranchId, '| role:', role);
      where = { branchId: effectiveBranchId };
    }

    // Apply optional status filter for all roles (e.g. receipt page uses SERVED,COMPLETED,PAID)
    if (statusFilter) {
      const statuses = statusFilter.split(',').map((s) => s.trim()) as OrderStatus[];
      where = { ...where, status: { in: statuses } };
      console.log('[ORDER] getOrders — status filter:', statuses, 'role:', role);
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        table: { select: { id: true, tableNumber: true } },
        waiter: { select: { id: true, firstName: true, lastName: true } },
        // Include location + phone so receipt can show full branch address
        branch: { select: { id: true, name: true, location: true, phone: true } },
        payment: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[ORDER] getOrders — returning', orders.length, 'orders for role:', role);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('[ORDER] getOrders ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getLiveOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId, userId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    let branchFilter: string | undefined;

    if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      branchFilter = queryBranchId;
    } else {
      const effectiveBranchId = await getEffectiveBranchId(userId, userBranchId);
      branchFilter = effectiveBranchId ?? undefined;
      console.log('[LIVE ORDERS] effectiveBranchId:', effectiveBranchId, '| role:', role);
    }

    const orders = await prisma.order.findMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        status: { in: ['PENDING', 'PREPARING', 'READY', 'ON_TABLE'] as OrderStatus[] },
      },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        table: { select: { id: true, tableNumber: true } },
        waiter: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log('[LIVE ORDERS] branchFilter:', branchFilter ?? 'ALL', '| orders found:', orders.length);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('[LIVE ORDERS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const { status } = req.body as { status: string };
    console.log('[ORDER updateOrderStatus] START — orderId:', req.params.id,
      '| status:', status,
      '| role:', role,
      '| userBranchId:', userBranchId,
      '| userId:', req.user!.userId);

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (role !== 'ADMIN' && role !== 'HQ_MANAGER') {
      const effectiveBranchId = await getEffectiveBranchId(req.user!.userId, userBranchId);
      console.log('[ORDER] updateOrderStatus — effectiveBranchId:', effectiveBranchId, '| orderBranchId:', existing.branchId);
      if (effectiveBranchId && existing.branchId !== effectiveBranchId) {
        res.status(403).json({ message: 'Access denied: not your branch' });
        return;
      }
    }

    const validStatuses: OrderStatus[] = [
      'PENDING', 'PREPARING', 'READY', 'ON_TABLE', 'SERVED', 'COMPLETED', 'CANCELLED', 'DELIVERED', 'PAID',
    ];
    if (!validStatuses.includes(status as OrderStatus)) {
      res.status(400).json({ message: `Invalid order status. Valid values: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: status as OrderStatus },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        table: { select: { id: true, tableNumber: true } },
        waiter: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (existing.tableId) {
      let newTableStatus: TableStatus | null = null;
      if (status === 'ON_TABLE') {
        newTableStatus = TableStatus.OCCUPIED;
      } else if (status === 'SERVED') {
        newTableStatus = TableStatus.PAYMENT_PENDING;
      } else if (status === 'PAID' || status === 'COMPLETED' || status === 'CANCELLED') {
        newTableStatus = TableStatus.AVAILABLE;
      }
      if (newTableStatus) {
        await prisma.table.update({
          where: { id: existing.tableId },
          data: { status: newTableStatus },
        });
        console.log('[ORDER] Table', existing.tableId, '→', newTableStatus, '(order', status, ')');
      }
    }

    // Deduct inventory only when a chef marks the order COMPLETED
    if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      console.log('[ORDER] Status → COMPLETED: triggering inventory deduction for order', req.params.id);
      deductInventoryForOrder(req.params.id).catch((err) =>
        console.error('[ORDER] Inventory deduction failed:', err)
      );

      // Notify branch manager of completed order
      const manager = await prisma.user.findFirst({
        where: { branchId: existing.branchId, role: 'BRANCH_MANAGER' },
        select: { id: true },
      });
      if (manager) {
        createNotification({
          userId: manager.id,
          type: 'ORDER_UPDATE',
          title: 'Order Completed',
          message: `Order #${req.params.id.slice(-6).toUpperCase()} has been completed. Total: £${Number(order.total).toFixed(2)}`,
        }).catch(console.error);
        console.log('[ORDER] Branch manager notified — order COMPLETED:', req.params.id);
      }

      logAudit('ORDER_STATUS_UPDATED', 'Order', req.user!.userId, `Status → COMPLETED for order ${req.params.id}`, req.params.id).catch(() => {});
    }

    // Notify waiters when order is READY to serve
    if (status === 'READY' && existing.status !== 'READY') {
      const waiters = await prisma.user.findMany({
        where: { branchId: existing.branchId, role: 'WAITER_CASHIER' },
        select: { id: true },
      });
      for (const w of waiters) {
        createNotification({
          userId: w.id,
          type: 'ORDER_UPDATE',
          title: 'Order Ready to Serve',
          message: `Order #${order.id.slice(-6).toUpperCase()} is ready — Table ${order.table?.tableNumber ?? 'N/A'}`,
        }).catch(console.error);
      }
      console.log('[ORDER] Notified', waiters.length, 'waiter(s) — order READY:', req.params.id);
    }

    // Notify customer when their order is READY
    if (status === 'READY' && existing.status !== 'READY' && order.customerId) {
      createNotification({
        userId: order.customerId,
        type: 'ORDER_UPDATE',
        title: 'Your order is ready!',
        message: `Order #${order.id.slice(-6).toUpperCase()} is ready at ${order.branch.name}. Please collect or wait for your waiter.`,
      }).catch(console.error);
      console.log('[ORDER] Customer notified order READY — customerId:', order.customerId);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('[ORDER updateOrderStatus] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getAwaitingPaymentOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId, userId } = req.user!;

    const effectiveBranchId = (role !== 'ADMIN' && role !== 'HQ_MANAGER')
      ? await getEffectiveBranchId(userId, userBranchId)
      : null;

    const branchFilter = (role === 'ADMIN' || role === 'HQ_MANAGER')
      ? (req.query.branchId as string | undefined)
      : effectiveBranchId ?? undefined;
    console.log('[PAYMENTS] getAwaitingPaymentOrders — role:', role, '| branchFilter:', branchFilter);

    const orders = await prisma.order.findMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        status: { in: ['SERVED', 'ON_TABLE'] as OrderStatus[] },
      },
      include: {
        items: { include: { menuItem: { select: { id: true, name: true, price: true } } } },
        table: { select: { id: true, tableNumber: true } },
        branch: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log('[PAYMENTS] Awaiting payment:', orders.length, '| branch:', branchFilter ?? 'ALL');
    res.json({ success: true, orders });
  } catch (error) {
    console.error('[PAYMENTS] Error:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
