import { Router } from 'express';
import { getAllSubjects, getSubjectById } from '../controllers/subjects.controller';

const router = Router();

/**
 * GET /api/v1/subjects
 * Retrieves all subjects with optional filtering and pagination
 */
router.get('/', getAllSubjects);

/**
 * GET /api/v1/subjects/:id
 * Retrieves a single subject by ID
 */
router.get('/:id', getSubjectById);

export default router;