import { Response } from 'express';
import { TransactionType } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../types';

const BASKET_INCLUDE = {
  items: {
    include: {
      menuItem: {
        select: { id: true, name: true, description: true, price: true, imageUrl: true, isAvailable: true },
      },
    },
  },
  branch: { select: { id: true, name: true, location: true } },
} as const;

const computeTotal = (items: Array<{ subtotal: { toNumber?: () => number } | number }>): number =>
  items.reduce((sum, i) => {
    const sub = typeof i.subtotal === 'object' && i.subtotal.toNumber ? i.subtotal.toNumber() : Number(i.subtotal);
    return sum + sub;
  }, 0);

async function getActiveBasket(customerId: string) {
  return prisma.basket.findFirst({
    where: { customerId, status: 'ACTIVE' },
    include: BASKET_INCLUDE,
  });
}

export const createBasket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;
    const { branchId } = req.body as { branchId: string };

    const existing = await getActiveBasket(customerId);
    if (existing) {
      res.json({ success: true, basket: existing, message: 'Existing active basket returned' });
      return;
    }

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }

    const basket = await prisma.basket.create({
      data: { customerId, branchId },
      include: BASKET_INCLUDE,
    });

    res.status(201).json({ success: true, basket });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getBasket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;

    const basket = await getActiveBasket(customerId);
    if (!basket) {
      res.status(404).json({ message: 'No active basket found' });
      return;
    }

    const total = computeTotal(basket.items);
    res.json({ success: true, basket, total });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const addItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;
    const { menuItemId, quantity, branchId } = req.body as {
      menuItemId: string;
      quantity: number;
      branchId?: string;
    };

    let basket = await getActiveBasket(customerId);

    if (!basket) {
      if (!branchId) {
        res.status(400).json({ message: 'No active basket. Provide branchId to create one automatically' });
        return;
      }
      basket = await prisma.basket.create({
        data: { customerId, branchId },
        include: BASKET_INCLUDE,
      });
    }

    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem || !menuItem.isAvailable) {
      res.status(404).json({ message: 'Menu item not found or unavailable' });
      return;
    }

    // Block if an inventory record exists for this item at this branch and quantity is 0.
    // Items with no inventory record are not tracked and must not be blocked.
    const invRecord = await prisma.inventory.findFirst({
      where: { branchId: basket.branchId, name: { contains: menuItem.name, mode: 'insensitive' } },
    });
    if (invRecord && invRecord.quantity === 0) {
      res.status(400).json({ message: 'Cannot order item: Out of Stock' });
      return;
    }

    const unitPrice = Number(menuItem.price);
    const existing = basket.items.find((i) => i.menuItemId === menuItemId);

    let basketItem;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (existing.id) {
        basketItem = await prisma.basketItem.update({
          where: { id: existing.id },
          data: { quantity: newQty, subtotal: unitPrice * newQty },
          include: { menuItem: { select: { id: true, name: true, price: true } } },
        });
      }
    } else {
      basketItem = await prisma.basketItem.create({
        data: {
          basketId: basket.id,
          menuItemId,
          quantity,
          price: unitPrice,
          subtotal: unitPrice * quantity,
        },
        include: { menuItem: { select: { id: true, name: true, price: true } } },
      });
    }

    await prisma.basket.update({ where: { id: basket.id }, data: { updatedAt: new Date() } });

    const updatedBasket = await getActiveBasket(customerId);
    const total = computeTotal(updatedBasket!.items);

    res.status(201).json({ success: true, basketItem, basket: updatedBasket, total });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;
    const { quantity } = req.body as { quantity: number };

    const item = await prisma.basketItem.findUnique({
      where: { id: req.params.id },
      include: { basket: true },
    });

    if (!item) {
      res.status(404).json({ message: 'Basket item not found' });
      return;
    }

    if (item.basket.customerId !== customerId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (item.basket.status !== 'ACTIVE') {
      res.status(400).json({ message: 'Cannot modify a checked-out or abandoned basket' });
      return;
    }

    if (quantity <= 0) {
      await prisma.basketItem.delete({ where: { id: req.params.id } });
      await prisma.basket.update({ where: { id: item.basketId }, data: { updatedAt: new Date() } });
      const updatedBasket = await getActiveBasket(customerId);
      const total = updatedBasket ? computeTotal(updatedBasket.items) : 0;
      res.json({ success: true, message: 'Item removed', basket: updatedBasket, total });
      return;
    }

    const newSubtotal = Number(item.price) * quantity;
    const basketItem = await prisma.basketItem.update({
      where: { id: req.params.id },
      data: { quantity, subtotal: newSubtotal },
      include: { menuItem: { select: { id: true, name: true, price: true } } },
    });

    await prisma.basket.update({ where: { id: item.basketId }, data: { updatedAt: new Date() } });

    const updatedBasket = await getActiveBasket(customerId);
    const total = computeTotal(updatedBasket!.items);

    res.json({ success: true, basketItem, basket: updatedBasket, total });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const removeItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;

    const item = await prisma.basketItem.findUnique({
      where: { id: req.params.id },
      include: { basket: true },
    });

    if (!item) {
      res.status(404).json({ message: 'Basket item not found' });
      return;
    }

    if (item.basket.customerId !== customerId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (item.basket.status !== 'ACTIVE') {
      res.status(400).json({ message: 'Cannot modify a checked-out or abandoned basket' });
      return;
    }

    await prisma.basketItem.delete({ where: { id: req.params.id } });
    await prisma.basket.update({ where: { id: item.basketId }, data: { updatedAt: new Date() } });

    const updatedBasket = await getActiveBasket(customerId);
    const total = updatedBasket ? computeTotal(updatedBasket.items) : 0;

    res.json({ success: true, message: 'Item removed', basket: updatedBasket, total });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const clearBasket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;

    const basket = await prisma.basket.findFirst({
      where: { customerId, status: 'ACTIVE' },
    });

    if (!basket) {
      res.status(404).json({ message: 'No active basket found' });
      return;
    }

    await prisma.basketItem.deleteMany({ where: { basketId: basket.id } });
    await prisma.basket.update({ where: { id: basket.id }, data: { updatedAt: new Date() } });

    res.json({ success: true, message: 'Basket cleared' });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const abandonBasket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;

    const basket = await prisma.basket.findFirst({
      where: { customerId, status: 'ACTIVE' },
    });

    if (!basket) {
      res.status(404).json({ message: 'No active basket found' });
      return;
    }

    await prisma.basket.update({ where: { id: basket.id }, data: { status: 'ABANDONED' } });

    res.json({ success: true, message: 'Basket abandoned' });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('[ORDER] ORDER CREATE (basket checkout):', req.body);
    const customerId = req.user!.userId;
    const { role } = req.user!;
    if (role !== 'CUSTOMER' && role !== 'WAITER_CASHIER') {
      res.status(403).json({ message: 'Orders can only be placed by customers or waiters. If you need to place an order please log in with a customer account or ask a member of staff for assistance.' });
      return;
    }
    const { tableId, paymentMethod } = req.body as {
      tableId?: string;
      paymentMethod?: 'CASH' | 'CARD' | 'CONTACTLESS';
    };

    const basket = await prisma.basket.findFirst({
      where: { customerId, status: 'ACTIVE' },
      include: {
        items: {
          include: { menuItem: true },
        },
        branch: true,
      },
    });

    if (!basket) {
      res.status(404).json({ message: 'No active basket found' });
      return;
    }

    if (basket.items.length === 0) {
      res.status(400).json({ message: 'Cannot checkout an empty basket' });
      return;
    }

    const unavailable = basket.items.filter((i) => !i.menuItem.isAvailable);
    if (unavailable.length > 0) {
      res.status(400).json({
        message: 'Some items are no longer available',
        items: unavailable.map((i) => i.menuItem.name),
      });
      return;
    }

    const subtotal = computeTotal(basket.items);
    const total = Number((subtotal * 1.20).toFixed(2));

    // Out-of-stock check before creating any order.
    // Only blocks items that have an inventory record AND quantity === 0.
    // Items with no inventory record are not tracked and are allowed through.
    const outOfStockItems: string[] = [];
    for (const item of basket.items) {
      const inv = await prisma.inventory.findFirst({
        where: { branchId: basket.branchId, name: { contains: item.menuItem.name, mode: 'insensitive' } },
      });
      if (inv && inv.quantity === 0) {
        outOfStockItems.push(item.menuItem.name);
      }
    }
    if (outOfStockItems.length > 0) {
      res.status(400).json({
        message: 'Cannot place order: the following items are out of stock',
        outOfStockItems,
      });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          branchId: basket.branchId,
          tableId: tableId ?? null,
          waiterId: null,
          customerId,
          basketId: basket.id,
          total,
          status: 'PENDING',
          items: {
            create: basket.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: Number(item.price),
            })),
          },
        },
        include: {
          items: {
            include: { menuItem: { select: { id: true, name: true, price: true } } },
          },
          branch: { select: { id: true, name: true } },
        },
      });

      await tx.basket.update({
        where: { id: basket.id },
        data: { status: 'CHECKED_OUT' },
      });

      if (paymentMethod) {
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            amount: total,
            method: paymentMethod,
            status: 'PENDING',
          },
        });
      }

      return newOrder;
    });

    // Inventory is deducted when a chef marks the order COMPLETED — not at checkout.
    // deductInventory() removed per BUG 6 fix.

    console.log('[ORDER] Checkout order created:', order.id, 'customer:', customerId, 'total:', total);
    res.status(201).json({
      success: true,
      order,
      total,
      message: 'Order placed successfully',
    });
  } catch (error) {
    console.error('[ORDER] CHECKOUT ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error during checkout' });
  }
};

async function deductInventory(
  branchId: string,
  items: Array<{ menuItem: { name: string }; quantity: number }>
): Promise<void> {
  const inventoryItems = await prisma.inventory.findMany({
    where: { branchId },
  });

  for (const item of items) {
    const lowerName = item.menuItem.name.toLowerCase();

    const match = inventoryItems.find(
      (inv) =>
        lowerName.includes(inv.name.toLowerCase().split(' ')[0]) ||
        inv.name.toLowerCase().includes(lowerName.split(' ')[0])
    );

    if (match) {
      const newQty = Math.max(0, match.quantity - item.quantity);

      await prisma.inventory.update({
        where: { id: match.id },
        data: { quantity: newQty },
      });

      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: match.id,
          quantity: item.quantity,
          transactionType: TransactionType.OUT,
          notes: `Sold via basket checkout`,
        },
      });

      if (newQty <= match.minimumStock) {
        console.warn(
          `[LOW STOCK] Branch ${branchId}: ${match.name} is at ${newQty} (min: ${match.minimumStock})`
        );
      }
    }
  }
}

export const getLowStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    let branchFilter: string | undefined;
    if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      branchFilter = queryBranchId;
    } else {
      branchFilter = userBranchId ?? undefined;
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
      },
      include: { branch: { select: { id: true, name: true } } },
    });

    const alerts = inventory.filter((item) => item.quantity <= item.minimumStock);

    res.json({ success: true, alerts, count: alerts.length });
  } catch (error) {
    console.error('[BASKET] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
