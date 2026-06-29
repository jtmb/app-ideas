import { Router, RequestHandler } from 'express';
import { createStudySession } from '../controllers/study-sessions';

const router = Router();

/**
 * POST /api/v1/study-sessions
 * Create a new study session with subject assignment validation
 */
router.post('/', createStudySession);

export default router;