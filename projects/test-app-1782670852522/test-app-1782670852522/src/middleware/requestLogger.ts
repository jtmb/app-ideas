import { Request, Response, NextFunction } from 'express';

export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const headers = JSON.stringify(req.headers);

  console.error(`[${timestamp}] ${method} ${url}`);
  console.error(`Headers: ${headers}`);

  next();
}
