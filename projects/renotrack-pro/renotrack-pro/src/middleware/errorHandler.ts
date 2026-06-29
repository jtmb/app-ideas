import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Custom Error Class for standardized error handling
 */
class AppError extends Error {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database Error Class for database-specific errors
 */
class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    const errMessage = originalError instanceof Error ? originalError.message : 'Database operation failed';
    super(errMessage, 503, 'DATABASE_ERROR');
  }
}

/**
 * Validation Error Class for input validation failures
 */
class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    const errMessage = field ? `${field}: ${message}` : message;
    super(errMessage, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Not Found Error Class for 404 responses
 */
class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Unauthorized Error Class for authentication failures
 */
class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Forbidden Error Class for authorization failures
 */
class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Conflict Error Class for resource conflicts
 */
class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Rate Limit Exceeded Error
 */
class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error({
    message: 'Unhandled error occurred',
    error: err instanceof Error ? err : new Error(String(err)),
    url: req.url,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErrorCode = err.code;
    
    switch (prismaErrorCode) {
      case 'P2002':
        logger.error({ message: 'Unique constraint violation', field: err.meta?.target });
        res.status(409).json({ error: { code: 'UNIQUE_VIOLATION', message: `The value for ${err.meta?.target?.join(', ')} is already in use` } });
        return;

      case 'P2025':
        logger.error({ message: 'Record not found', model: err.meta?.model });
        res.status(404).json({ error: { code: 'NOT_FOUND', message: `The requested ${err.meta?.model} was not found` } });
        return;

      default:
        logger.error({ message: 'Prisma database error', code: prismaErrorCode, details: err.message });
        res.status(500).json({ error: { code: 'DATABASE_ERROR', message: 'A database error occurred' } });
        return;
    }
  }

  if (err.name === 'ZodError') {
    const fieldErrors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    logger.error({ message: 'Validation error', fields: fieldErrors });
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details: fieldErrors } });
    return;
  }

  if (err.name === 'SyntaxError') {
    logger.error({ message: 'Invalid JSON in request body', url: req.url });
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'The request body contains invalid JSON' } });
    return;
  }

  logger.error({ message: 'Unhandled exception', error: err, stack: err.stack });
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
};

/**
 * Request validation middleware for Zod schemas
 */
export const validateRequest = (schema: any): ((req: Request, res: Response, next: NextFunction) => void | Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({ body: req.body, query: req.query, params: req.params, headers: req.headers });
      next();
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        next(new ValidationError('Invalid request parameters', undefined));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to attach request ID for tracing
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * Middleware to attach timing information for request tracing
 */
export const timingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.startTime = Date.now();
  next();
};

/**
 * Middleware to add response timing header
 */
export const addResponseTimeHeader = (res: Response, next: NextFunction): void => {
  res.on('finish', () => {
    const duration = Date.now() - (req as any).startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  next();
};

export default {
  AppError, DatabaseError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, RateLimitError, errorHandler, validateRequest, requestIdMiddleware, timingMiddleware, addResponseTimeHeader,
};