import prisma from '../config/database';

async function fix() {
  const branches = await prisma.branch.findMany({ select: { id: true, name: true } });
  console.log('[FIX] Real branch IDs:', branches.map((b) => `${b.name}: ${b.id}`).join(' | '));

  const slugMap: Record<string, string> = {
    b1: 'london', b2: 'manchester', b3: 'leeds', b4: 'birmingham', b5: 'liverpool',
  };

  const staticIds = ['b1', 'b2', 'b3', 'b4', 'b5'];

  // Fix reservations with static branchIds
  const badReservations = await prisma.reservation.findMany({
    where: { branchId: { in: staticIds } },
    select: { id: true, branchId: true },
  });
  console.log('[FIX] Reservations with static branchIds:', badReservations.length);

  for (const res of badReservations) {
    const slug = slugMap[res.branchId];
    const branch = branches.find((b) => b.name.toLowerCase().includes(slug));
    if (branch) {
      await prisma.reservation.update({ where: { id: res.id }, data: { branchId: branch.id } });
      console.log('[FIX] Reservation', res.id, ':', res.branchId, '→', branch.id, '(', branch.name, ')');
    } else {
      console.warn('[FIX] No branch found for slug:', slug, '| reservationId:', res.id);
    }
  }

  // Fix orders with static branchIds
  const badOrders = await prisma.order.findMany({
    where: { branchId: { in: staticIds } },
    select: { id: true, branchId: true },
  });
  console.log('[FIX] Orders with static branchIds:', badOrders.length);

  for (const order of badOrders) {
    const slug = slugMap[order.branchId];
    const branch = branches.find((b) => b.name.toLowerCase().includes(slug));
    if (branch) {
      await prisma.order.update({ where: { id: order.id }, data: { branchId: branch.id } });
      console.log('[FIX] Order', order.id, ':', order.branchId, '→', branch.id, '(', branch.name, ')');
    }
  }

  // Fix users with static branchIds
  const badUsers = await prisma.user.findMany({
    where: { branchId: { in: staticIds } },
    select: { id: true, email: true, branchId: true },
  });
  console.log('[FIX] Users with static branchIds:', badUsers.length);

  for (const user of badUsers) {
    const slug = slugMap[user.branchId!];
    const branch = branches.find((b) => b.name.toLowerCase().includes(slug));
    if (branch) {
      await prisma.user.update({ where: { id: user.id }, data: { branchId: branch.id } });
      console.log('[FIX] User', user.email, ':', user.branchId, '→', branch.id, '(', branch.name, ')');
    }
  }

  console.log('[FIX] Done');
  await prisma.$disconnect();
}

fix().catch((e) => { console.error('[FIX] ERROR:', e); process.exit(1); });
