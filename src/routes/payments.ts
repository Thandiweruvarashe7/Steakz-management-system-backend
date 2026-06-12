

import { Router } from 'express';
import { body } from 'express-validator';
import {
  processPayment,
  getPayments,
  getPaymentReports,
} from '../controllers/paymentController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();


router.post(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'ADMIN'),
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    // method must be one of the three accepted payment types
    body('method')
      .isIn(['CASH', 'CARD', 'CONTACTLESS'])
      .withMessage('Method must be CASH, CARD, or CONTACTLESS'),
  ],
  validate,
  processPayment
);

router.get(
  '/',
  verifyToken,
  requireRole('WAITER_CASHIER', 'BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getPayments
);

router.get(
  '/reports',
  verifyToken,
  requireRole('BRANCH_MANAGER', 'HQ_MANAGER', 'ADMIN'),
  getPaymentReports
);

export default router;
