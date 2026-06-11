import prisma from '../config/database';

async function fix() {
  const result = await prisma.branch.updateMany({
    where: { name: 'London Central' },
    data: { name: 'London' },
  });
  console.log('[FIX] Updated', result.count, 'branch(es) from "London Central" to "London"');

  const branches = await prisma.branch.findMany({ select: { id: true, name: true } });
  console.log('[BRANCHES] Current:', branches);
}

fix()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
