import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const unreadOnly = req.query.unread === 'true';

    const notifications = await (prisma.notification as any).findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await (prisma.notification as any).count({
      where: { userId, isRead: false },
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('[NOTIFICATIONS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const existing = await (prisma.notification as any).findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const notification = await (prisma.notification as any).update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, notification });
  } catch (error) {
    console.error('[NOTIFICATIONS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;

    const result = await (prisma.notification as any).updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, updatedCount: result.count });
  } catch (error) {
    console.error('[NOTIFICATIONS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const { id } = req.params;

    const existing = await (prisma.notification as any).findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (existing.userId !== userId && role !== 'ADMIN') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    await (prisma.notification as any).delete({ where: { id } });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('[NOTIFICATIONS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const createAdminNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId: targetUserId, type, title, message, link } = req.body as {
      userId: string;
      type?: string;
      title: string;
      message: string;
      link?: string;
    };

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) {
      res.status(404).json({ message: 'Target user not found' });
      return;
    }

    const notification = await (prisma.notification as any).create({
      data: {
        userId: targetUserId,
        type: type ?? 'SYSTEM',
        title,
        message,
        link: link ?? null,
      },
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error('[NOTIFICATIONS] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
