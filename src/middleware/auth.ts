import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, UserRole } from '../types';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Try Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  // 2. Try cookie (accessToken cookie set on login)
  const cookieToken = req.cookies?.accessToken ?? null;

  // Use whichever is present — header takes priority
  const token = headerToken ?? cookieToken;

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireBranchAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const { role, branchId } = req.user;

  // HQ and admin see everything
  if (role === 'ADMIN' || role === 'HQ_MANAGER') {
    next();
    return;
  }

  // Branch-level staff must have a branch assigned
  if (!branchId) {
    res.status(403).json({ message: 'Access denied: no branch assigned to your account' });
    return;
  }

  const requestedBranchId =
    req.params.branchId ||
    (req.body as { branchId?: string }).branchId ||
    (req.query.branchId as string);

  if (requestedBranchId && requestedBranchId !== branchId) {
    res.status(403).json({ message: 'Access denied: you can only access your assigned branch' });
    return;
  }

  next();
};
