import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, action, page = '1', limit = '50' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (action) {
      where.action = action;
    }

    if (date) {
      const day = new Date(date);
      if (!isNaN(day.getTime())) {
        const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
        const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
        where.createdAt = { gte: start, lte: end };
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
    ]);

    console.log('[AUDIT] getAuditLogs — total:', total, 'page:', pageNum, 'filter:', { date, action });

    res.json({
      success: true,
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('[AUDIT] getAuditLogs ERROR:', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};
