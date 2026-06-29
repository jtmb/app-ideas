import { Router, Request, Response } from 'express';
import { studyGoalsController } from '../controllers/study-goals.controller';
import { validateStudyGoalIdMiddleware } from '../middleware/validation';

const router = Router();

/**
 * PUT /api/v1/study-goals/:id
 * Update a study goal
 */
router.put(
  '/study-goals/:id',
  validateStudyGoalIdMiddleware(),
  (req: Request, res: Response) => {
    const updatedGoal = studyGoalsController.updateStudyGoal(req.params.id, req.body);
    res.status(200).json({ data: updatedGoal });
  }
);

/**
 * DELETE /api/v1/study-goals/:id
 * Delete a study goal
 */
router.delete(
  '/study-goals/:id',
  validateStudyGoalIdMiddleware(),
  (req: Request, res: Response) => {
    const deleted = studyGoalsController.deleteStudyGoal(req.params.id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Study goal not found' } });
    }
  }
);

export default router;
