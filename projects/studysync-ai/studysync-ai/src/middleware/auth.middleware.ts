import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Verifies JWT token and attaches user to request
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. No token provided.',
        },
      });
    }

    // Check for Bearer prefix
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid authorization header format. Expected "Bearer <token>"',
        },
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Token is empty.',
        },
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      iat?: number;
      exp?: number;
    };

    if (!decoded.id || !decoded.email) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token payload. Missing required claims.',
        },
      });
    }

    // Check if user exists in database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found. Token may be invalid.',
        },
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token has expired. Please login again.',
        },
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token. Please check your credentials.',
        },
      });
    }

    // Unexpected error - log and return 500
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred during authentication.',
      },
    });
  }
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No token - user is anonymous
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const token = parts[1];

    if (!token) {
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    if (!decoded.id || !decoded.email) {
      return next();
    }

    // Check if user exists in database
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth - just don't attach user
    return next();
  }
};

/**
 * Authorize user to have specific role
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    // Check user roles (extend User model to include roles field)
    if (!roles.includes('user')) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.',
        },
      });
    }

    next();
  };
};