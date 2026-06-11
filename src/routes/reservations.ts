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
    // tableId is optional — if omitted the server auto-assigns the first available table
    body('tableId').optional().isString(),
    body('reservationDate').isISO8601().withMessage('Valid date is required'),
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

// Frontend service uses PATCH for status updates — keep PUT too so nothing breaks
router.patch(
  '/:id',
  verifyToken,
  requireRole('CUSTOMER', 'WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  updateReservation
);

router.delete('/:id', verifyToken, requireRole('CUSTOMER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'), deleteReservation);

export default router;
