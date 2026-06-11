import prisma from '../config/database';

async function fix() {
  console.log('[FIX] Starting inventory unit + category fix...');

  const bottleItems = [
    { kw: 'Soft Drink', cat: 'Soft Drinks' },
    { kw: 'Juice',      cat: 'Soft Drinks' },
    { kw: 'Lemonade',   cat: 'Soft Drinks' },
    { kw: 'Still Water',     cat: 'Water' },
    { kw: 'Sparkling Water', cat: 'Water' },
  ];

  const foodItems = [
    { kw: 'Steak',       cat: 'Main Meals'  },
    { kw: 'Chicken',     cat: 'Main Meals'  },
    { kw: 'Burger',      cat: 'Main Meals'  },
    { kw: 'Fillet',      cat: 'Main Meals'  },
    { kw: 'Chips',       cat: 'Side Dishes' },
    { kw: 'Bread',       cat: 'Side Dishes' },
    { kw: 'Salad',       cat: 'Side Dishes' },
    { kw: 'Onion Ring',  cat: 'Side Dishes' },
    { kw: 'Brownie',     cat: 'Desserts'    },
    { kw: 'Cheesecake',  cat: 'Desserts'    },
    { kw: 'Ice Cream',   cat: 'Desserts'    },
  ];

  for (const { kw, cat } of bottleItems) {
    const r = await (prisma.inventory as any).updateMany({
      where: { name: { contains: kw, mode: 'insensitive' } },
      data: { unit: 'bottle', category: cat },
    });
    if (r.count > 0) console.log(`[FIX] bottle: "${kw}" → ${r.count} items, category: ${cat}`);
  }

  for (const { kw, cat } of foodItems) {
    const r = await (prisma.inventory as any).updateMany({
      where: { name: { contains: kw, mode: 'insensitive' } },
      data: { unit: 'serving', category: cat },
    });
    if (r.count > 0) console.log(`[FIX] serving: "${kw}" → ${r.count} items, category: ${cat}`);
  }

  // Anything without a category yet → serving + Other
  const fallback = await (prisma.inventory as any).updateMany({
    where: { category: null },
    data: { unit: 'serving', category: 'Other' },
  });
  if (fallback.count > 0) console.log(`[FIX] fallback: ${fallback.count} items → serving, Other`);

  const sample = await (prisma.inventory as any).findMany({
    select: { name: true, unit: true, category: true },
    orderBy: { category: 'asc' },
    take: 20,
  });
  console.log('\n[FIX] Sample after update:');
  sample.forEach((i: any) =>
    console.log(' ', (i.category ?? 'null').padEnd(15), (i.unit ?? 'null').padEnd(8), i.name)
  );
}

fix()
  .then(() => { console.log('[FIX] Done'); process.exit(0); })
  .catch((e) => { console.error('[FIX] ERROR:', e); process.exit(1); });
