import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: ['Authentication required'] } });
  }

  const token = authHeader.substring(7);

  if (!token || token.length === 0) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: ['Invalid token'] } });
  }

  req.user = { id: 'user-123' };
  next();
}
