import { Router, Request, Response } from 'express';

const router = Router();

// Placeholder routes - to be implemented
router.get('/predictions', (req: Request, res: Response) => {
  res.status(200).json({ predictions: [] });
});

router.get('/trends', (req: Request, res: Response) => {
  res.status(200).json({ trends: [] });
});

export default router;