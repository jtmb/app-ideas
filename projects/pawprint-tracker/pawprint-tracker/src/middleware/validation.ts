import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export function validateVaccinationCreate() {
  return [
    body('petId').trim().notEmpty().withMessage('Pet ID is required'),
    body('vaccineName').trim().notEmpty().isLength({ min: 1 }).withMessage('Vaccine name is required'),
    body('manufacturer').trim().notEmpty().isLength({ min: 1 }).withMessage('Manufacturer is required'),
    body('lotNumber').trim().notEmpty().isLength({ min: 1 }).withMessage('Lot number is required'),
    body('administeredDate').notEmpty().withMessage('Administered date is required'),
    body('administeringVet').trim().notEmpty().isLength({ min: 1 }).withMessage('Administering vet is required'),
    body('clinicName').trim().notEmpty().isLength({ min: 1 }).withMessage('Clinic name is required'),
    body('nextDueDate').optional().trim().isISO8601().withMessage('Next due date must be valid ISO date'),
  ];
}

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors.array() } });
  }
  next();
}