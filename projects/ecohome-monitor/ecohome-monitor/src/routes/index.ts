import express from 'express';
import { healthCheck } from './health.routes';
import { userRoutes } from './user.routes';
import { deviceRoutes } from './device.routes';
import { energyRoutes } from './energy.routes';

const router = express.Router();

// Mount routes
router.use('/health', healthCheck);
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/energy', energyRoutes);

export default router;