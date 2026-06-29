import { HttpCode } from '../constants/index.js';

/**
 * Application error class for consistent error handling
 */
export class AppError extends Error {
  /** HTTP status code for the error response */
  httpCode: number;

  /** Error code for programmatic handling */
  code: string;

  constructor(code: string, message: string, httpCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpCode = httpCode;
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, HttpCode.NOT_FOUND);
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, HttpCode.UNAUTHORIZED);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, HttpCode.FORBIDDEN);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super('CONFLICT', message, HttpCode.CONFLICT);
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, HttpCode.UNPROCESSABLE_ENTITY);
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, HttpCode.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Bad request error (400)
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super('BAD_REQUEST', message, HttpCode.BAD_REQUEST);
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super('SERVICE_UNAVAILABLE', message, HttpCode.SERVICE_UNAVAILABLE);
  }
}
