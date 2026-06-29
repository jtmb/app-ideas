import { Request, Response, NextFunction } from 'express';

/**
 * Standardized error interface for API responses
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

/**
 * Error handler middleware for AppError instances
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If it's already an AppError, use its properties
  let error = err as AppError;

  if (!(err instanceof AppError)) {
    // Handle unexpected errors
    console.error('Unhandled error:', err);

    error = new AppError(
      'INTERNAL_ERROR',
      'An unexpected error occurred. Please try again later.',
      { originalError: (err as Error).message }
    );
  }

  // Don't expose internal details to users in production
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(error.code === 'INTERNAL_ERROR' || error.code === 'NOT_FOUND' ? 500 : 400).json({
    error: {
      code: error.code,
      message: isProduction ? error.message : error.message, // In dev, show full message
      ...(error.details && { details: error.details }),
    },
  });
};

/**
 * Not found handler for 404 errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (err: Error, res: Response): void => {
  // Handle Joi validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          errors: messages,
        },
      },
    });
  } else if (err.name === 'BadDataError') {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
  } else {
    // Unknown validation error - pass to main error handler
    next(err);
  }
};

/**
 * Rate limit error handler
 */
export const rateLimitErrorHandler = (err: Error, res: Response): void => {
  if (err.message === 'Too many requests') {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: 60, // seconds
      },
    });
  } else {
    next(err);
  }
};

/**
 * Global error handling setup
 */
export const setupErrorHandlers = (app: any): void => {
  app.use(errorHandler);
  app.use(notFoundHandler);
};