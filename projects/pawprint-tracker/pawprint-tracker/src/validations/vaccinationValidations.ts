import { body } from 'express-validator';

/**
 * Validation rules for updating a vaccination record
 */
export const updateVaccinationRules = [
  body('petId')
    .isUUID()
    .withMessage('Invalid pet ID format')
    .trim(),

  body('vaccineName')
    .notEmpty().withMessage('Vaccine name is required')
    .isLength({ min: 1, max: 255 }).withMessage('Vaccine name must be between 1 and 255 characters')
    .trim(),

  body('dateAdministered')
    .isISO8601().withMessage('Invalid date format. Expected ISO 8601 format (YYYY-MM-DD)')
    .toDate(),

  body('veterinarian')
    .optional()
    .isLength({ max: 255 }).withMessage('Veterinarian name must be less than 255 characters')
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
    .trim(),

  body('batchNumber')
    .optional()
    .isLength({ max: 50 }).withMessage('Batch number must be less than 50 characters')
    .trim(),

  body('expiryDate')
    .optional()
    .isISO8601().withMessage('Invalid expiry date format. Expected ISO 8601 format (YYYY-MM-DD)')
    .toDate(),
];

/**
 * Validation rules for deleting a vaccination record
 */
export const deleteVaccinationRules = [
  // No body validation needed for DELETE, only path parameter
];