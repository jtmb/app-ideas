import express, { Application, Request, Response } from 'express';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import itemsRoutes from './routes/items';
import testItemRoutes from './routes/test-items';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.use('/health', healthRoutes);

// API v1 routes
app.use('/api/v1/items', itemsRoutes);
app.use('/api/v1/test-items', testItemRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Error handler middleware
app.use(errorHandler);

export default app;
