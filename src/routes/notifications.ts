// ──────────────────────────────────────────────────────────────────────────────
// routes/notifications.ts
//
// Routes for the in-app notification bell — alerts that appear when something
// happens, like "Your order is ready!" or "New order received in kitchen".
//
// Every logged-in user can read and manage their own notifications.
// Only ADMIN can create notifications manually (usually they're auto-generated).
//
// All routes here are under /api/notifications (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { body } from 'express-validator';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  createAdminNotification,
} from '../controllers/notificationController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// ── GET /api/notifications ────────────────────────────────────────────────────
// Returns all notifications for the currently logged-in user.
// Only shows the user's own notifications — you can't see someone else's.
router.get('/', verifyToken, getNotifications);

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
// Marks a single notification as read (removes the unread dot).
router.patch('/:id/read', verifyToken, markNotificationRead);

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
// Marks ALL of the user's notifications as read at once.
// Like clicking "Mark all as read" in an email app.
router.patch('/read-all', verifyToken, markAllNotificationsRead);

// ── DELETE /api/notifications/:id ────────────────────────────────────────────
// Permanently deletes one notification.
router.delete('/:id', verifyToken, deleteNotification);

// ── POST /api/notifications ───────────────────────────────────────────────────
// Manually creates a notification and sends it to a specific user.
// Only ADMIN can do this — in normal operation notifications are created
// automatically by the system when orders change status, etc.
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN'),
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('title').notEmpty().withMessage('title is required'),
    body('message').notEmpty().withMessage('message is required'),
  ],
  validate,
  createAdminNotification
);

export default router;
