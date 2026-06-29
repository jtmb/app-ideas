// Validation middleware for StudySync AI
import { Request, Response, NextFunction } from 'express';

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return EMAIL_REGEX.test(email);
}

/**
 * Validates password strength (min 8 chars, at least one letter and one number)
 */
export function validatePassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Middleware to validate request body against schema
 */
export function validateBody(schema: Record<string, (value: unknown) => boolean | string>): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {};

    for (const [field, validator] of Object.entries(schema)) {
      const value = req.body[field];
      
      if (value === undefined || value === null) {
        errors[field] = `Field "${field}" is required`;
        continue;
      }

      const result = validator(value);
      
      if (result === false) {
        errors[field] = `Invalid ${field}`;
      } else if (typeof result === 'string') {
        errors[field] = result;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors } });
    }

    next();
  };
}

/**
 * Pre-validated email schema for user creation
 */
export const createUserSchema = {
  email: (value: unknown) => {
    if (typeof value !== 'string') return 'Email must be a string';
    if (!validateEmail(value)) return 'Invalid email format';
    return true;
  },
  password: (value: unknown) => {
    if (typeof value !== 'string') return 'Password must be a string';
    if (!validatePassword(value)) return 'Password must be at least 8 characters and contain both letters and numbers';
    return true;
  },
};
/**
 * Validates Study Goal ID format (UUID)
 */
export function validateStudyGoalId(id: string): boolean {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(id);
}

/**
 * Middleware to validate Study Goal ID parameter
 */
export function validateStudyGoalIdMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;
    
    if (!validateStudyGoalId(id)) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid study goal ID format' } });
    }
    
    next();
  };
}
