import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { AuthRequest, JwtPayload } from '../types';
import { sendWelcomeEmail } from '../services/emailService';

const generateAccessToken = (payload: JwtPayload): string => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  } as jwt.SignOptions);
};

const generateRefreshToken = (): string => crypto.randomBytes(64).toString('hex');

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};

const accessTokenCookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 8 * 60 * 60 * 1000,  // 8 hours — matches JWT expiry
  path: '/',
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[AUTH register] REGISTER ATTEMPT:', { ...req.body, password: '[redacted]' });

    const { firstName, lastName, email, password } = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    };

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
    });

    // Generate access token so the frontend can log the user in immediately
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      branchId: null,
    };
    const accessToken = generateAccessToken(payload);

    // Issue a refresh token as well
    const refreshTokenValue = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    await prisma.refreshToken.create({
      data: { token: refreshTokenValue, userId: user.id, expiresAt },
    });
    res.cookie('refreshToken', refreshTokenValue, cookieOpts);
    res.cookie('accessToken', accessToken, accessTokenCookieOpts);

    sendWelcomeEmail(email, firstName).catch(console.error);

    console.log('[AUTH register] SUCCESS — new CUSTOMER created:', user.id);

    res.status(201).json({
      success: true,
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('[AUTH register] REGISTER ERROR:', (error as any)?.message, error);
    if (String(error).includes("Can't reach database") || String(error).includes('connect')) {
      res.status(503).json({ success: false, message: 'Database unavailable — check DATABASE_URL in .env' });
      return;
    }
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Accept both selectedBranch (name) and branchId (UUID) from the frontend
    const { email, password, selectedBranch } = req.body as {
      email: string;
      password: string;
      selectedBranch?: string;
    };

    if (!process.env.JWT_SECRET) {
      console.error('[AUTH login] CRITICAL: JWT_SECRET not set — copy .env.example to .env');
      res.status(500).json({ success: false, message: 'Server misconfiguration: JWT_SECRET missing. Contact admin.' });
      return;
    }

    let user;
    try {
      // STEP 1 — always include the branch relation so we have the real branch name
      user = await prisma.user.findUnique({
        where: { email },
        include: { branch: { select: { id: true, name: true, location: true } } },
      });
    } catch (dbErr) {
      console.error('[AUTH login] Database error:', dbErr);
      res.status(503).json({ success: false, message: 'Database unavailable — check DATABASE_URL and run migrations' });
      return;
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'No account found with that email address' });
      return;
    }

    // STEP 2 — log exactly what the DB has for this user
    console.log('LOGIN USER FOUND:', {
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branchName: (user as any).branch?.name ?? 'NO BRANCH IN DB',
    });
    console.log('[LOGIN DEBUG] Password hash exists:', !!user.password, '| hash length:', user.password?.length);
    console.log('[LOGIN DEBUG] Attempted password length:', password?.length);

    // STEP 3 — branch validation using branch NAME (not UUID)
    // Only runs when the frontend includes a selectedBranch in the login form
    if (selectedBranch && user.role !== 'ADMIN' && user.role !== 'HQ_MANAGER') {
      const userBranch = (user as any).branch?.name?.toLowerCase().trim();
      const rawSelected = selectedBranch.toLowerCase().trim();

      // Resolve static branch IDs ('b1'–'b5') sent by the frontend to city names
      const slugMap: Record<string, string> = {
        b1: 'london', b2: 'manchester', b3: 'leeds', b4: 'birmingham', b5: 'liverpool',
      };
      const selected = slugMap[rawSelected] ?? rawSelected;

      console.log('BRANCH CHECK:', { email: user.email, userBranch, rawSelected, resolved: selected });

      if (!userBranch) {
        console.warn('BRANCH CHECK RESULT: NO BRANCH IN DB — allowing through (run fixBranchAssignments.ts to repair)', user.email);
      } else {
        // Flexible match: exact OR db-name contains selected city OR selected contains first DB word
        // Handles "London Central" matching "london", "STEAKZ Manchester" matching "manchester", etc.
        const isMatch =
          userBranch === selected ||
          userBranch.includes(selected) ||
          selected.includes(userBranch.split(' ')[0]);

        console.log('BRANCH CHECK:', { email: user.email, userBranch, selected, isMatch });

        if (!isMatch) {
          console.log(`BRANCH CHECK RESULT: DENIED — "${user.email}" belongs to "${userBranch}", requested "${selected}"`);
          res.status(403).json({
            success: false,
            message: `Access denied. Your account is assigned to the ${(user as any).branch.name} branch.`,
            userBranchName: (user as any).branch.name,
          });
          return;
        }
        console.log(`BRANCH CHECK RESULT: ALLOWED — "${user.email}" matched "${userBranch}" with selected "${selected}"`);
      }
    } else if (!selectedBranch) {
      console.log('BRANCH CHECK RESULT: SKIPPED — no selectedBranch in request body');
    } else {
      console.log(`BRANCH CHECK RESULT: BYPASSED — role "${user.role}" has global access`);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN DEBUG] Password match result:', passwordMatch);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Incorrect password' });
      return;
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      branchId: user.branchId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshTokenValue = generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { token: refreshTokenValue, userId: user.id, expiresAt },
    });

    res.cookie('refreshToken', refreshTokenValue, cookieOpts);
    res.cookie('accessToken', accessToken, accessTokenCookieOpts);

    const u = user as any;
    console.log(`[AUTH login] SUCCESS — ${user.email} (${user.role}) branch: ${u.branch?.name ?? 'HQ'}`);
    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branch: u.branch ?? null,
        branchName: u.branch?.name ?? null,
        employeeId: u.employeeId ?? null,
        shift: u.shift ?? null,
        teamAssignment: u.teamAssignment ?? null,
        employeeStatus: u.employeeStatus ?? null,
      },
    });
  } catch (error) {
    console.error('[AUTH login] Unexpected error:', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Unexpected server error during login' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) await prisma.refreshToken.deleteMany({ where: { token } });
    res.clearCookie('accessToken', { ...accessTokenCookieOpts, maxAge: 0 });
    res.clearCookie('refreshToken', { ...cookieOpts, maxAge: 0 });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[AUTH logout]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error during logout' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token not found — please log in again' });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      res.status(403).json({ success: false, message: 'Refresh token expired — please log in again' });
      return;
    }

    const payload: JwtPayload = {
      userId: stored.user.id,
      email: stored.user.email,
      role: stored.user.role as JwtPayload['role'],
      branchId: stored.user.branchId,
    };

    const newAccessToken = generateAccessToken(payload);
    res.cookie('accessToken', newAccessToken, accessTokenCookieOpts);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error('[AUTH refresh]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error during token refresh' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      // `as any` — employee fields (employeeId, salary, shift, etc.) are added
      // by migration. Cast removed once prisma migrate dev has been run.
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        branchId: true,
        employeeId: true,
        salary: true,
        shift: true,
        employeeStatus: true,
        dateJoined: true,
        teamAssignment: true,
        createdAt: true,
        branch: { select: { id: true, name: true, location: true } },
      } as any,
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('[AUTH getMe]', (error as any)?.message, error);
    res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
  }
};

// ── Admin diagnostic endpoint ─────────────────────────────────────────────────
export const getDiagnostics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let dbStatus = 'disconnected';
    let usersByRole: Array<{ role: string; count: number }> = [];
    let branchCount = 0;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      const grouped = await prisma.user.groupBy({ by: ['role'], _count: { id: true } });
      usersByRole = grouped.map((g) => ({ role: g.role, count: g._count.id }));
      branchCount = await prisma.branch.count();
    } catch (dbErr) {
      dbStatus = `error: ${String(dbErr)}`;
    }

    res.json({
      success: true,
      database: dbStatus,
      branchCount,
      usersByRole,
      setupStatus: branchCount === 0
        ? 'Run: npx prisma migrate dev && npx ts-node prisma/seed.ts'
        : 'ok',
      envVarsPresent: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        CLIENT_URL: !!process.env.CLIENT_URL,
        SMTP_HOST: !!process.env.SMTP_HOST,
      },
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[AUTH diagnostics]', (error as any)?.message, error);
    res.status(500).json({ success: false, error: (error as any)?.message ?? String(error) });
  }
};
