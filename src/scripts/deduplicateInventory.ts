/**
 * One-time cleanup: removes duplicate Inventory rows (same branchId + name).
 * Keeps the oldest record (lowest cuid, which is time-ordered) and deletes the rest
 * along with their InventoryTransaction children.
 *
 * Run with:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 npx ts-node --transpile-only src/scripts/deduplicateInventory.ts
 */
import prisma from '../config/database';

async function main() {
  console.log('[DEDUP] Starting inventory deduplication...\n');

  const allItems = await prisma.inventory.findMany({
    select: { id: true, branchId: true, name: true },
    orderBy: { id: 'asc' }, // cuid IDs are lexicographically time-ordered; asc = oldest first
  });

  // Group by branchId + name to find duplicates
  const groups = new Map<string, string[]>();
  for (const item of allItems) {
    const key = `${item.branchId}::${item.name}`;
    const ids = groups.get(key) ?? [];
    ids.push(item.id);
    groups.set(key, ids);
  }

  let deleted = 0;
  for (const [key, ids] of groups.entries()) {
    if (ids.length <= 1) continue;

    const [keep, ...remove] = ids;
    console.log(`[DEDUP] "${key}" — keeping ${keep}, deleting ${remove.length} duplicate(s): ${remove.join(', ')}`);

    for (const id of remove) {
      await prisma.inventoryTransaction.deleteMany({ where: { inventoryId: id } });
      await prisma.inventory.delete({ where: { id } });
      deleted++;
    }
  }

  if (deleted === 0) {
    console.log('[DEDUP] No duplicates found — inventory is clean.');
  } else {
    console.log(`\n[DEDUP] Done — removed ${deleted} duplicate inventory row(s).`);
  }
}

main()
  .catch((e) => { console.error('[DEDUP] ERROR:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
