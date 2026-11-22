import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

// Sub-routers under /api/v1
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);

export default router;
