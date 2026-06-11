import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  sendCampaign,
  deleteCampaign,
} from '../controllers/campaignController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getCampaigns
);

router.get(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getCampaignById
);

router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
  ],
  validate,
  createCampaign
);

router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  updateCampaign
);

router.post(
  '/:id/send',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  sendCampaign
);

router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteCampaign);

export default router;
