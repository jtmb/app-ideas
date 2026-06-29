// Authentication middleware
export { authenticate, optionalAuth, authorize } from './auth.middleware';

// Error handling middleware
export {
  errorHandler,
  notFoundHandler,
  validationErrorHandler,
  rateLimitErrorHandler,
  setupErrorHandlers,
  AppError,
} from './error.middleware';