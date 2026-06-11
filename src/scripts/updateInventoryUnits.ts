import prisma from '../config/database';

async function updateUnits() {
  const foodKeywords = [
    'Ribeye', 'Sirloin', 'Fillet', 'T-Bone', 'Tomahawk',
    'Chicken', 'Burger', 'Chips', 'Bread', 'Salad',
    'Garlic', 'Onion', 'Mushroom', 'Sauce', 'Starter',
    'Steak', 'Patties',
  ];

  for (const keyword of foodKeywords) {
    const result = await (prisma.inventory as any).updateMany({
      where: { name: { contains: keyword, mode: 'insensitive' } },
      data: { unit: 'serving' },
    });
    if (result.count > 0) console.log(`[UNITS] "${keyword}" → serving (${result.count} items)`);
  }

  const drinkKeywords = ['Drink', 'Water', 'Juice', 'Wine', 'Beer', 'Coke', 'Pepsi', 'Lemonade', 'Coffee', 'Tea', 'Soft'];
  for (const keyword of drinkKeywords) {
    const result = await (prisma.inventory as any).updateMany({
      where: { name: { contains: keyword, mode: 'insensitive' } },
      data: { unit: 'bottle' },
    });
    if (result.count > 0) console.log(`[UNITS] "${keyword}" → bottle (${result.count} items)`);
  }

  // Any still on default 'serving' with old kg/box/unit suffixes in the name — keep as serving (already defaulted)
  const sample = await (prisma.inventory as any).findMany({
    select: { name: true, unit: true, quantity: true },
    orderBy: { name: 'asc' },
    take: 20,
  });
  console.log('\n[UNITS] Final state (sample):');
  sample.forEach((i: any) => console.log(` ${i.name}: ${i.quantity} ${i.unit}`));
}

updateUnits()
  .then(() => process.exit(0))
  .catch((e) => { console.error('[UNITS] ERROR:', e); process.exit(1); });
