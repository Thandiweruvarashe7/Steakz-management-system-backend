import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { createBulkNotifications } from '../utils/notificationHelper';

export const createCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, role, branchId: userBranchId } = req.user!;
    const { title, message, targetAudience, branchId } = req.body as {
      title: string;
      message: string;
      targetAudience?: string;
      branchId?: string;
    };

    // Branch managers can only create campaigns for their own branch
    const resolvedBranchId =
      role === 'BRANCH_MANAGER' ? userBranchId : (branchId ?? null);

    const campaign = await (prisma.campaign as any).create({
      data: {
        title,
        message,
        targetAudience: targetAudience ?? 'ALL',
        branchId: resolvedBranchId,
        createdById: userId,
        status: 'DRAFT',
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    console.error('[CAMPAIGN] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;

    let where: Record<string, unknown> = {};

    if (role === 'BRANCH_MANAGER') {
      where = { branchId: userBranchId };
    } else if (role !== 'ADMIN' && role !== 'HQ_MANAGER') {
      res.status(403).json({ message: 'Access denied' });
      return;
    } else if (queryBranchId) {
      where = { branchId: queryBranchId };
    }

    const campaigns = await (prisma.campaign as any).findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('[CAMPAIGN] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;

    const campaign = await (prisma.campaign as any).findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    if (role === 'BRANCH_MANAGER' && campaign.branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    res.json({ success: true, campaign });
  } catch (error) {
    console.error('[CAMPAIGN] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const { title, message, targetAudience, branchId } = req.body as {
      title?: string;
      message?: string;
      targetAudience?: string;
      branchId?: string;
    };

    const existing = await (prisma.campaign as any).findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    if (role === 'BRANCH_MANAGER' && existing.branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    if (existing.status === 'SENT') {
      res.status(400).json({ message: 'Cannot edit a campaign that has already been sent' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (message) updateData.message = message;
    if (targetAudience) updateData.targetAudience = targetAudience;
    if (branchId !== undefined && role !== 'BRANCH_MANAGER') updateData.branchId = branchId || null;

    const campaign = await (prisma.campaign as any).update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, campaign });
  } catch (error) {
    console.error('[CAMPAIGN] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const sendCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;

    const campaign = await (prisma.campaign as any).findUnique({ where: { id: req.params.id } });
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    if (role === 'BRANCH_MANAGER' && campaign.branchId !== userBranchId) {
      res.status(403).json({ message: 'Access denied: not your branch' });
      return;
    }

    if (campaign.status === 'SENT') {
      res.status(400).json({ message: 'Campaign already sent' });
      return;
    }

    if (campaign.status === 'CANCELLED') {
      res.status(400).json({ message: 'Cannot send a cancelled campaign' });
      return;
    }

    // Determine target users
    let userWhere: Record<string, unknown> = {};
    if (campaign.targetAudience === 'CUSTOMERS') {
      userWhere = { role: 'CUSTOMER' };
    } else if (campaign.targetAudience === 'BRANCH' && campaign.branchId) {
      userWhere = { branchId: campaign.branchId };
    }
    // ALL = everyone (no filter)

    const targetUsers = await prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    if (targetUsers.length === 0) {
      res.status(400).json({ message: 'No users match the target audience' });
      return;
    }

    // Send notifications to all target users
    await createBulkNotifications(
      targetUsers.map((u) => ({
        userId: u.id,
        type: 'CAMPAIGN' as const,
        title: campaign.title,
        message: campaign.message,
      }))
    );

    const sent = await (prisma.campaign as any).update({
      where: { id: req.params.id },
      data: { status: 'SENT', sentAt: new Date() },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, campaign: sent, recipientCount: targetUsers.length });
  } catch (error) {
    console.error('[CAMPAIGN] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const deleteCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await (prisma.campaign as any).findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    await (prisma.campaign as any).delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    console.error('[CAMPAIGN] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
