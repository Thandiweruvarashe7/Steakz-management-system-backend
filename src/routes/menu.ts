// ──────────────────────────────────────────────────────────────────────────────
// routes/menu.ts
//
// Routes for the restaurant menu — categories (e.g. "Steaks", "Desserts")
// and individual items (e.g. "Ribeye 8oz", "Chocolate Brownie").
//
// Reading the menu is public — any visitor can browse it.
// Adding, editing, and removing items is restricted to ADMIN and HQ_MANAGER.
//
// All routes here are under /api/menu (set in app.ts).
// ──────────────────────────────────────────────────────────────────────────────

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

// ── GET /api/menu ─────────────────────────────────────────────────────────────
// Returns all menu items grouped by category.
// Accepts optional ?branchId= query param to include stock status per item.
// PUBLIC — no login required (customers browse the menu before ordering).
router.get('/', getAllMenuItems);

// ── GET /api/menu/categories ──────────────────────────────────────────────────
// Returns just the list of category names (e.g. Steaks, Sides, Drinks).
// PUBLIC — used to populate the category filter on the menu page.
router.get('/categories', getAllCategories);

// ── GET /api/menu/:id ─────────────────────────────────────────────────────────
// Returns the full details of one specific menu item (by its ID).
// PUBLIC — used when viewing a single item's detail page.
router.get('/:id', getMenuItemById);

// ── POST /api/menu/categories ─────────────────────────────────────────────────
// Creates a new menu category (e.g. "Sharing Platters").
// Only ADMIN and HQ_MANAGER can do this — affects all branches.
router.post(
  '/categories',
  verifyToken,
  requireRole('ADMIN', 'HQ_MANAGER'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  createCategory
);

// ── POST /api/menu ────────────────────────────────────────────────────────────
// Adds a new item to the menu (e.g. a new dish).
// Only ADMIN and HQ_MANAGER can do this.
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

// ── PUT /api/menu/:id ─────────────────────────────────────────────────────────
// Updates an existing menu item (e.g. change the price or description).
// Only ADMIN and HQ_MANAGER can do this.
router.put('/:id', verifyToken, requireRole('ADMIN', 'HQ_MANAGER'), updateMenuItem);

// ── DELETE /api/menu/:id ──────────────────────────────────────────────────────
// Removes a menu item. Only ADMIN and HQ_MANAGER can do this.
router.delete('/:id', verifyToken, requireRole('ADMIN', 'HQ_MANAGER'), deleteMenuItem);

export default router;
