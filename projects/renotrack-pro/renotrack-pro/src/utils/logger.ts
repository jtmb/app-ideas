import winston from 'winston';
import path from 'path';

/**
 * Winston Logger Configuration
 * Provides structured, colorized logging with file and console outputs
 */

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create log directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  // Development: console only with colors
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    format: logFormat,
    defaultMeta: { service: 'renotrack-pro' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });

  export default logger;
} else {
  // Production: file + console with structured JSON
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? fileFormat : logFormat,
    defaultMeta: { service: 'renotrack-pro' },
    transports: [
      // Console transport for real-time monitoring
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
      // Daily file rotation with max 14 days retention
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 50 * 1024 * 1024, // 50MB
        maxFiles: 14,
        format: fileFormat,
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 50 * 1024 * 1024, // 50MB
        maxFiles: 14,
        format: fileFormat,
      }),
    ],
  });

  export default logger;
}