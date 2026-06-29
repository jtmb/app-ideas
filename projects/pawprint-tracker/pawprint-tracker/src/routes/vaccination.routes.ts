import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { vaccinationController } from '../controllers/vaccinationController.js';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Validation rules for vaccination creation
export const createVaccinationValidation = [
  body('petId')
    .trim()
    .notEmpty().withMessage('Pet ID is required'),
  
  body('vaccineName')
    .trim()
    .notEmpty().withMessage('Vaccine name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Vaccine name must be between 1 and 100 characters'),
  
  body('manufacturer')
    .trim()
    .notEmpty().withMessage('Manufacturer is required')
    .isLength({ min: 1, max: 100 }).withMessage('Manufacturer must be between 1 and 100 characters'),
  
  body('lotNumber')
    .trim()
    .notEmpty().withMessage('Lot number is required')
    .isLength({ min: 1, max: 50 }).withMessage('Lot number must be between 1 and 50 characters'),
  
  body('administeredDate')
    .trim()
    .notEmpty().withMessage('Administered date is required')
    .isISO8601({ strict: true }).withMessage('Invalid date format. Use ISO 8601 (YYYY-MM-DD)'),
  
  body('administeringVet')
    .trim()
    .notEmpty().withMessage('Administering vet is required')
    .isLength({ min: 1, max: 100 }).withMessage('Administering vet must be between 1 and 100 characters'),
  
  body('clinicName')
    .trim()
    .notEmpty().withMessage('Clinic name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Clinic name must be between 1 and 100 characters'),
  
  body('nextDueDate')
    .optional()
    .trim()
    .isISO8601().withMessage('Next due date must be valid ISO date'),
];

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

/**
 * GET /api/v1/vaccinations/:id
 * Retrieve a single vaccination record by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Vaccination ID is required'
        }
      });
    }

    vaccinationController.getVaccinationById(res, id);
  } catch (error) {
    console.error('Error fetching vaccination:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vaccination record'
      }
    });
  }
});

/**
 * POST /api/v1/vaccinations
 * Record a new vaccination for a pet
 */
router.post(
  '/',
  createVaccinationValidation,
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors.array() } });
      }

      const { petId, vaccineName, manufacturer, lotNumber, administeredDate, administeringVet, clinicName, nextDueDate } = req.body;

      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: ['Authentication required'] } });
      }

      // Generate unique ID
      const vaccinationId = uuidv4();

      // Create vaccination record
      const vaccination = {
        id: vaccinationId,
        petId,
        vaccineName,
        manufacturer,
        lotNumber,
        administeredDate,
        administeringVet,
        clinicName,
        nextDueDate,
      };

      // TODO: Save to database using repository pattern
      // await vaccinationRepository.create(vaccination);

      res.status(201).json({
        success: true,
        data: vaccination,
        message: 'Vaccination record created successfully',
      });
    } catch (error) {
      console.error('Error creating vaccination:', error);
      
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        return res.status(409).json({ error: { code: 'DUPLICATE_VACCINATION', message: ['Vaccination with this lot number already exists'] } });
      }

      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create vaccination record',
        },
      });
    }
  }
);

export default router;
