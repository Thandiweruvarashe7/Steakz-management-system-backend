
// This file contains the "security guards" of the application.
// Every time a user tries to access a protected page or action, the code in
// this file runs first to decide whether they are allowed in.
//
// There are three guards defined here:
//   1. verifyToken      — checks that the user is logged in (has a valid pass)
//   2. requireRole      — checks that the logged-in user has the right job title
//   3. requireBranchAccess — checks that the user is only touching their own branch


import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, UserRole } from '../types';


// This function checks that token is real and hasn't expired.
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Step 1: look for the token in the "Authorization" request header.
  // The header looks like:  Authorization: Bearer abc123xyz
  const authHeader = req.headers.authorization;

  // If the header starts with "Bearer ", grab just the token part after it.
  
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  
  // When you log in, the server also saves the token as a cookie in your browser.
  // This is a fallback in case the header wasn't sent.
  const cookieToken = req.cookies?.accessToken ?? null;

  // Use the header token if it exists; otherwise fall back to the cookie token.
  const token = headerToken ?? cookieToken;

  // If no token was found at all, the user is not logged in — reject them.
  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    // Verify the token using the secret key stored in environment variables.
    // If the token was tampered with or expired, jwt.verify throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Attach the decoded user info (userId, role, branchId, etc.) to the request
  
    req.user = decoded;

    // Call next() to hand control to the next middleware or route handler.
    next();
  } catch {
    // The token was invalid or expired — reject with 403 Forbidden.
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};



// This is a "factory function" — you call it with the allowed roles and it
// returns a new function (the actual guard) that does the check.
export const requireRole = (...roles: UserRole[]) => {
  // This is the actual middleware function that runs on each request.
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // If req.user is missing, verifyToken wasn't called first — reject.
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if the user's role is in the allowed list.

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    // Role is allowed — let the request through.
    next();
  };
};


// ADMIN and HQ_MANAGER have a master key and can access any branch.
export const requireBranchAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Must be logged in first.
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const { role, branchId } = req.user;

  // ADMIN and HQ_MANAGER can see all branches — let them through immediately.
  if (role === 'ADMIN' || role === 'HQ_MANAGER') {
    next();
    return;
  }

  // All other roles (branch-level staff) must have a branch assigned to their account.
  if (!branchId) {
    res.status(403).json({ message: 'Access denied: no branch assigned to your account' });
    return;
  }

  // Work out which branch the request is trying to access.
  const requestedBranchId =
    req.params.branchId ||
    (req.body as { branchId?: string }).branchId ||
    (req.query.branchId as string);

  // If a specific branch was requested and it doesn't match the user's branch, block it.
  if (requestedBranchId && requestedBranchId !== branchId) {
    res.status(403).json({ message: 'Access denied: you can only access your assigned branch' });
    return;
  }

  // Branch check passed — let the request through.
  next();
};
