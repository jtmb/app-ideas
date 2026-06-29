import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function errorHandler(
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let error: ErrorResponse;

  if (typeof err === 'object' && err !== null) {
    error = err as ErrorResponse;
  } else {
    error = {
      code: 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: { stack: err.stack },
    };
  }

  // Remove sensitive details from production
  if (process.env.NODE_ENV === 'production') {
    delete error.details;
  }

  res.status(error.code === 'INTERNAL_ERROR' ? 500 : 400).json({
    error,
  });
}
