import { Router } from 'express';
import { updateVaccination, deleteVaccination } from '../controllers/vaccinationsController';
import { updateVaccinationRules, deleteVaccinationRules } from '../validations/vaccinationValidations';

const router = Router();

/**
 * PUT /api/v1/vaccinations/:id
 * Update a vaccination record
 */
router.put('/:id', updateVaccinationRules, updateVaccination);

/**
 * DELETE /api/v1/vaccinations/:id
 * Delete a vaccination record
 */
router.delete('/:id', deleteVaccinationRules, deleteVaccination);

export default router;