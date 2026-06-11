// ──────────────────────────────────────────────────────────────────────────────
// routes/auth.ts
//
// This file defines all the routes related to logging in and out.
// "Routes" are like the address book of the server — they map a URL + HTTP method
// to the function that should handle it.
//
// All routes here are under /api/auth (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { body } from 'express-validator'; // used to write validation rules for incoming data
import { register, login, logout, refresh, getMe, getDiagnostics } from '../controllers/authController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

// Router is like a mini Express app that handles a group of related routes.
const router = Router();

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Lets a new user create an account. Like filling in a sign-up form.
// Before the register() function runs, we validate the input fields.
router.post(
  '/register',
  [
    // Each body() call is a rule: "this field must pass this check"
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,   // runs the checks above — stops here if anything fails
  register    // creates the account in the database
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Lets an existing user log in with their email and password.
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,   // check the fields before continuing
  login       // verify credentials and return tokens
);

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
// Logs the user out by clearing their refresh token cookie.
// No validation needed — just clearing the session.
router.post('/logout', logout);

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
// Issues a new access token using the refresh token stored in the cookie.
// Think of it like renewing your bus pass before it expires.
router.post('/refresh', refresh);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// Returns the profile of the currently logged-in user.
// verifyToken runs first to make sure the user is logged in.
router.get('/me', verifyToken, getMe);

// ── GET /api/auth/diagnostics ─────────────────────────────────────────────────
// Returns debug information about the server. Only ADMIN can access this.
// verifyToken checks login, requireRole checks the role.
router.get('/diagnostics', verifyToken, requireRole('ADMIN'), getDiagnostics);

export default router;
