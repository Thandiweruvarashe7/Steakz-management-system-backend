
import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} from '../controllers/reservationController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'ADMIN'),
  [
    body('branchId').notEmpty().withMessage('Branch ID is required'),
    
    body('tableId').optional().isString(),
    body('reservationDate').isISO8601().withMessage('Valid date is required'), // ISO8601 = standard date format e.g. "2025-12-25T19:00:00"
    body('partySize').isInt({ min: 1 }).withMessage('Party size must be at least 1'),
  ],
  validate,
  createReservation
);

router.get(
  '/',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReservations
);


router.get(
  '/:id',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getReservationById
);

router.put(
  '/:id',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  updateReservation
);

router.patch(
  '/:id',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  updateReservation
);


router.delete('/:id', verifyToken, requireRole('CUSTOMER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'), deleteReservation);

export default router;
