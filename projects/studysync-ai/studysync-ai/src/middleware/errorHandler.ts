import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } });
};

export const validationErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'ZodError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: `Validation failed: ${messages.join(', ')}` } });
  }
  console.error('Validation error:', err);
  return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.' } });
};
