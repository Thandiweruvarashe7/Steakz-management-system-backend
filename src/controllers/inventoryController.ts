import { Response } from 'express';
import { TransactionType } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../types';

async function getEffectiveBranchId(userId: string, jwtBranchId: string | null | undefined): Promise<string | null> {
  if (jwtBranchId) return jwtBranchId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { branchId: true } });
  const resolved = user?.branchId ?? null;
  console.log('[BRANCH] getEffectiveBranchId — jwtBranchId null, DB resolved:', resolved, '| userId:', userId);
  return resolved;
}

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId, userId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    let branchFilter: string | undefined;

    if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      branchFilter = queryBranchId;
    } else {
      const effectiveBranchId = await getEffectiveBranchId(userId, userBranchId);
      branchFilter = effectiveBranchId ?? undefined;
      console.log('[INVENTORY] getInventory — effectiveBranchId:', effectiveBranchId, '| role:', role);
    }

    const inventory = await prisma.inventory.findMany({
      where: branchFilter ? { branchId: branchFilter } : {},
      include: {
        branch: { select: { id: true, name: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });

    const lowStock = inventory.filter((item) => item.quantity <= item.minimumStock);

    // Normalise every date value: undefined/null/"" → null, anything else → ISO string
    const safeDate = (val: unknown): string | null => {
      if (!val) return null;
      const d = new Date(val as string);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

    const safeInventory = inventory.map((item) => ({
      ...item,
      // These columns don't exist on the schema — always return null so the
      // frontend never receives undefined or an empty string and crashes
      expiryDate: null,
      lastRestocked: safeDate(item.transactions[0]?.createdAt ?? null),
      deliveryDate: null,
      transactions: item.transactions.map((t) => ({
        ...t,
        createdAt: safeDate(t.createdAt) ?? new Date(0).toISOString(),
      })),
    }));

    console.log('[INVENTORY] getInventory — returning', safeInventory.length, 'items for branch:', branchFilter ?? 'all');

    res.json({ success: true, inventory: safeInventory, lowStockCount: lowStock.length, lowStock });
  } catch (error) {
    console.error('[INVENTORY] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { branchId, name, quantity, minimumStock } = req.body as {
      branchId: string;
      name: string;
      quantity: number;
      minimumStock: number;
    };

    const { role, branchId: userBranchId } = req.user!;

    if (role === 'BRANCH_MANAGER' && branchId !== userBranchId) {
      res.status(403).json({ message: 'You can only manage inventory for your branch' });
      return;
    }

    const item = await prisma.inventory.create({
      data: {
        branchId,
        name,
        quantity,
        minimumStock,
        transactions: {
          create: {
            quantity,
            transactionType: TransactionType.IN,
            notes: 'Initial stock',
          },
        },
      },
      include: { branch: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('[INVENTORY] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const { quantity, minimumStock, name, transactionType, notes } = req.body as {
      quantity?: number;
      minimumStock?: number;
      name?: string;
      transactionType?: 'IN' | 'OUT' | 'ADJUSTMENT';
      notes?: string;
    };

    const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }

    if (role === 'BRANCH_MANAGER' && existing.branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    let newQuantity = existing.quantity;
    if (quantity !== undefined && transactionType) {
      if (transactionType === 'IN') newQuantity = existing.quantity + quantity;
      else if (transactionType === 'OUT') newQuantity = existing.quantity - quantity;
      else newQuantity = quantity;

      if (newQuantity < 0) {
        res.status(400).json({ message: 'Quantity cannot go below zero' });
        return;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (minimumStock !== undefined) updateData.minimumStock = minimumStock;
    if (quantity !== undefined && transactionType) updateData.quantity = newQuantity;

    await prisma.inventory.update({
      where: { id: req.params.id },
      data: updateData,
    });

    if (quantity !== undefined && transactionType) {
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: req.params.id,
          quantity,
          transactionType: transactionType as TransactionType,
          notes,
        },
      });
    }

    // Re-fetch with full relations so frontend gets the latest state immediately
    const item = await prisma.inventory.findUnique({
      where: { id: req.params.id },
      include: {
        branch: { select: { id: true, name: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    console.log('[INVENTORY] updateInventoryItem — id:', req.params.id, 'newQty:', item?.quantity);
    res.json({ success: true, item, inventoryItem: item });
  } catch (error) {
    console.error('[INVENTORY] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const deleteInventoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Inventory item not found' });
      return;
    }

    await prisma.inventoryTransaction.deleteMany({ where: { inventoryId: req.params.id } });
    await prisma.inventory.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Inventory item deleted' });
  } catch (error) {
    console.error('[INVENTORY] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
