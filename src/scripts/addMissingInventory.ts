/// <reference types="node" />
// Safe to run multiple times — skips items that already exist per branch.
// Run with: DATABASE_URL="..." NODE_TLS_REJECT_UNAUTHORIZED=0 npx ts-node src/scripts/addMissingInventory.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Items on the frontend menu that had no matching inventory entry.
const MISSING_ITEMS = [
  // Starters
  { name: 'Garlic Bread',          category: 'Starters',    unit: 'serving', quantity: 200, minimumStock: 30 },
  { name: 'Loaded Fries',          category: 'Starters',    unit: 'serving', quantity: 200, minimumStock: 30 },
  { name: 'Chicken Wings',         category: 'Starters',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Prawn Cocktail',        category: 'Starters',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Soup of the Day',       category: 'Starters',    unit: 'serving', quantity: 100, minimumStock: 15 },
  // Steaks
  { name: 'T-Bone Steak',          category: 'Main Meals',  unit: 'serving', quantity: 300, minimumStock: 30 },
  { name: 'Tomahawk Steak',        category: 'Main Meals',  unit: 'serving', quantity: 100, minimumStock: 10 },
  // Mains
  { name: 'Lamb Chops',            category: 'Main Meals',  unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Fish and Chips',        category: 'Main Meals',  unit: 'serving', quantity: 150, minimumStock: 20 },
  // Desserts
  { name: 'Chocolate Lava Cake',   category: 'Desserts',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Sticky Toffee Pudding', category: 'Desserts',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Apple Crumble',         category: 'Desserts',    unit: 'serving', quantity: 150, minimumStock: 20 },
  // Drinks
  { name: 'Coffee',                category: 'Hot Drinks',  unit: 'cup',     quantity: 500, minimumStock: 50 },
  { name: 'Tea',                   category: 'Hot Drinks',  unit: 'cup',     quantity: 500, minimumStock: 50 },
  { name: 'Mocktails',             category: 'Soft Drinks', unit: 'glass',   quantity: 200, minimumStock: 30 },
  { name: 'Milkshakes',            category: 'Soft Drinks', unit: 'glass',   quantity: 200, minimumStock: 30 },
];

async function main() {
  console.log('[addMissingInventory] Starting...');
  const branches = await prisma.branch.findMany({ select: { id: true, name: true } });
  console.log(`[addMissingInventory] Found ${branches.length} branches`);

  let created = 0;
  let skipped = 0;

  for (const branch of branches) {
    for (const item of MISSING_ITEMS) {
      const existing = await prisma.inventory.findFirst({
        where: { branchId: branch.id, name: item.name },
      });
      if (existing) {
        skipped++;
      } else {
        await prisma.inventory.create({ data: { branchId: branch.id, ...item } });
        console.log(`[addMissingInventory] Created "${item.name}" for ${branch.name}`);
        created++;
      }
    }
  }

  console.log(`\n[addMissingInventory] Done — ${created} items created, ${skipped} already existed`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
