import prisma from '../config/database';

export async function logAudit(
  action: string,
  resource: string,
  userId?: string,
  details?: string,
  resourceId?: string,
  userName?: string,
  ipAddress?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource,
        userId: userId ?? null,
        userName: userName ?? 'System',
        details: details ?? null,
        resourceId: resourceId ?? null,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (e) {
    console.error('[AUDIT] Log failed:', e);
  }
}
