// Authentication middleware for StudySync AI
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token is empty' } });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid token' } });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' } });
    }
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Authentication failed' } });
  }
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        jwt.verify(token, JWT_SECRET);
        req.user = { id: 'anonymous', email: 'anonymous' };
      }
    }

    next();
  } catch {
    // Token is invalid or expired, but we continue without user context
    next();
  }
}