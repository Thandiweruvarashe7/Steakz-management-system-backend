import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

// Receipts are stored as base64-encoded text in PostgreSQL.
// Upload: POST /api/receipts  { orderId?, branchId, filename, mimeType, data: "<base64>" }
// Download: GET /api/receipts/:id/download  — decodes base64 and streams file back

export const uploadReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role, branchId: userBranchId } = req.user!;
    const { orderId, branchId, filename, mimeType, data } = req.body as {
      orderId?: string;
      branchId: string;
      filename: string;
      mimeType: string;
      data: string; // base64-encoded file content
    };

    if (!branchId || !filename || !mimeType || !data) {
      res.status(400).json({ message: 'branchId, filename, mimeType, and data are required' });
      return;
    }

    // Branch-scoped roles can only upload to their own branch
    if (role !== 'ADMIN' && role !== 'HQ_MANAGER' && branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    // Validate base64
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    const cleanData = data.replace(/^data:[^;]+;base64,/, '');
    if (!base64Pattern.test(cleanData)) {
      res.status(400).json({ message: 'data must be valid base64' });
      return;
    }

    // Sanity check file size (max 10 MB as base64 ≈ 13.3 MB string)
    if (cleanData.length > 14_000_000) {
      res.status(413).json({ message: 'File too large. Maximum 10 MB.' });
      return;
    }

    const receipt = await (prisma.receipt as any).create({
      data: {
        orderId: orderId ?? null,
        branchId,
        uploadedById: userId,
        filename,
        mimeType,
        data: cleanData,
      },
      include: {
        branch: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Return metadata only, not the raw data
    const { data: _omit, ...meta } = receipt;
    res.status(201).json({ success: true, receipt: meta });
  } catch (error) {
    console.error('[RECEIPTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getReceipts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const queryOrderId = req.query.orderId as string | undefined;

    let branchFilter: string | undefined;
    if (role === 'ADMIN' || role === 'HQ_MANAGER') {
      branchFilter = queryBranchId;
    } else {
      branchFilter = userBranchId ?? undefined;
    }

    const receipts = await (prisma.receipt as any).findMany({
      where: {
        ...(branchFilter ? { branchId: branchFilter } : {}),
        ...(queryOrderId ? { orderId: queryOrderId } : {}),
      },
      select: {
        id: true,
        orderId: true,
        branchId: true,
        filename: true,
        mimeType: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, receipts });
  } catch (error) {
    console.error('[RECEIPTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const downloadReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;

    const receipt = await (prisma.receipt as any).findUnique({
      where: { id: req.params.id },
    });

    if (!receipt) {
      res.status(404).json({ message: 'Receipt not found' });
      return;
    }

    if (role !== 'ADMIN' && role !== 'HQ_MANAGER' && receipt.branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    const fileBuffer = Buffer.from(receipt.data, 'base64');

    res.setHeader('Content-Type', receipt.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${receipt.filename}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);
  } catch (error) {
    console.error('[RECEIPTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const deleteReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;

    const existing = await (prisma.receipt as any).findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Receipt not found' });
      return;
    }

    if (role !== 'ADMIN' && role !== 'HQ_MANAGER' && existing.branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    await (prisma.receipt as any).delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Receipt deleted' });
  } catch (error) {
    console.error('[RECEIPTS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
