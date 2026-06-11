import 'dotenv/config';
import app from './app';
import prisma from './config/database';

// ── Env validation: fail fast with a clear message ───────────────────────────
const REQUIRED_ENV: string[] = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('\n❌  Missing required environment variables:');
  missing.forEach((k) => console.error(`    ${k}`));
  console.error('\n   ► Copy .env.example to .env and fill in DATABASE_URL and JWT_SECRET');
  console.error('     cp .env.example .env\n');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await prisma.$connect();
    console.log('✓ Connected to database');

    app.listen(PORT, () => {
      console.log(`\n🥩  Steakz UK API  →  http://localhost:${PORT}  [${process.env.NODE_ENV || 'development'}]`);
      console.log(`   Health check  →  http://localhost:${PORT}/api/health`);
      console.log(`   Auth test     →  POST http://localhost:${PORT}/api/auth/login\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    if (String(error).includes("Can't reach database")) {
      console.error('\n   ► Check that PostgreSQL is running and DATABASE_URL in .env is correct');
      console.error('     Run migrations: npx prisma migrate dev');
      console.error('     Run seed:       npx ts-node prisma/seed.ts\n');
    }
    await prisma.$disconnect();
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
