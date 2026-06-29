import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CreateVaccinationInput, VaccinationResponse } from '../types/vaccination.js';
import { vaccinationController } from '../controllers/vaccinationController.js';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// GET /api/v1/vaccinations - List all vaccinations (with optional pagination and filters)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const petId = req.query.petId as string | undefined;

    await vaccinationController.getVaccinations(res, { page, limit, petId });
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: ['Failed to fetch vaccination records'] } });
  }
});

// GET /api/v1/vaccinations/:id - Retrieve a single vaccination record by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;

    await vaccinationController.getVaccinationById(res, id);
  } catch (error) {
    console.error('Error fetching vaccination:', error);
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: ['Failed to fetch vaccination record'] } });
  }
});

// POST /api/v1/vaccinations - Record a new vaccination
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const input = req.body as CreateVaccinationInput;

    // Validate required fields
    if (!input.petId || !input.vaccineName || !input.manufacturer || 
        !input.lotNumber || !input.administeredDate || 
        !input.administeringVet || !input.clinicName) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: ['All required fields must be provided'] } });
    }

    // Validate date format
    const administeredDate = new Date(input.administeredDate);
    if (isNaN(administeredDate.getTime())) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: ['Administered date must be a valid date'] } });
    }

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: ['Authentication required'] } });
    }

    // Generate unique ID
    const vaccinationId = uuidv4();

    // Create vaccination record
    const vaccination: VaccinationResponse = {
      id: vaccinationId,
      petId: input.petId,
      vaccineName: input.vaccineName,
      manufacturer: input.manufacturer,
      lotNumber: input.lotNumber,
      administeredDate: input.administeredDate,
      administeringVet: input.administeringVet,
      clinicName: input.clinicName,
      nextDueDate: input.nextDueDate || undefined,
    };

    // TODO: Save to database using repository pattern
    // await vaccinationRepository.create(vaccination);

    return res.status(201).json({ 
      success: true, 
      data: vaccination,
      message: 'Vaccination record created successfully'
    });

  } catch (error) {
    console.error('Error creating vaccination:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return res.status(409).json({ error: { code: 'DUPLICATE_VACCINATION', message: ['Vaccination with this lot number already exists'] } });
    }

    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: ['Failed to create vaccination record'] } });
  }
});

export default router;
