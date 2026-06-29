import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/users/:id
 */
router.get('/:id', getUserProfile);

/**
 * PUT /api/v1/users/:id
 */
router.put('/:id', updateUserProfile);

export default router;
