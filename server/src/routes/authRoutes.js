import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, me, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateLogin, validateRegister } from '../middleware/validationMiddleware.js';

const router = Router();

// Rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

router.post('/login', authLimiter, validateLogin, login);
router.post('/register', authLimiter, validateRegister, register);
router.get('/me', authenticateToken, me);
router.post('/logout', authenticateToken, logout);

export default router;
