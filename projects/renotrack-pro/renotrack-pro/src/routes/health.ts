import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    await prisma.$connect();
    const version = await prisma.$queryRawUnsafe('SELECT version()');
    const duration = Date.now() - startTime;
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        version: String(version[0]?.version || 'unknown'),
        checkDuration: duration,
      },
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      checkDuration: duration,
    });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
