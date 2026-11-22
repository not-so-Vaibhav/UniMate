import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import healthRoutes from './healthRoutes.js';
import canteenRoutes from './canteenRoutes.js';
import printingRoutes from './printingRoutes.js';
import locationRoutes from './locationRoutes.js';
import lostFoundRoutes from './lostFoundRoutes.js';
import assistantRoutes from './assistantRoutes.js';

const router = Router();

// Sub-routers under /api/v1
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);
router.use('/canteen', canteenRoutes);
router.use('/printing', printingRoutes);
router.use('/locations', locationRoutes);
router.use('/lost-found', lostFoundRoutes);
router.use('/assistant', assistantRoutes);

export default router;
