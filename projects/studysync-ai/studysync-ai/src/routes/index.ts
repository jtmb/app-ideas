import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import subjectRoutes from './subjects';
import sessionRoutes from './sessions';

const router = Router();

// API version prefix
router.use('/api/v1', healthRoutes);
router.use('/api/v1', authRoutes);
router.use('/api/v1', subjectRoutes);
router.use('/api/v1', sessionRoutes);

export default router;
