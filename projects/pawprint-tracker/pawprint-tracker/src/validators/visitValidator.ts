import { VisitInput } from '../types/visit';

/**
 * Validation errors for visit input
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result of validation
 */
export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
}

/**
 * Validate visit input data
 */
export function validateVisitInput(input: VisitInput): ValidationResult {
  const errors: ValidationError[] = [];

  // Required field: petId
  if (!input.petId || typeof input.petId !== 'string' || input.petId.trim() === '') {
    errors.push({
      field: 'petId',
      message: 'Pet ID is required and must be a valid string',
    });
  }

  // Required field: visitType
  if (!input.visitType) {
    errors.push({
      field: 'visitType',
      message: 'Visit type is required',
    });
  } else if (typeof input.visitType !== 'string') {
    errors.push({
      field: 'visitType',
      message: 'Visit type must be a string',
    });
  }

  // Optional fields validation with reasonable constraints

  // symptoms - optional, max 1000 characters
  if (input.symptoms !== undefined && input.symptoms !== null) {
    if (typeof input.symptoms !== 'string') {
      errors.push({
        field: 'symptoms',
        message: 'Symptoms must be a string or omitted',
      });
    } else if (input.symptoms.length > 1000) {
      errors.push({
        field: 'symptoms',
        message: 'Symptoms cannot exceed 1000 characters',
      });
    }
  }

  // diagnosis - optional, max 2000 characters
  if (input.diagnosis !== undefined && input.diagnosis !== null) {
    if (typeof input.diagnosis !== 'string') {
      errors.push({
        field: 'diagnosis',
        message: 'Diagnosis must be a string or omitted',
      });
    } else if (input.diagnosis.length > 2000) {
      errors.push({
        field: 'diagnosis',
        message: 'Diagnosis cannot exceed 2000 characters',
      });
    }
  }

  // treatment - optional, max 2000 characters
  if (input.treatment !== undefined && input.treatment !== null) {
    if (typeof input.treatment !== 'string') {
      errors.push({
        field: 'treatment',
        message: 'Treatment must be a string or omitted',
      });
    } else if (input.treatment.length > 2000) {
      errors.push({
        field: 'treatment',
        message: 'Treatment cannot exceed 2000 characters',
      });
    }
  }

  // notes - optional, max 5000 characters
  if (input.notes !== undefined && input.notes !== null) {
    if (typeof input.notes !== 'string') {
      errors.push({
        field: 'notes',
        message: 'Notes must be a string or omitted',
      });
    } else if (input.notes.length > 5000) {
      errors.push({
        field: 'notes',
        message: 'Notes cannot exceed 5000 characters',
      });
    }
  }

  // veterinarianName - optional, max 200 characters
  if (input.veterinarianName !== undefined && input.veterinarianName !== null) {
    if (typeof input.veterinarianName !== 'string') {
      errors.push({
        field: 'veterinarianName',
        message: 'Veterinarian name must be a string or omitted',
      });
    } else if (input.veterinarianName.length > 200) {
      errors.push({
        field: 'veterinarianName',
        message: 'Veterinarian name cannot exceed 200 characters',
      });
    }
  }

  // veterinarianPhone - optional, max 50 characters
  if (input.veterinarianPhone !== undefined && input.veterinarianPhone !== null) {
    if (typeof input.veterinarianPhone !== 'string') {
      errors.push({
        field: 'veterinarianPhone',
        message: 'Veterinarian phone must be a string or omitted',
      });
    } else if (input.veterinarianPhone.length > 50) {
      errors.push({
        field: 'veterinarianPhone',
        message: 'Veterinarian phone cannot exceed 50 characters',
      });
    }
  }

  // cost - optional, must be a positive number if provided
  if (input.cost !== undefined && input.cost !== null) {
    if (typeof input.cost !== 'number') {
      errors.push({
        field: 'cost',
        message: 'Cost must be a number or omitted',
      });
    } else if (input.cost < 0) {
      errors.push({
        field: 'cost',
        message: 'Cost cannot be negative',
      });
    }
  }

  // appointmentDate - optional, must be a valid date string if provided
  if (input.appointmentDate !== undefined && input.appointmentDate !== null) {
    if (typeof input.appointmentDate !== 'string') {
      errors.push({
        field: 'appointmentDate',
        message: 'Appointment date must be a string or omitted',
      });
    } else {
      const date = new Date(input.appointmentDate);
      if (isNaN(date.getTime())) {
        errors.push({
          field: 'appointmentDate',
          message: 'Appointment date must be a valid date string',
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}