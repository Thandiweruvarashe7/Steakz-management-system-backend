
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllCategories,
  createCategory,
} from '../controllers/menuController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', getAllMenuItems);

router.get('/categories', getAllCategories);


router.get('/:id', getMenuItemById);


router.post(
  '/categories',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  createCategory
);

router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  [
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('name').trim().notEmpty().withMessage('Item name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  validate,
  createMenuItem
);

router.put('/:id', verifyToken, requireRole('ADMIN', 'HQ_MANAGER'), updateMenuItem);

router.delete('/:id', verifyToken, requireRole('ADMIN', 'HQ_MANAGER'), deleteMenuItem);

export default router;
