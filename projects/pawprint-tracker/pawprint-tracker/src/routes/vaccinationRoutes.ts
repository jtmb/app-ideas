import { Router, Request, Response } from 'express';
import { vaccinationController } from '../controllers/vaccinationController';

const router = Router();

/**
 * GET /api/v1/vaccinations
 * Retrieve vaccination records with pagination and optional pet filter
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', pet_id } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PAGE',
          message: 'Page number must be a positive integer'
        }
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        error: {
          code: 'INVALID_LIMIT',
          message: 'Limit must be between 1 and 100'
        }
      });
    }

    const offset = (pageNum - 1) * limitNum;

    vaccinationController.getVaccinations(
      res,
      {
        page: pageNum,
        limit: limitNum,
        petId: pet_id ? String(pet_id) : undefined
      }
    );
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vaccination records'
      }
    });
  }
});

export default router;
