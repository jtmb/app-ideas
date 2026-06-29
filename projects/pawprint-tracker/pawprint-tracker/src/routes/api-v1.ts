// API v1 Routes Index for Paw Print Tracker

import { Router } from 'express';
import visitsRouter from './visits';

const router = Router();

/**
 * Mount visit routes under /api/v1/visits
 */
router.use('/visits', visitsRouter);

export default router;