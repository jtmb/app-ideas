import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import healthRoutes from '../routes/health.routes';
import devicesRoutes from '../routes/devices.routes';
import energyRoutes from '../routes/energy.routes';
import analyticsRoutes from '../routes/analytics.routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } }
});
app.use('/api/', limiter);

// Strict rate limiting for auth endpoints (if added later)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: { code: 'AUTH_RATE_LIMITED', message: 'Too many authentication attempts.' } }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check route
app.use('/api/health', healthRoutes);

// API routes
app.use('/api/devices', devicesRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    name: 'EcoHome Monitor API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      devices: '/api/devices',
      energy: '/api/energy',
      analytics: '/api/analytics'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found` } });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    error: { 
      code: 'INTERNAL_SERVER_ERROR', 
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred' 
    } 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`EcoHome Monitor API server running on port ${PORT}`);
});

export default app;