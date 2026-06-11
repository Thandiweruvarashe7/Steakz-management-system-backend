import prisma from '../config/database';

type NotificationInput = {
  userId: string;
  type?: 'ORDER_UPDATE' | 'RESERVATION_UPDATE' | 'PAYMENT_RECEIVED' | 'CAMPAIGN' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
};

export async function createNotification(input: NotificationInput): Promise<void> {
  try {
    await (prisma.notification as any).create({
      data: {
        userId: input.userId,
        type: input.type ?? 'SYSTEM',
        title: input.title,
        message: input.message,
        link: input.link ?? null,
      },
    });
  } catch {
    // Non-fatal: log and continue
    console.error('[Notification] Failed to create notification for user', input.userId);
  }
}

export async function createBulkNotifications(inputs: NotificationInput[]): Promise<void> {
  try {
    await (prisma.notification as any).createMany({
      data: inputs.map((n) => ({
        userId: n.userId,
        type: n.type ?? 'SYSTEM',
        title: n.title,
        message: n.message,
        link: n.link ?? null,
      })),
    });
  } catch {
    console.error('[Notification] Failed to create bulk notifications');
  }
}
