import { TableStatus } from '@prisma/client';
import prisma from '../config/database';

async function clearCustomerReservations() {
  console.log('[CLEAR] Starting customer reservation cleanup...');

  // Find all reservations that are not yet cancelled/completed/no-show
  const active = await (prisma.reservation as any).findMany({
    where: { status: { notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW'] } },
    select: { id: true, tableId: true, status: true, customerId: true },
  });

  console.log('[CLEAR] Active/pending reservations to release:', active.length);

  // Release all tables that were RESERVED or OCCUPIED by these reservations
  const tableIds = [...new Set(active.map((r: any) => r.tableId).filter(Boolean))] as string[];
  if (tableIds.length > 0) {
    const released = await prisma.table.updateMany({
      where: { id: { in: tableIds } },
      data: { status: TableStatus.AVAILABLE },
    });
    console.log('[CLEAR] Tables released back to AVAILABLE:', released.count);
  }

  // Delete ALL reservations (clean slate)
  const deleted = await (prisma.reservation as any).deleteMany({});
  console.log('[CLEAR] Total reservations deleted:', deleted.count);

  // Confirm
  const remaining = await (prisma.reservation as any).count();
  const reservedTables = await prisma.table.count({ where: { status: TableStatus.RESERVED } });
  console.log('[CLEAR] Reservations remaining:', remaining);
  console.log('[CLEAR] Tables still RESERVED after cleanup:', reservedTables, '(should be 0)');

  await prisma.$disconnect();
}

clearCustomerReservations().catch((e) => {
  console.error('[CLEAR] ERROR:', e);
  process.exit(1);
});
