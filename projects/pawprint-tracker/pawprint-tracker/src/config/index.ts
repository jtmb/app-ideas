/**
 * Configuration Module
 * 
 * Centralized configuration exports for the application.
 * All environment variables are loaded via dotenv/config before importing this module.
 */

export { env, validateEnvironment, getEnvConfig } from './env';
export { APP_CONFIG, DB_CONFIG, API_CONFIG, CORS_CONFIG, LOG_CONFIG, FEATURE_FLAGS } from './env';