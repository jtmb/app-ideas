import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 * Returns application health status
 */
router.get('/health', (req: Request, res: Response) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
    },
  };

  res.status(200).json({
    error: {
      code: 'OK',
      message: 'Service is healthy',
    },
    data: healthStatus,
  });
});

export default router;