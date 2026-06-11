/**
 * One-time script: reset stale table statuses.
 * Any table not linked to an active order or upcoming reservation is set AVAILABLE.
 *
 * Run with:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 npx ts-node --transpile-only src/scripts/resetTableAvailability.ts
 */

import prisma from '../config/database';

async function main() {
  console.log('[RESET] Scanning tables...');

  const activeOrderTableIds = (
    await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] },
        tableId: { not: null },
      },
      select: { tableId: true },
    })
  )
    .map((o) => o.tableId)
    .filter(Boolean) as string[];

  const activeReservationTableIds = (
    await prisma.reservation.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        reservationDate: { gte: new Date() },
      },
      select: { tableId: true },
    })
  ).map((r) => r.tableId);

  const busyTableIds = [...new Set([...activeOrderTableIds, ...activeReservationTableIds])];

  console.log('[RESET] Busy tables (keeping status):', busyTableIds.length);

  const result = await prisma.table.updateMany({
    where: {
      id: { notIn: busyTableIds },
      status: { not: 'AVAILABLE' },
    },
    data: { status: 'AVAILABLE' },
  });

  console.log(`[RESET] Done — reset ${result.count} tables to AVAILABLE. ${busyTableIds.length} kept as busy.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[RESET] Error:', err);
  process.exit(1);
});
