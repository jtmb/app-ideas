import 'dotenv/config';

/**
 * Environment Configuration Module
 * 
 * Centralized environment variable management following 12-factor app principles.
 * All configuration is loaded from environment variables at startup.
 * Never commit secrets to version control.
 */

// Application settings
export const APP_CONFIG = {
  /** Application name and version */
  APP_NAME: process.env.APP_NAME || 'PawPrint Tracker',
  APP_VERSION: process.env.APP_VERSION || '1.0.0',
  
  /** Node.js environment: development, staging, or production */
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
  
  /** Port the application listens on */
  PORT: parseInt(process.env.PORT || '3000', 10),
};

// Database configuration
export const DB_CONFIG = {
  /** PostgreSQL connection string */
  CONNECTION_STRING: process.env.DATABASE_URL || '',
  
  /** Database host */
  HOST: process.env.DB_HOST || 'localhost',
  
  /** Database port */
  PORT: parseInt(process.env.DB_PORT || '5432', 10),
  
  /** Database name */
  NAME: process.env.DB_NAME || 'pawprint_tracker',
  
  /** Database user */
  USER: process.env.DB_USER || 'postgres',
  
  /** Database password */
  PASSWORD: process.env.DB_PASSWORD || '',
};

// API configuration
export const API_CONFIG = {
  /** API version for URL paths */
  VERSION: process.env.API_VERSION || 'v1',
  
  /** Rate limiting configuration */
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

// CORS configuration
export const CORS_CONFIG = {
  /** Allowed origins (comma-separated) */
  ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS || '*',
  
  /** Allow credentials for cross-origin requests */
  ALLOW_CREDENTIALS: process.env.CORS_ALLOW_CREDENTIALS === 'true',
  
  /** Max age for preflight cache */
  MAX_AGE: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
};

// Logging configuration
export const LOG_CONFIG = {
  /** Log level: error, warn, info, debug, verbose */
  LEVEL: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' | 'verbose') || 'info',
  
  /** Output format: json or text */
  FORMAT: (process.env.LOG_FORMAT as 'json' | 'text') || 'text',
};

// Feature flags
export const FEATURE_FLAGS = {
  /** Enable authentication middleware */
  AUTH_ENABLED: process.env.AUTH_ENABLED === 'true',
  
  /** Enable rate limiting */
  RATE_LIMITING_ENABLED: process.env.RATE_LIMITING_ENABLED === 'true',
  
  /** Enable request logging */
  REQUEST_LOGGING_ENABLED: process.env.REQUEST_LOGGING_ENABLED === 'true',
};

/**
 * Validate required environment variables
 * Throws an error if critical configuration is missing
 */
export function validateEnvironment(): void {
  const errors: string[] = [];

  // Database connection is required in all environments
  if (!DB_CONFIG.CONNECTION_STRING) {
    errors.push('DATABASE_URL is required');
  }

  // Port must be a valid number
  if (isNaN(APP_CONFIG.PORT)) {
    errors.push(`PORT must be a valid number, got: ${process.env.PORT}`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map(e => `- ${e}`).join('\n')}`
    );
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvConfig(): {
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
} {
  switch (APP_CONFIG.NODE_ENV) {
    case 'development':
      return { isDevelopment: true, isProduction: false, isStaging: false };
    case 'staging':
      return { isDevelopment: false, isProduction: false, isStaging: true };
    case 'production':
      return { isDevelopment: false, isProduction: true, isStaging: false };
    default:
      return { isDevelopment: true, isProduction: false, isStaging: false };
  }
}

/**
 * Environment configuration object (exported for convenience)
 */
export const env = {
  app: APP_CONFIG,
  database: DB_CONFIG,
  api: API_CONFIG,
  cors: CORS_CONFIG,
  logging: LOG_CONFIG,
  features: FEATURE_FLAGS,
};

/**
 * Default export for backward compatibility
 */
export default env;