import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post(
  '/',
  [body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address' });
      return;
    }

    const { email, name } = req.body as { email: string; name?: string };

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address' });
      return;
    }

    // name provided but email missing — caught above. name alone is always optional.

    try {
      const existing = await (prisma.newsletterSubscription as any).findUnique({ where: { email } });
      if (existing) {
        console.log('[NEWSLETTER] Already subscribed:', email);
        res.status(409).json({ success: false, message: 'This email is already subscribed' });
        return;
      }

      await (prisma.newsletterSubscription as any).create({ data: { email, name: name ?? null } });
      console.log('[NEWSLETTER] New subscription saved to DB:', email, name ?? '(no name)', new Date().toISOString());

      res.status(201).json({ success: true, message: 'Successfully subscribed to the Steakz UK Newsletter.' });
    } catch (error) {
      console.error('[NEWSLETTER] Error:', (error as any)?.message, error);
      res.status(500).json({ success: false, message: (error as any)?.message ?? 'Server error' });
    }
  }
);

export default router;
