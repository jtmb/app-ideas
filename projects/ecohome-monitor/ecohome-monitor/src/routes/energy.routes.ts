import { Router, Request, Response } from 'express';

const router = Router();

// Placeholder routes - to be implemented
router.get('/consumption', (req: Request, res: Response) => {
  res.status(200).json({ consumption: [] });
});

router.post('/record', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Energy record created' });
});

export default router;