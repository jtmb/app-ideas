import { ValidationErrorDetail } from '../types/index.js';

/**
 * Validation rules for test item updates
 */
const VALIDATION_RULES = {
  name: {
    minLength: 1,
    maxLength: 256,
  },
  description: {
    maxLength: 1000,
  },
  tags: {
    maxItems: 10,
  },
};

/**
 * Validate test item update data
 * Returns an array of validation error details if validation fails
 */
export function validateTestItemUpdate(
  updates: Partial<{ name: string; description: string | null; tags: string[] }>
): ValidationErrorDetail[] {
  const errors: ValidationErrorDetail[] = [];

  // Validate name if provided
  if (updates.name !== undefined) {
    const name = updates.name;

    if (typeof name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Name must be a string',
      });
    } else if (name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Name cannot be empty',
      });
    } else if (name.length > VALIDATION_RULES.name.maxLength) {
      errors.push({
        field: 'name',
        message: `Name must not exceed ${VALIDATION_RULES.name.maxLength} characters`,
      });
    }
  }

  // Validate description if provided
  if (updates.description !== undefined) {
    const description = updates.description;

    if (description !== null && typeof description !== 'string') {
      errors.push({
        field: 'description',
        message: 'Description must be a string or null',
      });
    } else if (description !== null && description.length > VALIDATION_RULES.description.maxLength) {
      errors.push({
        field: 'description',
        message: `Description must not exceed ${VALIDATION_RULES.description.maxLength} characters`,
      });
    }
  }

  // Validate tags if provided
  if (updates.tags !== undefined) {
    const tags = updates.tags;

    if (!Array.isArray(tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
      });
    } else if (tags.length > VALIDATION_RULES.tags.maxItems) {
      errors.push({
        field: 'tags',
        message: `Tags must not exceed ${VALIDATION_RULES.tags.maxItems} items`,
      });
    }
  }

  return errors;
}
