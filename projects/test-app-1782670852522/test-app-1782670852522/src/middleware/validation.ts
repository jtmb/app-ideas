import { Request, Response, NextFunction } from 'express';

export const validateItemInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, description } = req.body;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name is required and must be a non-empty string',
      },
    });
  }

  // Validate name length (max 256 characters)
  if (name.length > 256) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Name must not exceed 256 characters',
      },
    });
  }

  // Validate description if provided
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Description must be a string or omitted',
      },
    });
  }

  // Sanitize input (basic trimming)
  req.body.name = name.trim();
  if (description) {
    req.body.description = description.trim();
  }

  next();
};
