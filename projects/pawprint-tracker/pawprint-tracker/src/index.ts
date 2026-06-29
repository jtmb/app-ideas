/**
 * PawPrint Tracker — Main Application Entry Point
 * 
 * A comprehensive pet health management system built with Node.js, Express, and TypeScript.
 * Tracks pets, vaccinations, vet visits, medications, and health journal entries.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import healthRoutes from './routes/health';

// Create Express application
const app = express();

/**
 * Application Configuration
 */
app.set('trust proxy', true); // Trust reverse proxies for IP detection
app.set('view engine', 'ejs');
app.set('views', process.cwd() + '/views');

/**
 * Security Middleware
 * Helmet sets various HTTP headers to improve security
 */
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development; configure in production
  crossOriginEmbedderPolicy: false,
}));

/**
 * CORS Configuration
 * Allows requests from specified origins
 */
app.use(cors({
  origin: config.CORS_CONFIG.ALLOWED_ORIGINS.split(','),
  credentials: config.CORS_CONFIG.ALLOW_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: config.CORS_CONFIG.MAX_AGE,
}));

/**
 * Rate Limiting
 * Prevents abuse by limiting requests per IP address
 */
const limiter = rateLimit({
  windowMs: config.API_CONFIG.RATE_LIMIT_WINDOW_MS,
  max: config.API_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all routes
app.use(limiter);

/**
 * Request Logging
 * Morgan logs HTTP requests for debugging and monitoring
 */
const logFormat = config.LOG_CONFIG.FORMAT === 'json'
  ? 'dev' // Morgan JSON format
  : ':method :url :status :res[content-length] - :response-time ms';

app.use(morgan(logFormat, {
  skip: config.LOG_CONFIG.LEVEL === 'error' ? (req: express.Request) => req.res?.statusCode >= 400 : false,
}));

/**
 * Body Parsing Middleware
 * Parses JSON and URL-encoded request bodies
 */
app.use(express.json({ limit: '10kb' })); // Limit to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * Health Check Route
 * Used for load balancer health checks and monitoring
 */
app.use(`/api/${config.API_CONFIG.VERSION}/health`, healthRoutes);

/**
 * API Routes
 * Mount all API routes under /api/v1 prefix
 */
// TODO: Add other API routes here
// app.use(`/api/${config.API_CONFIG.VERSION}`, apiRoutes);

/**
 * Root Route
 * Returns basic application information
 */
app.get('/', (req, res) => {
  res.json({
    name: config.APP_CONFIG.APP_NAME,
    version: config.APP_CONFIG.APP_VERSION,
    environment: config.APP_CONFIG.NODE_ENV,
    status: 'running',
    uptime: process.uptime(),
  });
});

/**
 * API Documentation Placeholder
 * TODO: Implement OpenAPI/Swagger documentation
 */
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API documentation is not yet available',
    version: config.API_CONFIG.VERSION,
    endpoints: [
      `/api/${config.API_CONFIG.VERSION}/health`,
    ],
  });
});

/**
 * Error Handling Middleware
 * Handles errors that occur during request processing
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log the error for debugging
  console.error('[Error]', err.stack);

  // Return standardized error response
  const statusCode = err.status || 500;
  const message = config.APP_CONFIG.NODE_ENV === 'development'
    ? err.message
    : 'An unexpected error occurred';

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      ...(config.APP_CONFIG.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

/**
 * 404 Handler
 * Handles requests to undefined routes
 */
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

/**
 * Start Server
 * Only start server if this file is run directly (not imported)
 */
if (require.main === module) {
  const server = app.listen(config.APP_CONFIG.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🐾 PawPrint Tracker Server                              ║
║                                                           ║
║   Environment: ${config.APP_CONFIG.NODE_ENV.toUpperCase()}                    ║
║   Port: ${config.APP_CONFIG.PORT}                                    ║
║   Version: ${config.APP_CONFIG.APP_VERSION}                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;