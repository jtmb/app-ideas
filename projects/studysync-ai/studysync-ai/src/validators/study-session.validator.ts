/**
 * Study Session Validators
 * Input validation for study session endpoints
 */

import { StudySessionUpdateInput } from '../models/StudySession';

// ============================================================================
// Validation Rules
// ============================================================================

export const validateStudySessionUpdate = (
  data: Partial<StudySessionUpdateInput>
): string[] => {
  const errors: string[] = [];

  // Validate durationMinutes if provided
  if (data.durationMinutes !== undefined) {
    if (typeof data.durationMinutes !== 'number') {
      errors.push('durationMinutes must be a number');
    } else if (data.durationMinutes <= 0) {
      errors.push('durationMinutes must be greater than 0');
    } else if (data.durationMinutes > 24 * 60) {
      errors.push('durationMinutes cannot exceed 24 hours (1440 minutes)');
    }
  }

  // Validate endTime if provided
  if (data.endTime !== undefined) {
    if (!(data.endTime instanceof Date)) {
      errors.push('endTime must be a valid Date object');
    } else if (isNaN(data.endTime.getTime())) {
      errors.push('endTime is an invalid date');
    }
  }

  // Validate notes if provided
  if (data.notes !== undefined) {
    if (typeof data.notes !== 'string') {
      errors.push('notes must be a string');
    } else if (data.notes.length > 1000) {
      errors.push('notes cannot exceed 1000 characters');
    }
  }

  return errors;
};

// ============================================================================
// Export Validation Function
// ============================================================================

export { validateStudySessionUpdate };
