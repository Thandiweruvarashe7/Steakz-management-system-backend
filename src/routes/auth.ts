
import { Router } from 'express';
import { body } from 'express-validator'; 
import { register, login, logout, refresh, getMe, getDiagnostics } from '../controllers/authController';
import { verifyToken, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';


const router = Router();

router.post(
  '/register',
  [
    // Each body() call is a rule: "this field must pass this check"
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  validate,   
  register    
);


router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,   // check the fields before continuing
  login       // verify credentials and return tokens
);

router.post('/logout', logout);


router.post('/refresh', refresh);


router.get('/me', verifyToken, getMe);

router.get('/diagnostics', verifyToken, requireRole('ADMIN'), getDiagnostics);

export default router;
