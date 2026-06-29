import { Router, Request, Response } from 'express';
import { visitService } from '../services/visitService';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/v1/visits - Get paginated list of vet visits with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const visitId = req.query.visitId as string | undefined;
    const petId = req.query.petId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const status = req.query.status as string | undefined;

    if (visitId) {
      const visit = await visitService.getVisitById(visitId, petId);
      if (!visit) {
        return res.status(404).json({
          error: {
            code: 'VISIT_NOT_FOUND',
            message: `Vet visit with ID ${visitId} not found`
          }
        });
      }
      return res.status(200).json({ data: visit });
    }

    const filters = {};
    if (petId) filters.petId = petId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (status) {
      const validStatuses = ['scheduled', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_STATUS',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          }
        });
      }
      filters.status = status;
    }

    const visits = await visitService.getVisits(filters);
    res.status(200).json({ data: visits });
  } catch (error) {
    errorHandler.handleError(error, res);
  }
});

/**
 * GET /api/v1/visits/:id - Get a single visit by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const visitId = req.params.id;
    const petId = req.query.petId as string | undefined;

    if (!visitId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETER',
          message: 'Visit ID is required'
        }
      });
    }

    const visit = await visitService.getVisitById(visitId, petId);

    if (!visit) {
      return res.status(404).json({
        error: {
          code: 'VISIT_NOT_FOUND',
          message: `Vet visit with ID ${visitId} not found`
        }
      });
    }

    res.status(200).json({ data: visit });
  } catch (error) {
    errorHandler.handleError(error, res);
  }
});

export default router;
