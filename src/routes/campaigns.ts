// ──────────────────────────────────────────────────────────────────────────────
// routes/campaigns.ts
//
// Routes for marketing campaigns — promotional messages sent to customers
// (e.g. "Happy Hour this Friday — 20% off all steaks!").
//
// Managers can create and manage campaigns; only ADMIN can delete them.
// Campaigns go through a lifecycle: DRAFT → SCHEDULED → SENT.
//
// All routes here are under /api/campaigns (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

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

// ── GET /api/campaigns ────────────────────────────────────────────────────────
// Returns a list of all campaigns. Managers see their branch's campaigns;
// HQ and admins see all campaigns across all branches.
router.get(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getCampaigns
);

// ── GET /api/campaigns/:id ────────────────────────────────────────────────────
// Returns the full details of one specific campaign.
router.get(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  getCampaignById
);

// ── POST /api/campaigns ───────────────────────────────────────────────────────
// Creates a new campaign in DRAFT status.
// Requires a title and a message body — all other fields are optional.
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

// ── PUT /api/campaigns/:id ────────────────────────────────────────────────────
// Updates a campaign's content, target audience, or schedule while it's still DRAFT.
router.put(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  updateCampaign
);

// ── POST /api/campaigns/:id/send ─────────────────────────────────────────────
// Sends/triggers a campaign — changes its status from DRAFT to SENT
// and dispatches it to the targeted audience.
router.post(
  '/:id/send',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER', 'BRANCH_MANAGER'),
  sendCampaign
);

// ── DELETE /api/campaigns/:id ─────────────────────────────────────────────────
// Permanently deletes a campaign. Only ADMIN can delete — other managers can only
// create and send, not permanently remove records.
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteCampaign);

export default router;
