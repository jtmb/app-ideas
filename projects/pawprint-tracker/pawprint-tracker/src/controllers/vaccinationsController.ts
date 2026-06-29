import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { vaccinationService } from '../services/vaccinationService';

/**
 * PUT /api/v1/vaccinations/:id
 * Update a vaccination record
 */
export const updateVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors.array() } });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    // Call service to update vaccination
    const updatedVaccination = await vaccinationService.updateVaccination(id, updateData);

    res.status(200).json({ data: updatedVaccination });
  } catch (error) {
    if (error instanceof vaccinationService.VaccinationNotFoundError) {
      res.status(404).json({ error: { code: 'VACCINATION_NOT_FOUND', message: 'Vaccination record not found' } });
    } else if (error instanceof vaccinationService.ConflictError) {
      res.status(409).json({ error: { code: 'CONFLICT_ERROR', message: error.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update vaccination record' } });
    }
  }
};

/**
 * DELETE /api/v1/vaccinations/:id
 * Delete a vaccination record
 */
export const deleteVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Call service to delete vaccination
    await vaccinationService.deleteVaccination(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof vaccinationService.VaccinationNotFoundError) {
      res.status(404).json({ error: { code: 'VACCINATION_NOT_FOUND', message: 'Vaccination record not found' } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete vaccination record' } });
    }
  }
};