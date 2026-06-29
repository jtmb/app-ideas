import { Router } from 'express';
import { createSubject } from '../controllers/subjectsController';

const router = Router();

router.post('/', createSubject);

export default router;