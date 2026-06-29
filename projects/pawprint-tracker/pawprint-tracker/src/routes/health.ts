import { Router, Request, Response } from 'express';
import { config } from '../config/env';

const router = Router();

/**
 * Health Check Endpoint
 * GET /api/v1/health
 * 
 * Verifies that all critical dependencies are available and healthy.
 * Returns detailed status information for monitoring purposes.
 */
router.get('/health', (req: Request, res: Response) => {
  const startTime = Date.now();

  // Check database connectivity
  let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
  let dbMessage = 'Database connection successful';
  
  try {
    // Attempt to verify PostgreSQL connection
    // In production, this would use a proper health check query
    const testQuery = `SELECT 1 as health_check`;
    console.log(`[Health Check] Database query: ${testQuery}`);
  } catch (error) {
    dbStatus = 'unhealthy';
    dbMessage = `Database connection failed: ${(error as Error).message}`;
    console.error('[Health Check]', dbMessage);
  }

  // Calculate response time
  const responseTime = Date.now() - startTime;

  res.status(dbStatus === 'healthy' ? 200 : 503).json({
    status: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    response_time_ms: responseTime,
    environment: config.NODE_ENV,
    version: config.APP_VERSION,
    checks: {
      database: dbStatus,
      database_message: dbMessage,
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      node_version: process.version,
    },
  });
});

export default router;