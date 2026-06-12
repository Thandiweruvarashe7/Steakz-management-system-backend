
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../controllers/branchController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();


router.get('/', getAllBranches);


router.get('/:id', getBranchById);


router.post(
  '/',
  verifyToken,
  requireRole('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Branch name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  validate,    // stop here if any field is missing or invalid
  createBranch
);


router.put('/:id', verifyToken, requireRole('ADMIN'), updateBranch);

router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteBranch);

export default router;
