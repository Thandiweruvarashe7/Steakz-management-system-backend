
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

router.get('/', verifyToken, getNotifications);

router.patch('/:id/read', verifyToken, markNotificationRead);

router.patch('/read-all', verifyToken, markAllNotificationsRead);


router.delete('/:id', verifyToken, deleteNotification);

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
