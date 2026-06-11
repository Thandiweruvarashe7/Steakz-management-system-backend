import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getAllBranches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({
      select: { id: true, name: true, location: true, phone: true, email: true },
    });
    res.json({ success: true, branches });
  } catch (error) {
    console.error('[BRANCH] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getBranchById = async (req: Request, res: Response): Promise<void> => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: req.params.id },
      include: {
        tables: { select: { id: true, tableNumber: true, capacity: true, status: true } },
      },
    });

    if (!branch) {
      res.status(404).json({ message: 'Branch not found' });
      return;
    }

    res.json({ success: true, branch });
  } catch (error) {
    console.error('[BRANCH] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createBranch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location, phone, email } = req.body as {
      name: string;
      location: string;
      phone: string;
      email: string;
    };

    const branch = await prisma.branch.create({ data: { name, location, phone, email } });
    res.status(201).json({ success: true, branch });
  } catch (error) {
    console.error('[BRANCH] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateBranch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await prisma.branch.update({
      where: { id: req.params.id },
      data: req.body as { name?: string; location?: string; phone?: string; email?: string },
    });
    res.json({ success: true, branch });
  } catch (error) {
    console.error('[BRANCH] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const deleteBranch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.branch.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Branch deleted' });
  } catch (error) {
    console.error('[BRANCH] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
