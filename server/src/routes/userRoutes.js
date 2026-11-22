import { Router } from 'express';
import { getProfile, getUserById, listUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Current user profile
router.get('/profile', authenticateToken, getProfile);

// Specific user by id (Ownership or Admin enforced in service)
router.get('/:id', authenticateToken, getUserById);

// List users (Admin only)
router.get('/', authenticateToken, requireRole('admin'), listUsers);

export default router;
