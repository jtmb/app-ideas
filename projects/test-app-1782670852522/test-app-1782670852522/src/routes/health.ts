import { Router, Request, Response } from 'express';
import sqlite3 from 'better-sqlite3';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const healthData: {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    nodeVersion: string;
    dependencies: {
      sqlite: 'ok' | 'error';
      express: 'ok' | 'error';
    };
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    dependencies: {
      sqlite: 'error',
      express: 'ok',
    },
  };

  try {
    const db = new sqlite3(':memory:');
    healthData.dependencies.sqlite = 'ok';
    db.close();
  } catch (_err) {
    healthData.status = 'unhealthy';
    healthData.dependencies.sqlite = 'error';
  }

  if (healthData.status === 'unhealthy') {
    return res.status(503).json({ error: { code: 'UNHEALTHY', message: 'Health check failed' } });
  }

  res.status(200).json({ health: healthData });
});

export default router;
