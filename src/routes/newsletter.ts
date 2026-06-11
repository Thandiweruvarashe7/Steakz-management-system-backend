// ──────────────────────────────────────────────────────────────────────────────
// routes/newsletter.ts
//
// A single route for newsletter sign-ups on the Steakz website.
// Visitors can enter their email (and optionally their name) to subscribe.
//
// No login required — this is a public-facing form.
// The email is saved to the NewsletterSubscription table in the database.
//
// All routes here are under /api/newsletter (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';

const router = Router();

// A simple regular expression (pattern) that checks whether a string looks like
// a valid email address — must have characters, an @, a domain, and a dot.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/newsletter ──────────────────────────────────────────────────────
// Subscribes an email address to the newsletter.
// PUBLIC — no login required (anyone on the website can sign up).
router.post(
  '/',
  [body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address')],
  async (req: Request, res: Response): Promise<void> => {
    // Check if express-validator found any problems with the email field.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address' });
      return;
    }

    const { email, name } = req.body as { email: string; name?: string };

    // Double-check the email against our own regex pattern as an extra safety net.
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address' });
      return;
    }

    try {
      // Check if this email is already in the database — we don't want duplicates.
      const existing = await (prisma.newsletterSubscription as any).findUnique({ where: { email } });
      if (existing) {
        // 409 Conflict = "this already exists"
        console.log('[NEWSLETTER] Already subscribed:', email);
        res.status(409).json({ success: false, message: 'This email is already subscribed' });
        return;
      }

      // Save the new subscription to the database. Name is optional so we store null if not provided.
      await (prisma.newsletterSubscription as any).create({ data: { email, name: name ?? null } });
      console.log('[NEWSLETTER] New subscription saved to DB:', email, name ?? '(no name)', new Date().toISOString());

      // 201 Created = "successfully saved a new record"
      res.status(201).json({ success: true, message: 'Successfully subscribed to the Steakz UK Newsletter.' });
    } catch (error) {
      console.error('[NEWSLETTER] Error:', (error as any)?.message, error);
      res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
    }
  }
);

export default router;
