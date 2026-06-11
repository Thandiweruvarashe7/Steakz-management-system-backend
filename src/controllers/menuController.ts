import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getAllMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.query.branchId as string | undefined;

    const categories = await prisma.menuCategory.findMany({
      include: {
        items: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!branchId) {
      res.json({ success: true, categories });
      return;
    }

    // When a branchId is provided, attach inventoryStatus to each item.
    // Items with no inventory record default to IN_STOCK (not tracked).
    const inventoryItems = await prisma.inventory.findMany({
      where: { branchId },
      select: { name: true, quantity: true, minimumStock: true },
    });

    const categoriesWithStatus = categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        const inv = inventoryItems.find(
          (i) =>
            item.name.toLowerCase().includes(i.name.toLowerCase()) ||
            i.name.toLowerCase().includes(item.name.toLowerCase())
        );
        let inventoryStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
        if (inv) {
          if (inv.quantity === 0) inventoryStatus = 'OUT_OF_STOCK';
          else if (inv.quantity <= inv.minimumStock) inventoryStatus = 'LOW_STOCK';
        }
        return { ...item, inventoryStatus };
      }),
    }));

    res.json({ success: true, categories: categoriesWithStatus });
  } catch (error) {
    console.error('[MENU] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: req.params.id },
      include: { category: { select: { id: true, name: true } } },
    });

    if (!item) {
      res.status(404).json({ message: 'Menu item not found' });
      return;
    }

    res.json({ success: true, item });
  } catch (error) {
    console.error('[MENU] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId, name, description, price, imageUrl } = req.body as {
      categoryId: string;
      name: string;
      description?: string;
      price: number;
      imageUrl?: string;
    };

    const item = await prisma.menuItem.create({
      data: { categoryId, name, description, price, imageUrl },
      include: { category: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('[MENU] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: req.body as {
        name?: string;
        description?: string;
        price?: number;
        imageUrl?: string;
        isAvailable?: boolean;
        categoryId?: string;
      },
      include: { category: { select: { id: true, name: true } } },
    });

    res.json({ success: true, item });
  } catch (error) {
    console.error('[MENU] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const deleteMenuItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('[MENU] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.menuCategory.findMany();
    res.json({ success: true, categories });
  } catch (error) {
    console.error('[MENU] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await prisma.menuCategory.create({
      data: { name: (req.body as { name: string }).name },
    });
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('[MENU] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
