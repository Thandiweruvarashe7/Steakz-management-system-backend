import bcrypt from 'bcryptjs';
import prisma from '../config/database';

function getExpectedPassword(role: string): string {
  const map: Record<string, string> = {
    ADMIN:              'Admin@123',
    HQ_MANAGER:         'HQ@123',
    BRANCH_MANAGER:     'Manager@123',
    WAITER_CASHIER:     'Waiter@123',
    CHEF:               'Chef@123',
    KITCHEN_ASSISTANT:  'Kitchen@123',
  };
  return map[role] ?? 'Staff@123';
}

async function resetPasswords() {
  const staffUsers = await (prisma.user as any).findMany({
    where: { role: { notIn: ['CUSTOMER'] } },
    select: { id: true, email: true, role: true, password: true, branch: { select: { name: true } } },
  });

  console.log('[RESET] Found', staffUsers.length, 'staff users');

  let updated = 0;
  let alreadyCorrect = 0;

  for (const user of staffUsers) {
    const expected = getExpectedPassword(user.role);
    const alreadyOk = await bcrypt.compare(expected, user.password);
    if (alreadyOk) {
      console.log('[RESET] Already correct:', user.email, '|', user.role);
      alreadyCorrect++;
      continue;
    }
    const hashed = await bcrypt.hash(expected, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    console.log('[RESET] Fixed:', user.email, '| role:', user.role, '| branch:', user.branch?.name ?? 'HQ');
    updated++;
  }

  console.log(`\n[RESET] Done — ${updated} updated, ${alreadyCorrect} already correct`);

  // Verify one user per role
  for (const role of ['WAITER_CASHIER', 'CHEF', 'BRANCH_MANAGER', 'KITCHEN_ASSISTANT']) {
    const u = await prisma.user.findFirst({ where: { role: role as any } });
    if (u) {
      const ok = await bcrypt.compare(getExpectedPassword(role), u.password);
      console.log(`[VERIFY] ${role}: ${ok ? 'PASS' : 'FAIL'} | ${u.email}`);
    }
  }

  await prisma.$disconnect();
}

resetPasswords().catch((e) => { console.error('[RESET] ERROR:', e); process.exit(1); });
