/**
 * One-time script: assigns correct branchId to employees whose branchId is null.
 * Matching strategy: email address contains the branch name substring (case-insensitive).
 *
 * Run with:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 npx ts-node --transpile-only src/scripts/fixBranchAssignments.ts
 */

import prisma from '../config/database';

const STAFF_ROLES = ['WAITER_CASHIER', 'CHEF', 'KITCHEN_ASSISTANT', 'BRANCH_MANAGER'];

async function main() {
  const branches = await prisma.branch.findMany({ select: { id: true, name: true } });
  console.log('[FIX] Branches in DB:');
  branches.forEach((b) => console.log(`  ${b.name} → ${b.id}`));

  const unassigned = await prisma.user.findMany({
    where: {
      role: { in: STAFF_ROLES as any },
      branchId: null,
    },
    select: { id: true, email: true, role: true },
  });

  if (unassigned.length === 0) {
    console.log('[FIX] No unassigned staff found — nothing to do.');
    await prisma.$disconnect();
    return;
  }

  console.log(`[FIX] Found ${unassigned.length} staff with null branchId:`);
  unassigned.forEach((u) => console.log(`  ${u.email} (${u.role})`));

  let fixed = 0;
  let skipped = 0;

  for (const staffUser of unassigned) {
    const emailLower = staffUser.email.toLowerCase();

    // Match on any single word from the branch name (handles "London Central" → "london")
    const match = branches.find((b) => {
      const branchWords = b.name.toLowerCase().split(/\s+/);
      return branchWords.some((word) => word.length > 3 && emailLower.includes(word));
    });

    if (!match) {
      console.warn(`[FIX] No branch match for email: ${staffUser.email} — skipping`);
      skipped++;
      continue;
    }

    await prisma.user.update({
      where: { id: staffUser.id },
      data: { branchId: match.id },
    });

    console.log(`[FIX] Assigned "${staffUser.email}" → ${match.name} (${match.id})`);
    fixed++;
  }

  console.log(`\n[FIX] Done. Fixed: ${fixed}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[FIX] Error:', err);
  process.exit(1);
});
