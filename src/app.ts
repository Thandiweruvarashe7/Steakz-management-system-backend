import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import branchRoutes from './routes/branches';
import menuRoutes from './routes/menu';
import reservationRoutes from './routes/reservations';
import tableRoutes from './routes/tables';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payments';
import inventoryRoutes from './routes/inventory';
import userRoutes from './routes/users';
import basketRoutes from './routes/basket';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import campaignRoutes from './routes/campaigns';
import reportRoutes from './routes/reports';
import payrollRoutes from './routes/payroll';
import receiptRoutes from './routes/receipts';
import newsletterRoutes from './routes/newsletter';
import auditRoutes from './routes/audit';

import { errorHandler, notFound } from './middleware/errorHandler';
import prisma from './config/database';

const app = express();

app.use(helmet());

// ── CORS: allow configured origins + common dev ports ────────────────────────
const devOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite
  'http://localhost:5174', // Vite (alternate port)
  'http://localhost:4200', // Angular
  'http://localhost:3001',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const getAllowedOrigins = (): string[] => {
  const fromEnv = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
    : [];
  return process.env.NODE_ENV === 'production'
    ? fromEnv.length > 0 ? fromEnv : ['http://localhost:3000']
    : [...new Set([...fromEnv, ...devOrigins])];
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || getAllowedOrigins().includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// General API limiter — raised significantly for real-time polling.
// Live Orders, Floor Plan, Dashboard etc poll every 15s across multiple users.
// 2000 requests per 15 minutes = ~133/minute, comfortably supporting
// 10+ simultaneous users with multiple polling pages open.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 2000,                   // was 100 → 1000 → now 2000
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again in a few minutes' },
  skip: (req) => {
    // Skip rate limiting for high-frequency polling routes and health checks
    const pollingPaths = [
      '/api/health',
      '/api/orders/live',
      '/api/orders/awaiting-payment',
      '/api/tables',
      '/api/notifications',
      '/api/analytics/branch-dashboard',
    ];
    return pollingPaths.some((p) => req.path.startsWith(p));
  },
});

// Auth limiter — keep strict to prevent brute force (20 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

// Apply general limiter to all non-auth routes — auth routes get authLimiter only (no double-limiting)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) return next();
  return limiter(req, res, next);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health check (includes DB status in development) ─────────────────────────
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'unknown';
  let userCount: number | null = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
    if (process.env.NODE_ENV !== 'production') {
      userCount = await prisma.user.count();
    }
  } catch {
    dbStatus = 'disconnected — run: npx prisma migrate dev && npx ts-node prisma/seed.ts';
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    ...(process.env.NODE_ENV !== 'production' && {
      debug: {
        userCount,
        jwtSecretSet: !!process.env.JWT_SECRET,
        databaseUrlSet: !!process.env.DATABASE_URL,
        corsOrigins: getAllowedOrigins(),
      },
    }),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/basket', basketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/audit-logs', auditRoutes);

console.log('[APP] Routes registered:');
(app as any)._router.stack
  .filter((r: any) => r.route)
  .forEach((r: any) => {
    const method = Object.keys(r.route.methods)[0].toUpperCase();
    console.log(`  ${method.padEnd(7)} ${r.route.path}`);
  });

app.use(notFound);
app.use(errorHandler);

export default app;
