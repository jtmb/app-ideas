import { Router } from 'express';
import petsRouter from './pets.js';
import vaccinationsRouter from './vaccination.routes.js';
import visitsRouter from './visits.js';

const router = Router();

router.use('/pets', petsRouter);
router.use('/vaccinations', vaccinationsRouter);
router.use('/visits', visitsRouter);

export default router;
